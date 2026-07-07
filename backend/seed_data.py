"""
Demo seed script - populates sample data for the hackathon demo.
Run: python seed_data.py
"""
import uuid
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, date
from app.db.database import get_supabase_service
from app.config import settings


def seed():
    supabase = get_supabase_service()


    employees_data = [
        {"full_name": "Rahul Sharma", "position": "Backend Developer", "department": "Engineering", "salary": 85000},
        {"full_name": "Priya Patel", "position": "Frontend Developer", "department": "Engineering", "salary": 82000},
        {"full_name": "Aman Verma", "position": "Product Designer", "department": "Design", "salary": 78000},
        {"full_name": "Sneha Gupta", "position": "HR Manager", "department": "Human Resources", "salary": 90000},
        {"full_name": "Vikram Singh", "position": "DevOps Engineer", "department": "Engineering", "salary": 88000},
        {"full_name": "Ananya Reddy", "position": "Data Scientist", "department": "Data", "salary": 95000},
        {"full_name": "Rohit Joshi", "position": "Full Stack Developer", "department": "Engineering", "salary": 86000},
        {"full_name": "Neha Kapoor", "position": "Marketing Lead", "department": "Marketing", "salary": 80000},
    ]

    created_employees = []
    for emp in employees_data:
        emp_id = str(uuid.uuid4())
        employee_id = f"EMP{datetime.utcnow().strftime('%Y%m')}{uuid.uuid4().hex[:4].upper()}"

        existing = supabase.table("employees").select("*").eq("email", f"{emp['full_name'].lower().replace(' ', '.')}@company.com").execute()
        if existing.data:
            print(f"  Skipping {emp['full_name']} - already exists")
            created_employees.append(existing.data[0])
            continue

        data = {
            "id": emp_id,
            "employee_id": employee_id,
            "full_name": emp["full_name"],
            "email": f"{emp['full_name'].lower().replace(' ', '.')}@company.com",
            "position": emp["position"],
            "department": emp["department"],
            "salary": emp["salary"],
            "status": "active",
            "start_date": date(2024, 1, 15).isoformat(),
            "created_at": datetime.utcnow().isoformat()
        }
        supabase.table("employees").insert(data).execute()
        created_employees.append(data)
        print(f"  Created: {emp['full_name']} ({employee_id})")

    emp1 = created_employees[0] if created_employees else None
    emp4 = created_employees[3] if len(created_employees) > 3 else None
    emp3 = created_employees[2] if len(created_employees) > 2 else None

    if emp1 and emp4:
        supabase.table("employees").update({"manager_id": emp4["id"]}).eq("id", emp1["id"]).execute()
        print(f"  Assigned {emp4['full_name']} as manager of {emp1['full_name']}")

    leaves_data = [
        {"employee_id": emp1["id"] if emp1 else "", "leave_type": "annual", "start_date": "2024-03-10", "end_date": "2024-03-12", "reason": "Family function", "status": "approved"},
        {"employee_id": emp3["id"] if emp3 else "", "leave_type": "sick", "start_date": "2024-03-05", "end_date": "2024-03-06", "reason": "Not feeling well", "status": "pending"},
    ]

    for leave in leaves_data:
        existing = supabase.table("leave_requests").select("*").eq("employee_id", leave["employee_id"]).execute()
        if not existing.data and leave["employee_id"]:
            lid = str(uuid.uuid4())
            leave["id"] = lid
            leave["created_at"] = datetime.utcnow().isoformat()
            supabase.table("leave_requests").insert(leave).execute()
            print(f"  Created leave request: {leave['leave_type']} for {leave['employee_id']}")

    jobs = [
        {"title": "Senior Frontend Developer", "department": "Engineering", "status": "open"},
        {"title": "Product Manager", "department": "Product", "status": "open"},
    ]

    for job in jobs:
        jid = str(uuid.uuid4())
        job["id"] = jid
        job["created_at"] = datetime.utcnow().isoformat()
        job["location"] = "Remote"
        job["description"] = f"We are hiring a {job['title']} to join our growing team."
        job["requirements"] = "- 3+ years experience\n- Strong communication skills\n- Team player"
        job["salary_range"] = "$80,000 - $120,000"

        existing = supabase.table("jobs").select("*").eq("title", job["title"]).execute()
        if not existing.data:
            supabase.table("jobs").insert(job).execute()
            print(f"  Created job: {job['title']}")

    print("\nSeed data creation complete!")
    print(f"  Total employees: {len(created_employees)}")


if __name__ == "__main__":
    print("Seeding Autonomous HR Manager demo data...")
    seed()
