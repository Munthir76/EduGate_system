# Finance Management APIs - النظام المالي

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
import uuid

# ============ Finance Models ============

class SalaryCreate(BaseModel):
    employee_id: str  # teacher_id or staff_id
    employee_type: str  # teacher, staff, admin
    amount: float
    month: str  # YYYY-MM
    salary_type: str  # من constants
    notes: Optional[str] = None

class Salary(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    school_id: str
    employee_id: str
    employee_type: str
    amount: float
    month: str
    salary_type: str
    notes: Optional[str] = None
    paid: bool = False
    payment_date: Optional[str] = None
    created_by: str
    created_at: str
    updated_at: str

class ExpenseCreate(BaseModel):
    amount: float
    expense_type: str  # من constants
    description: str
    date: str  # YYYY-MM-DD
    payment_method: Optional[str] = None
    receipt_number: Optional[str] = None

class Expense(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    school_id: str
    amount: float
    expense_type: str
    description: str
    date: str
    payment_method: Optional[str] = None
    receipt_number: Optional[str] = None
    created_by: str
    created_at: str
    updated_at: str

class TeacherTaskCreate(BaseModel):
    teacher_id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None
    priority: str = "medium"  # low, medium, high

class TeacherTask(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    school_id: str
    teacher_id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None
    priority: str
    status: str = "pending"  # pending, in_progress, completed
    created_by: str
    created_at: str
    updated_at: str


# ============ Finance Endpoints Functions ============

async def create_salary_endpoint(salary_data: SalaryCreate, current_user: dict, db):
    """إضافة راتب جديد"""
    from fastapi import HTTPException
    
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    salary_doc = {
        "id": str(uuid.uuid4()),
        "school_id": current_user["school_id"],
        "employee_id": salary_data.employee_id,
        "employee_type": salary_data.employee_type,
        "amount": salary_data.amount,
        "month": salary_data.month,
        "salary_type": salary_data.salary_type,
        "notes": salary_data.notes,
        "paid": False,
        "payment_date": None,
        "created_by": current_user["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.salaries.insert_one(salary_doc)
    salary_doc.pop('_id', None)
    
    return salary_doc


async def get_salaries_endpoint(current_user: dict, db):
    """جلب قائمة الرواتب"""
    from fastapi import HTTPException
    
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    salaries = await db.salaries.find(
        {"school_id": current_user["school_id"]}, 
        {"_id": 0}
    ).to_list(1000)
    
    # Enrich with employee names
    for salary in salaries:
        if salary["employee_type"] == "teacher":
            teacher = await db.teachers.find_one({"id": salary["employee_id"]}, {"_id": 0})
            if teacher:
                user = await db.users.find_one({"id": teacher["user_id"]}, {"_id": 0})
                if user:
                    salary["employee_name"] = user.get("full_name", "")
    
    return salaries


async def create_expense_endpoint(expense_data: ExpenseCreate, current_user: dict, db):
    """إضافة مصروف جديد"""
    from fastapi import HTTPException
    
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    expense_doc = {
        "id": str(uuid.uuid4()),
        "school_id": current_user["school_id"],
        "amount": expense_data.amount,
        "expense_type": expense_data.expense_type,
        "description": expense_data.description,
        "date": expense_data.date,
        "payment_method": expense_data.payment_method,
        "receipt_number": expense_data.receipt_number,
        "created_by": current_user["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.expenses.insert_one(expense_doc)
    expense_doc.pop('_id', None)
    
    return expense_doc


async def get_expenses_endpoint(current_user: dict, db):
    """جلب قائمة المصروفات"""
    from fastapi import HTTPException
    
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    expenses = await db.expenses.find(
        {"school_id": current_user["school_id"]}, 
        {"_id": 0}
    ).to_list(1000)
    
    return expenses


async def create_teacher_task_endpoint(task_data: TeacherTaskCreate, current_user: dict, db):
    """إضافة مهمة للمعلم"""
    from fastapi import HTTPException
    
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    task_doc = {
        "id": str(uuid.uuid4()),
        "school_id": current_user["school_id"],
        "teacher_id": task_data.teacher_id,
        "title": task_data.title,
        "description": task_data.description,
        "due_date": task_data.due_date,
        "priority": task_data.priority,
        "status": "pending",
        "created_by": current_user["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.teacher_tasks.insert_one(task_doc)
    task_doc.pop('_id', None)
    
    return task_doc


async def get_teacher_tasks_endpoint(current_user: dict, db, teacher_id: Optional[str] = None):
    """جلب قائمة مهام المعلمين"""
    from fastapi import HTTPException
    
    if current_user["role"] not in ["school_admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    query = {"school_id": current_user["school_id"]}
    
    # If teacher is viewing, show only their tasks
    if current_user["role"] == "teacher":
        # Find teacher record
        teacher = await db.teachers.find_one({"user_id": current_user["id"]}, {"_id": 0})
        if teacher:
            query["teacher_id"] = teacher["id"]
    elif teacher_id:
        # Admin filtering by specific teacher
        query["teacher_id"] = teacher_id
    
    tasks = await db.teacher_tasks.find(query, {"_id": 0}).to_list(1000)
    
    # Enrich with teacher names
    for task in tasks:
        teacher = await db.teachers.find_one({"id": task["teacher_id"]}, {"_id": 0})
        if teacher:
            user = await db.users.find_one({"id": teacher["user_id"]}, {"_id": 0})
            if user:
                task["teacher_name"] = user.get("full_name", "")
    
    return tasks
