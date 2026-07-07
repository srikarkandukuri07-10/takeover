from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.endpoints import auth, workflow, employees, dashboard, jobs, modules
from app.services.ai.ai_service import AIService
from app.services.recruitment.tools import (
    create_job_post, generate_job_description, rank_candidates,
    schedule_interview, generate_offer_letter,
)
from app.services.onboarding.tools import (
    create_employee, assign_manager, generate_company_email,
    create_employee_id, allocate_laptop, schedule_orientation, assign_training,
)
from app.services.leave.tools import (
    verify_leave_balance, check_team_availability, approve_leave,
    reject_leave, suggest_alternative_dates,
)
from app.services.training.tools import generate_learning_plan, assign_mentor, track_progress
from app.services.performance.tools import collect_metrics, generate_review, recommend_improvements
from app.services.promotion.tools import evaluate_promotion, calculate_salary_revision, generate_promotion_letter
from app.services.payroll.tools import detect_salary_issue, verify_attendance, verify_leave, calculate_correction
from app.services.exit.tools import (
    create_exit_checklist, disable_accounts, request_asset_return,
    generate_experience_letter, initiate_recruitment,
)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
)

cors_origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]

if "*" in cors_origins or not cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=".*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

def register_all_tools(registry):
    # Recruitment
    registry.register("create_job_post", create_job_post, "recruitment", "Create a new job posting")
    registry.register("generate_job_description", generate_job_description, "recruitment", "Generate AI job description")
    registry.register("rank_candidates", rank_candidates, "recruitment", "Rank candidates by score")
    registry.register("schedule_interview", schedule_interview, "recruitment", "Schedule an interview")
    registry.register("generate_offer_letter", generate_offer_letter, "recruitment", "Generate offer letter")

    # Onboarding
    registry.register("create_employee", create_employee, "onboarding", "Create employee profile")
    registry.register("assign_manager", assign_manager, "onboarding", "Assign manager to employee")
    registry.register("generate_company_email", generate_company_email, "onboarding", "Generate company email")
    registry.register("create_employee_id", create_employee_id, "onboarding", "Generate employee ID")
    registry.register("allocate_laptop", allocate_laptop, "onboarding", "Allocate laptop to employee")
    registry.register("schedule_orientation", schedule_orientation, "onboarding", "Schedule orientation")
    registry.register("assign_training", assign_training, "onboarding", "Assign training modules")

    # Leave
    registry.register("verify_leave_balance", verify_leave_balance, "leave", "Verify leave balance")
    registry.register("check_team_availability", check_team_availability, "leave", "Check team availability")
    registry.register("approve_leave", approve_leave, "leave", "Approve leave request")
    registry.register("reject_leave", reject_leave, "leave", "Reject leave request")
    registry.register("suggest_alternative_dates", suggest_alternative_dates, "leave", "Suggest alternative dates")

    # Training
    registry.register("generate_learning_plan", generate_learning_plan, "training", "Generate learning plan")
    registry.register("assign_mentor", assign_mentor, "training", "Assign mentor")
    registry.register("track_progress", track_progress, "training", "Track training progress")

    # Performance
    registry.register("collect_metrics", collect_metrics, "performance", "Collect performance metrics")
    registry.register("generate_review", generate_review, "performance", "Generate performance review")
    registry.register("recommend_improvements", recommend_improvements, "performance", "Recommend improvements")

    # Promotion
    registry.register("evaluate_promotion", evaluate_promotion, "promotion", "Evaluate promotion eligibility")
    registry.register("calculate_salary_revision", calculate_salary_revision, "promotion", "Calculate salary revision")
    registry.register("generate_promotion_letter", generate_promotion_letter, "promotion", "Generate promotion letter")

    # Payroll
    registry.register("detect_salary_issue", detect_salary_issue, "payroll", "Detect salary issues")
    registry.register("verify_attendance", verify_attendance, "payroll", "Verify attendance records")
    registry.register("verify_leave", verify_leave, "payroll", "Verify leave records")
    registry.register("calculate_correction", calculate_correction, "payroll", "Calculate salary correction")

    # Exit
    registry.register("create_exit_checklist", create_exit_checklist, "exit", "Create exit checklist")
    registry.register("disable_accounts", disable_accounts, "exit", "Disable employee accounts")
    registry.register("request_asset_return", request_asset_return, "exit", "Request asset return")
    registry.register("generate_experience_letter", generate_experience_letter, "exit", "Generate experience letter")
    registry.register("initiate_recruitment", initiate_recruitment, "exit", "Initiate replacement recruitment")


ai_service = AIService()
register_all_tools(ai_service.registry)
app.state.ai_service = ai_service

app.include_router(auth.router)
app.include_router(workflow.router)
app.include_router(employees.router)
app.include_router(dashboard.router)
app.include_router(jobs.router)
app.include_router(modules.router)


@app.get("/")
async def root():
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "status": "operational",
        "ai_provider": settings.ai_provider,
        "ai_model": settings.ai_model,
        "tools_registered": len(ai_service.registry.list_tools()),
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
