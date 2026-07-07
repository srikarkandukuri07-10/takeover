import asyncio
import re
from typing import Dict, Any, Callable, List
from datetime import datetime


class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, Callable] = {}
        self._tool_metadata: Dict[str, Dict[str, Any]] = {}

    def register(self, name: str, func: Callable, module: str, description: str = ""):
        import inspect
        self._tools[name] = func
        
        # Inspect parameters
        sig = inspect.signature(func)
        params = list(sig.parameters.keys())
        
        self._tool_metadata[name] = {
            "name": name,
            "module": module,
            "description": description,
            "parameters": params
        }

    def get(self, name: str) -> Callable:
        return self._tools.get(name)

    def get_metadata(self, name: str) -> Dict[str, Any]:
        return self._tool_metadata.get(name, {})

    def list_tools(self) -> List[Dict[str, Any]]:
        return list(self._tool_metadata.values())


class ToolExecutor:
    def __init__(self, registry: ToolRegistry):
        self.registry = registry

    def resolve_parameters(self, parameters: Dict[str, Any], previous_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        # 1. Build resolution context from previous steps
        context = {}
        for idx, prev_res in enumerate(previous_results):
            if prev_res.get("success") and isinstance(prev_res.get("result"), dict):
                res_dict = prev_res["result"]
                # Flat keys (latest wins)
                context.update(res_dict)
                # Keyed by tool name
                tool_name = prev_res.get("tool")
                if tool_name:
                    context[tool_name] = res_dict
                # Keyed by step number
                step_num = idx + 1
                context[f"step_{step_num}"] = res_dict

        # 2. Resolve each parameter
        resolved = {}
        for key, val in parameters.items():
            if val == "" or val is None:
                # Automatic name-based fallback (e.g. employee_id -> context['employee_id'])
                if key in context and not isinstance(context[key], dict):
                    resolved[key] = context[key]
                else:
                    resolved[key] = val
            elif isinstance(val, str):
                resolved_val = val
                # Match {{...}} patterns
                placeholders = re.findall(r"\{\{([^}]+)\}\}", val)
                for placeholder in placeholders:
                    placeholder = placeholder.strip()
                    if "." in placeholder:
                        parts = placeholder.split(".")
                        obj = context
                        for part in parts:
                            if isinstance(obj, dict) and part in obj:
                                obj = obj[part]
                            else:
                                obj = None
                                break
                        if obj is not None:
                            resolved_val = resolved_val.replace(f"{{{{{placeholder}}}}}", str(obj))
                    elif placeholder in context:
                        resolved_val = resolved_val.replace(f"{{{{{placeholder}}}}}", str(context[placeholder]))
                
                # Check for $ prefix syntax
                if resolved_val.startswith("$"):
                    path = resolved_val[1:]
                    if "." in path:
                        parts = path.split(".")
                        obj = context
                        for part in parts:
                            if isinstance(obj, dict) and part in obj:
                                obj = obj[part]
                            else:
                                obj = None
                                break
                        if obj is not None:
                            resolved_val = obj
                    elif path in context:
                        resolved_val = context[path]

                resolved[key] = resolved_val
            else:
                resolved[key] = val
                
        return resolved


    async def execute_step(self, module: str, tool: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        tool_func = self.registry.get(tool)
        if not tool_func:
            return {
                "success": False,
                "error": f"Tool '{tool}' not found in module '{module}'"
            }

        try:
            # Map parameters dynamically to tool arguments based on function signature
            import inspect
            sig = inspect.signature(tool_func)
            func_params = sig.parameters
            
            kwargs = {}
            for param_name, param_obj in func_params.items():
                if param_name in parameters:
                    kwargs[param_name] = parameters[param_name]
                # Aliases / Fallbacks
                elif param_name == "employee_id" and "employee_name" in parameters:
                    kwargs[param_name] = parameters["employee_name"]
                elif param_name == "employee_id" and "employee" in parameters:
                    kwargs[param_name] = parameters["employee"]
                elif param_name == "employee_name" and "employee_id" in parameters:
                    kwargs[param_name] = parameters["employee_id"]
                elif param_name == "employee_name" and "employee" in parameters:
                    kwargs[param_name] = parameters["employee"]
                elif param_name == "employee_id" and "candidate_name" in parameters:
                    kwargs[param_name] = parameters["candidate_name"]
                elif param_name == "employee_name" and "candidate_name" in parameters:
                    kwargs[param_name] = parameters["candidate_name"]
                elif param_name == "current_position" and "position" in parameters:
                    kwargs[param_name] = parameters["position"]
                elif param_name == "position" and "current_position" in parameters:
                    kwargs[param_name] = parameters["current_position"]
                else:
                    if param_obj.default is not inspect.Parameter.empty:
                        kwargs[param_name] = param_obj.default

            if asyncio.iscoroutinefunction(tool_func):
                result = await tool_func(**kwargs)
            else:
                result = tool_func(**kwargs)

            return {
                "success": True,
                "result": result,
                "tool": tool,
                "module": module,
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "tool": tool,
                "module": module,
                "timestamp": datetime.utcnow().isoformat()
            }

    async def execute_plan(self, plan: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        results = []
        for step in plan:
            result = await self.execute_step(
                module=step.get("module", ""),
                tool=step.get("tool", ""),
                parameters=step.get("parameters", {})
            )
            results.append(result)
        return results
