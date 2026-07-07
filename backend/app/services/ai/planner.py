import json
import re
from typing import Dict, Any, List
from app.services.ai.provider import AIProvider
from app.services.ai.prompts import WORKFLOW_DETECTION_PROMPT, PLANNING_PROMPT


WORKFLOW_PATTERNS = {
    "onboarding": [
        r"(?i)(?:accept(?:ed|s)?\s+(?:the\s+)?offer)",
        r"(?i)hire\s+\w+",
        r"(?i)new\s+(?:employee|hire|joinee)",
        r"(?i)joining",
        r"(?i)onboard",
    ],
    "recruitment": [
        r"(?i)need\s+(?:to\s+)?hire",
        r"(?i)job\s+(?:posting|opening|vacancy)",
        r"(?i)recruit",
        r"(?i)interview",
        r"(?i)candidate",
    ],
    "leave": [
        r"(?i)(?:request|appl(?:y|ied))\s+(?:for\s+)?leave",
        r"(?i)leave\s+(?:request|balance|approved?)",
        r"(?i)(?:sick|annual|personal|maternity|paternity)\s+leave",
        r"(?i)(?:vacation|time\s+off)",
        r"(?i)requested\s+leave",
        r"(?i)wants?\s+(?:to\s+)?take\s+(?:a\s+)?(?:leave|off)",
    ],
    "exit": [
        r"(?i)resign(?:ed|s|ing)?",
        r"(?i)quit(?:ting)?",
        r"(?i)terminat(?:ion|e|ed)",
        r"(?i)exit",
        r"(?i)leaving\s+(?:the\s+)?company",
        r"(?i)submit(?:ted)?\s+(?:resignation|notice)",
    ],
    "performance": [
        r"(?i)review\s+\w+",
        r"(?i)performance\s+(?:review|feedback|report)",
        r"(?i)appraisal",
        r"(?i)evaluat(?:e|ion)",
    ],
    "promotion": [
        r"(?i)promot(?:e|ion|ed)",
        r"(?i)promotion",
        r"(?i)salary\s+revis(?:e|ion)",
    ],
    "training": [
        r"(?i)train(?:ing)?",
        r"(?i)learning\s+plan",
        r"(?i)skill\s+(?:development|upgrade)",
        r"(?i)course",
    ],
    "payroll": [
        r"(?i)payroll",
        r"(?i)salary\s+(?:issue|problem|discrepancy|correction)",
        r"(?i)pay\s+(?:issue|problem)",
    ],
}

ENTITIES_PATTERNS = {
    "person_name": r"(?i)(?:hire|for|to|by|of|:)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)",
    "position": r"(?i)(?:as\s+a(?:n)?|position\s+(?:of\s+)?|role\s+(?:of\s+)?):?\s+([A-Za-z\s]+)",
    "department": r"(?i)(?:in\s+the|department\s+(?:of\s+)?):?\s+([A-Za-z\s]+)",
}


class WorkflowPlanner:
    def __init__(self, provider: AIProvider):
        self.provider = provider
        self.use_ai = True

    def set_use_ai(self, use_ai: bool):
        self.use_ai = use_ai

    async def detect_workflow(self, event: str) -> Dict[str, Any]:
        if self.use_ai:
            try:
                prompt = WORKFLOW_DETECTION_PROMPT.format(event=event)
                response = await self.provider.chat([
                    {"role": "system", "content": "You are an AI HR Operations Manager. Analyze business events and determine the appropriate workflow. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ], temperature=0.3)
                result = self._parse_json_response(response)
                if "error" not in result:
                    return result
            except Exception:
                pass

        return self._rule_based_detection(event)

    async def generate_plan(self, workflow_type: str, context: Dict[str, Any], available_tools: List[Dict[str, Any]]) -> Dict[str, Any]:
        if self.use_ai:
            try:
                tools_str = json.dumps(available_tools, indent=2)
                context_str = json.dumps(context, indent=2)
                prompt = PLANNING_PROMPT.format(
                    workflow_type=workflow_type,
                    context=context_str,
                    available_tools=tools_str
                )
                response = await self.provider.chat([
                    {"role": "system", "content": "You are an AI workflow planner. Generate detailed step-by-step execution plans. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ], temperature=0.3)
                result = self._parse_json_response(response)
                if "error" not in result:
                    return result
            except Exception:
                pass

        return self._get_predefined_plan(workflow_type, context)

    def _rule_based_detection(self, event: str) -> Dict[str, Any]:
        for wf_type, patterns in WORKFLOW_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, event):
                    entities = self._extract_entities(event)
                    return {
                        "workflow_type": wf_type,
                        "confidence": 0.8,
                        "reasoning": f"Event matched keyword pattern for {wf_type}",
                        "entities": entities,
                        "summary": f"Execute {wf_type} workflow for: {event}"
                    }

        return {
            "workflow_type": "onboarding",
            "confidence": 0.5,
            "reasoning": "Default workflow based on generic hiring/employee event",
            "entities": self._extract_entities(event),
            "summary": f"Process event: {event}"
        }

    def _extract_entities(self, event: str) -> Dict[str, str]:
        entities = {}
        for key, pattern in ENTITIES_PATTERNS.items():
            match = re.search(pattern, event)
            if match:
                entities[key] = match.group(1).strip()
        return entities

    def _get_predefined_plan(self, workflow_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
        entities = context.get("entities", {})
        person = entities.get("person_name", "Employee")
        position = entities.get("position", "Team Member")
        department = entities.get("department", "Engineering")

        plans = {
            "onboarding": {
                "plan": [
                    {"step": 1, "module": "onboarding", "tool": "create_employee", "parameters": {"full_name": person, "position": position, "department": department}, "description": f"Creating employee profile for {person}"},
                    {"step": 2, "module": "onboarding", "tool": "generate_company_email", "parameters": {"full_name": person}, "description": "Generating company email address"},
                    {"step": 3, "module": "onboarding", "tool": "create_employee_id", "parameters": {"employee_id": ""}, "description": "Creating employee ID"},
                    {"step": 4, "module": "onboarding", "tool": "assign_manager", "parameters": {"employee_id": "", "manager_name": "Department Head"}, "description": "Assigning reporting manager"},
                    {"step": 5, "module": "onboarding", "tool": "allocate_laptop", "parameters": {"employee_name": person}, "description": "Allocating laptop"},
                    {"step": 6, "module": "onboarding", "tool": "schedule_orientation", "parameters": {"employee_name": person}, "description": "Scheduling orientation"},
                    {"step": 7, "module": "onboarding", "tool": "assign_training", "parameters": {"employee_name": person, "position": position}, "description": "Assigning training modules"},
                ],
                "summary": f"Completed onboarding for {person} as {position}",
                "notifications": ["HR", "IT", "Manager"]
            },
            "recruitment": {
                "plan": [
                    {"step": 1, "module": "recruitment", "tool": "create_job_post", "parameters": {"title": position, "department": department}, "description": f"Creating job posting for {position}"},
                    {"step": 2, "module": "recruitment", "tool": "generate_job_description", "parameters": {"position": position, "department": department}, "description": "Generating AI job description"},
                    {"step": 3, "module": "recruitment", "tool": "rank_candidates", "parameters": {"job_id": "", "candidates": []}, "description": "Ranking candidates"},
                    {"step": 4, "module": "recruitment", "tool": "schedule_interview", "parameters": {"candidate_name": person, "position": position}, "description": "Scheduling interviews"},
                    {"step": 5, "module": "recruitment", "tool": "generate_offer_letter", "parameters": {"candidate_name": person, "position": position, "salary": "", "start_date": ""}, "description": "Generating offer letter"},
                ],
                "summary": f"Completed recruitment process for {position}",
                "notifications": ["Hiring Manager", "HR"]
            },
            "leave": {
                "plan": [
                    {"step": 1, "module": "leave", "tool": "verify_leave_balance", "parameters": {"employee_id": person, "leave_type": "annual", "days_requested": 3}, "description": "Verifying leave balance"},
                    {"step": 2, "module": "leave", "tool": "check_team_availability", "parameters": {"employee_id": person}, "description": "Checking team availability"},
                    {"step": 3, "module": "leave", "tool": "approve_leave", "parameters": {"employee_id": person, "leave_type": "annual", "start_date": "", "end_date": ""}, "description": "Approving leave request"},
                ],
                "summary": f"Processed leave request for {person}",
                "notifications": ["Manager", "Team Lead"]
            },
            "exit": {
                "plan": [
                    {"step": 1, "module": "exit", "tool": "create_exit_checklist", "parameters": {"employee_name": person, "employee_id": person}, "description": "Creating exit checklist"},
                    {"step": 2, "module": "exit", "tool": "request_asset_return", "parameters": {"employee_name": person}, "description": "Requesting asset returns"},
                    {"step": 3, "module": "exit", "tool": "disable_accounts", "parameters": {"employee_name": person}, "description": "Disabling all accounts"},
                    {"step": 4, "module": "exit", "tool": "generate_experience_letter", "parameters": {"employee_name": person, "position": position}, "description": "Generating experience letter"},
                    {"step": 5, "module": "exit", "tool": "initiate_recruitment", "parameters": {"position": position, "department": department}, "description": "Initiating replacement recruitment"},
                ],
                "summary": f"Completed exit process for {person}",
                "notifications": ["IT", "Finance", "HR", "Manager"]
            },
            "performance": {
                "plan": [
                    {"step": 1, "module": "performance", "tool": "collect_metrics", "parameters": {"employee_id": person, "employee_name": person}, "description": "Collecting performance metrics"},
                    {"step": 2, "module": "performance", "tool": "generate_review", "parameters": {"employee_id": person, "employee_name": person, "position": position}, "description": "Generating AI performance review"},
                    {"step": 3, "module": "performance", "tool": "recommend_improvements", "parameters": {"employee_id": person}, "description": "Recommending improvements"},
                ],
                "summary": f"Completed performance review for {person}",
                "notifications": ["Manager", "Employee"]
            },
            "promotion": {
                "plan": [
                    {"step": 1, "module": "promotion", "tool": "evaluate_promotion", "parameters": {"employee_name": person, "current_position": position}, "description": "Evaluating promotion eligibility"},
                    {"step": 2, "module": "promotion", "tool": "calculate_salary_revision", "parameters": {"employee_name": person, "current_salary": 0}, "description": "Calculating salary revision"},
                    {"step": 3, "module": "promotion", "tool": "generate_promotion_letter", "parameters": {"employee_name": person, "current_position": position, "new_position": f"Senior {position}"}, "description": "Generating promotion letter"},
                ],
                "summary": f"Processed promotion for {person}",
                "notifications": ["HR", "Finance", "Manager"]
            },
            "training": {
                "plan": [
                    {"step": 1, "module": "training", "tool": "generate_learning_plan", "parameters": {"employee_name": person, "position": position}, "description": "Generating AI learning plan"},
                    {"step": 2, "module": "training", "tool": "assign_mentor", "parameters": {"employee_name": person}, "description": "Assigning mentor"},
                    {"step": 3, "module": "training", "tool": "track_progress", "parameters": {"employee_id": person}, "description": "Setting up progress tracking"},
                ],
                "summary": f"Created training plan for {person}",
                "notifications": ["Employee", "Mentor"]
            },
            "payroll": {
                "plan": [
                    {"step": 1, "module": "payroll", "tool": "detect_salary_issue", "parameters": {"employee_name": person}, "description": "Detecting salary issues"},
                    {"step": 2, "module": "payroll", "tool": "verify_attendance", "parameters": {"employee_id": person}, "description": "Verifying attendance records"},
                    {"step": 3, "module": "payroll", "tool": "verify_leave", "parameters": {"employee_id": person}, "description": "Verifying leave records"},
                    {"step": 4, "module": "payroll", "tool": "calculate_correction", "parameters": {"employee_id": person, "issue": "", "adjustment_amount": 0}, "description": "Calculating salary correction"},
                ],
                "summary": f"Resolved payroll exception for {person}",
                "notifications": ["Finance", "Employee"]
            },

        }

        return plans.get(workflow_type, plans["onboarding"])

    def _parse_json_response(self, response: str) -> Dict[str, Any]:
        try:
            cleaned = response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            return json.loads(cleaned.strip())
        except json.JSONDecodeError:
            return {"error": "Failed to parse AI response", "raw": response}
