from typing import Dict, Any, Optional
from app.db.database import get_supabase
from app.config import settings
from app.services.ai.provider import AIProvider
from app.services.ai.planner import WorkflowPlanner
from app.services.ai.tool_executor import ToolExecutor, ToolRegistry
from app.services.ai.groq_provider import GroqProvider
from datetime import datetime
import uuid


class AIService:
    def __init__(self):
        self.provider: Optional[AIProvider] = None
        self.planner: Optional[WorkflowPlanner] = None
        self.registry = ToolRegistry()
        self.executor = ToolExecutor(self.registry)
        self._initialize_provider()

    def _initialize_provider(self):
        if settings.ai_provider == "groq":
            self.provider = GroqProvider()
        else:
            self.provider = GroqProvider()

        self.planner = WorkflowPlanner(self.provider)

    def register_tools(self, tools_module):
        pass

    async def process_event(self, event: str) -> Dict[str, Any]:
        supabase = get_supabase()

        workflow_id = str(uuid.uuid4())

        workflow = {
            "id": workflow_id,
            "event": event,
            "status": "planning",
            "created_at": datetime.utcnow().isoformat()
        }
        supabase.table("workflow_logs").insert(workflow).execute()

        detection = await self.planner.detect_workflow(event)

        workflow_type = detection.get("workflow_type", "unknown")
        
        valid_workflows = ["recruitment", "onboarding", "leave", "training", "performance", "promotion", "payroll", "exit"]
        if workflow_type not in valid_workflows:
            # Query the LLM to generate a casual, HR-dashboard-scoped reply
            messages = [
                {
                    "role": "system",
                    "content": (
                        "You are the AI HR Operations Manager of this organisation's HR dashboard. "
                        "You can talk casually and be friendly, but you can ONLY assist with work and actions related "
                        "directly to this HR dashboard (employee onboarding, leave requests, training roadmaps, performance "
                        "reviews, promotions, payroll, exit processes).\n\n"
                        "Rules:\n"
                        "1. If the user asks a question about any specific employee (e.g., their position, leaves, rating, "
                        "compensation, details), do not print their raw details here. Politely tell them to navigate to the "
                        "appropriate page on the dashboard to view that information. Provide the exact path and URL:\n"
                        "   - Employee profiles: Employees page (http://localhost:3001/dashboard/employees)\n"
                        "   - Leave status/history: Leave page (http://localhost:3001/dashboard/leave)\n"
                        "   - Onboarding state: Onboarding page (http://localhost:3001/dashboard/onboarding)\n"
                        "   - Active learning programs: Training page (http://localhost:3001/dashboard/training)\n"
                        "   - Performance evaluations: Performance page (http://localhost:3001/dashboard/performance)\n"
                        "   - Promotions & salary revisions: Promotion page (http://localhost:3001/dashboard/promotion)\n"
                        "   - Biometric payroll adjustments: Payroll page (http://localhost:3001/dashboard/payroll)\n"
                        "   - Exit processes: Exit page (http://localhost:3001/dashboard/exit)\n"
                        "2. If they ask questions unrelated to this HR dashboard (e.g. general knowledge, math, coding, general "
                        "questions), politely decline and state that you are an operations assistant for this HR dashboard.\n"
                        "3. If they say hello, hi, greet you, or talk casually, reply in a friendly manner and list some of "
                        "the HR operations you can execute (e.g. 'Hire Vikram as DevOps Developer', 'Priya requested leave', "
                        "'Review Rohit performance')."
                    )
                },
                {"role": "user", "content": event}
            ]
            try:
                summary = await self.provider.chat(messages, temperature=0.7)
            except Exception as e:
                summary = f"Error generating conversational reply: {str(e)}"
                
            supabase.table("workflow_logs").update({
                "workflow_type": "unknown",
                "detection_data": detection,
                "status": "completed",
                "completed_at": datetime.utcnow().isoformat(),
                "summary": summary
            }).eq("id", workflow_id).execute()
            
            return {
                "workflow_id": workflow_id,
                "event": event,
                "workflow_type": "unknown",
                "status": "completed",
                "steps": [],
                "summary": summary
            }

        supabase.table("workflow_logs").update({
            "workflow_type": workflow_type,
            "detection_data": detection
        }).eq("id", workflow_id).execute()

        available_tools = self.registry.list_tools()
        
        # Populate organization context to guide the LLM planner
        planner_context = dict(detection)
        try:
            emp_res = supabase.table("employees").select("employee_id", "full_name", "position", "department").eq("status", "active").execute()
            planner_context["active_employees"] = emp_res.data
        except Exception:
            pass

        plan_data = await self.planner.generate_plan(
            workflow_type=workflow_type,
            context=planner_context,
            available_tools=available_tools
        )


        steps = plan_data.get("plan", [])
        step_records = []
        for step in steps:
            step_id = str(uuid.uuid4())
            step_record = {
                "id": step_id,
                "workflow_id": workflow_id,
                "module": step.get("module", ""),
                "action": step.get("tool", ""),
                "status": "pending",
                "details": step.get("description", ""),
                "parameters": step.get("parameters", {}),
                "created_at": datetime.utcnow().isoformat()
            }
            supabase.table("workflow_steps").insert(step_record).execute()
            step["id"] = step_id
            step_record["step_number"] = step.get("step", 1)
            step_records.append(step_record)

        supabase.table("workflow_logs").update({
            "status": "in_progress",
            "plan": plan_data
        }).eq("id", workflow_id).execute()

        execution_results = []
        for i, step_record in enumerate(step_records):
            supabase.table("workflow_steps").update({
                "status": "in_progress",
                "started_at": datetime.utcnow().isoformat()
            }).eq("id", step_record["id"]).execute()

            # Resolve dynamic parameters from previous execution outputs
            resolved_params = self.executor.resolve_parameters(
                step_record.get("parameters", {}),
                execution_results
            )

            result = await self.executor.execute_step(
                module=step_record["module"],
                tool=step_record["action"],
                parameters=resolved_params
            )

            execution_results.append(result)


            step_status = "completed" if result["success"] else "failed"
            supabase.table("workflow_steps").update({
                "status": step_status,
                "completed_at": datetime.utcnow().isoformat(),
                "result": result
            }).eq("id", step_record["id"]).execute()

        all_success = all(r["success"] for r in execution_results)
        final_status = "completed" if all_success else "failed"

        supabase.table("workflow_logs").update({
            "status": final_status,
            "completed_at": datetime.utcnow().isoformat(),
            "summary": plan_data.get("summary", "Workflow execution completed")
        }).eq("id", workflow_id).execute()

        return {
            "workflow_id": workflow_id,
            "event": event,
            "workflow_type": workflow_type,
            "status": final_status,
            "steps": [
                {
                    "id": s["id"],
                    "workflow_id": s["workflow_id"],
                    "module": s["module"],
                    "action": s["action"],
                    "status": "completed" if r["success"] else "failed",
                    "details": s.get("details", ""),
                    "result": r
                }
                for s, r in zip(step_records, execution_results)
            ],

            "summary": plan_data.get("summary", "Workflow completed")
        }

    def get_provider(self) -> AIProvider:
        return self.provider
