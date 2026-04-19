from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ Models ============

# User Models
class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    full_name: str
    role: str  # super_admin, school_admin, teacher, student, parent
    school_id: Optional[str] = None
    language: str = "ar"  # ar, fr, en
    phone: Optional[str] = None
    is_active: bool = True

class UserCreate(BaseModel):
    username: str
    password: str
    email: Optional[EmailStr] = None
    full_name: str
    role: str
    school_id: Optional[str] = None
    language: str = "ar"
    phone: Optional[str] = None

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserLogin(BaseModel):
    username: str
    password: str
    role: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

# School Models
class SchoolCreate(BaseModel):
    name: str
    name_ar: Optional[str] = None
    name_fr: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    admin_username: str
    admin_password: str
    admin_full_name: str
    admin_email: Optional[EmailStr] = None

class School(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    name_ar: Optional[str] = None
    name_fr: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Student Models
class StudentCreate(BaseModel):
    username: str
    password: str
    full_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    parent_id: Optional[str] = None
    class_name: str
    grade: str
    date_of_birth: Optional[str] = None
    address: Optional[str] = None
    medical_info: Optional[str] = None

class Student(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    school_id: str
    parent_id: Optional[str] = None
    class_name: str
    grade: str
    date_of_birth: Optional[str] = None
    address: Optional[str] = None
    medical_info: Optional[str] = None
    enrollment_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Teacher Models
class TeacherCreate(BaseModel):
    username: str
    password: str
    full_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    subjects: List[str] = []
    classes: List[str] = []
    specialization: Optional[str] = None

class Teacher(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    school_id: str
    subjects: List[str] = []
    classes: List[str] = []
    specialization: Optional[str] = None
    hire_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Parent Models
class ParentCreate(BaseModel):
    username: str
    password: str
    full_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    relationship: str = "father"  # father, mother, guardian
    student_ids: List[str] = []

class Parent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    school_id: str
    relationship: str
    student_ids: List[str] = []
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Attendance Models
class AttendanceCreate(BaseModel):
    student_id: str
    date: str  # YYYY-MM-DD
    status: str  # present, absent, late, excused
    notes: Optional[str] = None

class Attendance(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    school_id: str
    class_name: str
    date: str
    status: str
    notes: Optional[str] = None
    recorded_by: str  # teacher user_id
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Grade Models
class GradeCreate(BaseModel):
    student_id: str
    subject: str
    assessment_type: str  # exam, quiz, homework, project
    assessment_name: str
    score: float
    max_score: float
    weight: float = 1.0
    notes: Optional[str] = None

class Grade(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    school_id: str
    class_name: str
    subject: str
    assessment_type: str
    assessment_name: str
    score: float
    max_score: float
    percentage: float
    weight: float = 1.0
    notes: Optional[str] = None
    recorded_by: str  # teacher user_id
    academic_year: str
    semester: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Assignment Models
class AssignmentCreate(BaseModel):
    title: str
    description: str
    subject: str
    class_name: str
    due_date: str  # ISO format
    max_score: float
    attachment_url: Optional[str] = None

class Assignment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    school_id: str
    title: str
    description: str
    subject: str
    class_name: str
    due_date: str
    max_score: float
    attachment_url: Optional[str] = None
    created_by: str  # teacher user_id
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Assignment Submission Models
class AssignmentSubmissionCreate(BaseModel):
    assignment_id: str
    student_id: str
    content: str
    attachment_url: Optional[str] = None

class AssignmentSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    assignment_id: str
    student_id: str
    content: str
    attachment_url: Optional[str] = None
    score: Optional[float] = None
    feedback: Optional[str] = None
    status: str = "submitted"  # submitted, graded
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    graded_at: Optional[datetime] = None

# Fee Models
class FeeCreate(BaseModel):
    student_id: str
    amount: float
    fee_type: str  # tuition, transport, books, etc.
    due_date: str
    academic_year: str
    semester: str
    description: Optional[str] = None

class Fee(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    school_id: str
    student_id: str
    amount: float
    paid_amount: float = 0.0
    discount: float = 0.0
    fee_type: str
    due_date: str
    academic_year: str
    semester: str
    description: Optional[str] = None
    status: str = "pending"  # pending, partial, paid, overdue
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Payment Models
class PaymentCreate(BaseModel):
    fee_id: str
    amount: float
    payment_method: str  # cash, bank_transfer, online
    reference_number: Optional[str] = None
    notes: Optional[str] = None

class Payment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    fee_id: str
    student_id: str
    school_id: str
    amount: float
    payment_method: str
    reference_number: Optional[str] = None
    notes: Optional[str] = None
    received_by: str  # user_id
    payment_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============ Helper Functions ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============ API Routes ============

@api_router.get("/")
async def root():
    return {"message": "School Management System API", "version": "1.0.0"}

@api_router.get("/constants")
async def get_constants():
    from constants import GRADES, SUBJECTS, SALARY_TYPES, EXPENSE_TYPES, FEE_TYPES, PAYMENT_METHODS
    return {
        "grades": GRADES,
        "subjects": SUBJECTS,
        "salary_types": SALARY_TYPES,
        "expense_types": EXPENSE_TYPES,
        "fee_types": FEE_TYPES,
        "payment_methods": PAYMENT_METHODS
    }

# ============ Authentication Routes ============

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    # Find user by username and role
    user = await db.users.find_one(
        {"username": login_data.username, "role": login_data.role},
        {"_id": 0}
    )
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Account is inactive")
    
    # Create access token
    access_token = create_access_token(data={"sub": user["id"], "role": user["role"]})
    
    # Remove password hash from response
    user_data = {k: v for k, v in user.items() if k != "password_hash"}
    
    return TokenResponse(access_token=access_token, user=user_data)

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user_data = {k: v for k, v in current_user.items() if k != "password_hash"}
    return user_data

# ============ School Routes (Super Admin Only) ============

@api_router.post("/schools", response_model=School)
async def create_school(school_data: SchoolCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if school name exists
    existing_school = await db.schools.find_one({"name": school_data.name})
    if existing_school:
        raise HTTPException(status_code=400, detail="School name already exists")
    
    # Create school
    school = School(
        name=school_data.name,
        name_ar=school_data.name_ar,
        name_fr=school_data.name_fr,
        address=school_data.address,
        phone=school_data.phone,
        email=school_data.email
    )
    
    school_doc = school.model_dump()
    school_doc['created_at'] = school_doc['created_at'].isoformat()
    school_doc['updated_at'] = school_doc['updated_at'].isoformat()
    await db.schools.insert_one(school_doc)
    
    # Create school admin user
    admin_user = User(
        username=school_data.admin_username,
        email=school_data.admin_email,
        full_name=school_data.admin_full_name,
        role="school_admin",
        school_id=school.id,
        language="ar"
    )
    
    admin_doc = admin_user.model_dump()
    admin_doc["password_hash"] = hash_password(school_data.admin_password)
    admin_doc['created_at'] = admin_doc['created_at'].isoformat()
    admin_doc['updated_at'] = admin_doc['updated_at'].isoformat()
    await db.users.insert_one(admin_doc)
    
    return school

@api_router.get("/schools", response_model=List[School])
async def get_schools(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    schools = await db.schools.find({}, {"_id": 0}).to_list(1000)
    for school in schools:
        if isinstance(school.get('created_at'), str):
            school['created_at'] = datetime.fromisoformat(school['created_at'])
        if isinstance(school.get('updated_at'), str):
            school['updated_at'] = datetime.fromisoformat(school['updated_at'])
    return schools

@api_router.get("/schools/stats")
async def get_schools_stats(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    schools = await db.schools.find({"is_active": True}, {"_id": 0}).to_list(1000)
    
    stats = []
    for school in schools:
        teacher_count = await db.teachers.count_documents({"school_id": school["id"], "is_active": True})
        student_count = await db.students.count_documents({"school_id": school["id"], "is_active": True})
        
        stats.append({
            "school_id": school["id"],
            "school_name": school["name"],
            "teacher_count": teacher_count,
            "student_count": student_count
        })
    
    return {"schools": stats, "total_schools": len(schools)}

@api_router.put("/schools/{school_id}")
async def update_school(school_id: str, update_data: dict, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if school exists
    school = await db.schools.find_one({"id": school_id}, {"_id": 0})
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    # Allowed fields to update (excluding sensitive data)
    allowed_fields = ["name", "name_ar", "name_fr", "address", "phone", "email", "is_active"]
    update_fields = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.schools.update_one(
        {"id": school_id},
        {"$set": update_fields}
    )
    
    return {"message": "School updated successfully", "school_id": school_id}

@api_router.delete("/schools/{school_id}")
async def delete_school(school_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if school exists
    school = await db.schools.find_one({"id": school_id}, {"_id": 0})
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    # Soft delete - mark as inactive instead of actually deleting
    await db.schools.update_one(
        {"id": school_id},
        {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Also deactivate all users associated with this school
    await db.users.update_many(
        {"school_id": school_id},
        {"$set": {"is_active": False}}
    )
    
    return {"message": "School deleted successfully", "school_id": school_id}

# ============ User Management Routes ============

@api_router.get("/users")
async def get_users(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["super_admin", "school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    query = {}
    if current_user["role"] == "school_admin":
        query["school_id"] = current_user["school_id"]
    
    users = await db.users.find(query, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

# ============ Student Routes ============

@api_router.post("/students")
async def create_student(student_data: StudentCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if username exists
    existing_user = await db.users.find_one({"username": student_data.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Create user account
    user = User(
        username=student_data.username,
        email=student_data.email,
        full_name=student_data.full_name,
        role="student",
        school_id=current_user["school_id"],
        phone=student_data.phone
    )
    
    user_doc = user.model_dump()
    user_doc["password_hash"] = hash_password(student_data.password)
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    user_doc['updated_at'] = user_doc['updated_at'].isoformat()
    await db.users.insert_one(user_doc)
    
    # Create student record
    student = Student(
        user_id=user.id,
        school_id=current_user["school_id"],
        parent_id=student_data.parent_id,
        class_name=student_data.class_name,
        grade=student_data.grade,
        date_of_birth=student_data.date_of_birth,
        address=student_data.address,
        medical_info=student_data.medical_info
    )
    
    student_doc = student.model_dump()
    student_doc['enrollment_date'] = student_doc['enrollment_date'].isoformat()
    student_doc['created_at'] = student_doc['created_at'].isoformat()
    student_doc['updated_at'] = student_doc['updated_at'].isoformat()
    await db.students.insert_one(student_doc)
    
    # Return simple dict without MongoDB _id
    return {
        "id": student.id,
        "user_id": student.user_id,
        "school_id": student.school_id,
        "class_name": student.class_name,
        "grade": student.grade,
        "message": "Student created successfully"
    }

@api_router.get("/students")
async def get_students(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["school_admin", "teacher", "parent"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    query = {"school_id": current_user["school_id"], "is_active": True}
    students = await db.students.find(query, {"_id": 0}).to_list(1000)
    
    # Enrich with user data (full_name, email, phone)
    for student in students:
        user = await db.users.find_one({"id": student["user_id"]}, {"_id": 0})
        if user:
            student["full_name"] = user.get("full_name", "")
            student["email"] = user.get("email", "")
            student["phone"] = user.get("phone", "")
        
        if isinstance(student.get('enrollment_date'), str):
            student['enrollment_date'] = datetime.fromisoformat(student['enrollment_date'])
        if isinstance(student.get('created_at'), str):
            student['created_at'] = datetime.fromisoformat(student['created_at'])
        if isinstance(student.get('updated_at'), str):
            student['updated_at'] = datetime.fromisoformat(student['updated_at'])
    
    return students

@api_router.put("/students/{student_id}")
async def update_student(student_id: str, update_data: dict, current_user: dict = Depends(get_current_user)):
    from crud_endpoints import update_student_endpoint
    return await update_student_endpoint(student_id, update_data, current_user, db)

@api_router.delete("/students/{student_id}")
async def delete_student(student_id: str, current_user: dict = Depends(get_current_user)):
    from crud_endpoints import delete_student_endpoint
    return await delete_student_endpoint(student_id, current_user, db)

# ============ Teacher Routes ============

@api_router.post("/teachers")
async def create_teacher(teacher_data: TeacherCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if username exists
    existing_user = await db.users.find_one({"username": teacher_data.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Create user account
    user = User(
        username=teacher_data.username,
        email=teacher_data.email,
        full_name=teacher_data.full_name,
        role="teacher",
        school_id=current_user["school_id"],
        phone=teacher_data.phone
    )
    
    user_doc = user.model_dump()
    user_doc["password_hash"] = hash_password(teacher_data.password)
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    user_doc['updated_at'] = user_doc['updated_at'].isoformat()
    await db.users.insert_one(user_doc)
    
    # Create teacher record
    teacher = Teacher(
        user_id=user.id,
        school_id=current_user["school_id"],
        subjects=teacher_data.subjects,
        classes=teacher_data.classes,
        specialization=teacher_data.specialization
    )
    
    teacher_doc = teacher.model_dump()
    teacher_doc['hire_date'] = teacher_doc['hire_date'].isoformat()
    teacher_doc['created_at'] = teacher_doc['created_at'].isoformat()
    teacher_doc['updated_at'] = teacher_doc['updated_at'].isoformat()
    await db.teachers.insert_one(teacher_doc)
    
    # Return simple dict without MongoDB _id
    return {
        "id": teacher.id,
        "user_id": teacher.user_id,
        "school_id": teacher.school_id,
        "subjects": teacher.subjects,
        "message": "Teacher created successfully"
    }

@api_router.get("/teachers")
async def get_teachers(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["school_admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    query = {"school_id": current_user["school_id"], "is_active": True}
    teachers = await db.teachers.find(query, {"_id": 0}).to_list(1000)
    
    # Enrich with user data (full_name, email, phone)
    for teacher in teachers:
        user = await db.users.find_one({"id": teacher["user_id"]}, {"_id": 0})
        if user:
            teacher["full_name"] = user.get("full_name", "")
            teacher["email"] = user.get("email", "")
            teacher["phone"] = user.get("phone", "")
        
        if isinstance(teacher.get('hire_date'), str):
            teacher['hire_date'] = datetime.fromisoformat(teacher['hire_date'])
        if isinstance(teacher.get('created_at'), str):
            teacher['created_at'] = datetime.fromisoformat(teacher['created_at'])
        if isinstance(teacher.get('updated_at'), str):
            teacher['updated_at'] = datetime.fromisoformat(teacher['updated_at'])
    
    return teachers

@api_router.put("/teachers/{teacher_id}")
async def update_teacher(teacher_id: str, update_data: dict, current_user: dict = Depends(get_current_user)):
    from crud_endpoints import update_teacher_endpoint
    return await update_teacher_endpoint(teacher_id, update_data, current_user, db)

@api_router.delete("/teachers/{teacher_id}")
async def delete_teacher(teacher_id: str, current_user: dict = Depends(get_current_user)):
    from crud_endpoints import delete_teacher_endpoint
    return await delete_teacher_endpoint(teacher_id, current_user, db)

# ============ Parent Routes ============

@api_router.post("/parents")
async def create_parent(parent_data: ParentCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if username exists
    existing_user = await db.users.find_one({"username": parent_data.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Create user account
    user = User(
        username=parent_data.username,
        email=parent_data.email,
        full_name=parent_data.full_name,
        role="parent",
        school_id=current_user["school_id"],
        phone=parent_data.phone
    )
    
    user_doc = user.model_dump()
    user_doc["password_hash"] = hash_password(parent_data.password)
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    user_doc['updated_at'] = user_doc['updated_at'].isoformat()
    await db.users.insert_one(user_doc)
    
    # Create parent record
    parent = Parent(
        user_id=user.id,
        school_id=current_user["school_id"],
        relationship=parent_data.relationship,
        student_ids=parent_data.student_ids
    )
    
    parent_doc = parent.model_dump()
    parent_doc['created_at'] = parent_doc['created_at'].isoformat()
    parent_doc['updated_at'] = parent_doc['updated_at'].isoformat()
    await db.parents.insert_one(parent_doc)
    
    # Return simple dict without MongoDB _id
    return {
        "id": parent.id,
        "user_id": parent.user_id,
        "school_id": parent.school_id,
        "relationship": parent.relationship,
        "student_ids": parent.student_ids,
        "message": "Parent created successfully"
    }

@api_router.get("/parents")
async def get_parents(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    query = {"school_id": current_user["school_id"], "is_active": True}
    parents = await db.parents.find(query, {"_id": 0}).to_list(1000)
    
    # Enrich with user data (full_name, email, phone)
    for parent in parents:
        user = await db.users.find_one({"id": parent["user_id"]}, {"_id": 0})
        if user:
            parent["full_name"] = user.get("full_name", "")
            parent["email"] = user.get("email", "")
            parent["phone"] = user.get("phone", "")
        
        if isinstance(parent.get('created_at'), str):
            parent['created_at'] = datetime.fromisoformat(parent['created_at'])
        if isinstance(parent.get('updated_at'), str):
            parent['updated_at'] = datetime.fromisoformat(parent['updated_at'])
    
    return parents

@api_router.put("/parents/{parent_id}")
async def update_parent(parent_id: str, update_data: dict, current_user: dict = Depends(get_current_user)):
    from crud_endpoints import update_parent_endpoint
    return await update_parent_endpoint(parent_id, update_data, current_user, db)

@api_router.delete("/parents/{parent_id}")
async def delete_parent(parent_id: str, current_user: dict = Depends(get_current_user)):
    from crud_endpoints import delete_parent_endpoint
    return await delete_parent_endpoint(parent_id, current_user, db)

# ============ Attendance Routes ============

@api_router.post("/attendance", response_model=Attendance)
async def create_attendance(attendance_data: AttendanceCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["teacher", "school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get student info
    student = await db.students.find_one({"id": attendance_data.student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if attendance already recorded for this date
    existing = await db.attendance.find_one({
        "student_id": attendance_data.student_id,
        "date": attendance_data.date
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Attendance already recorded for this date")
    
    attendance = Attendance(
        student_id=attendance_data.student_id,
        school_id=current_user["school_id"],
        class_name=student["class_name"],
        date=attendance_data.date,
        status=attendance_data.status,
        notes=attendance_data.notes,
        recorded_by=current_user["id"]
    )
    
    attendance_doc = attendance.model_dump()
    attendance_doc['created_at'] = attendance_doc['created_at'].isoformat()
    await db.attendance.insert_one(attendance_doc)
    
    return attendance

@api_router.get("/attendance")
async def get_attendance(student_id: Optional[str] = None, date: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {"school_id": current_user["school_id"]}
    
    if student_id:
        query["student_id"] = student_id
    if date:
        query["date"] = date
    
    attendance_records = await db.attendance.find(query, {"_id": 0}).to_list(1000)
    
    for record in attendance_records:
        if isinstance(record.get('created_at'), str):
            record['created_at'] = datetime.fromisoformat(record['created_at'])
    
    return attendance_records

# ============ Grade Routes ============

@api_router.post("/grades", response_model=Grade)
async def create_grade(grade_data: GradeCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["teacher", "school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get student info
    student = await db.students.find_one({"id": grade_data.student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Calculate percentage
    percentage = (grade_data.score / grade_data.max_score) * 100 if grade_data.max_score > 0 else 0
    
    grade = Grade(
        student_id=grade_data.student_id,
        school_id=current_user["school_id"],
        class_name=student["class_name"],
        subject=grade_data.subject,
        assessment_type=grade_data.assessment_type,
        assessment_name=grade_data.assessment_name,
        score=grade_data.score,
        max_score=grade_data.max_score,
        percentage=percentage,
        weight=grade_data.weight,
        notes=grade_data.notes,
        recorded_by=current_user["id"],
        academic_year="2024-2025",
        semester="1"
    )
    
    grade_doc = grade.model_dump()
    grade_doc['created_at'] = grade_doc['created_at'].isoformat()
    grade_doc['updated_at'] = grade_doc['updated_at'].isoformat()
    await db.grades.insert_one(grade_doc)
    
    return grade

@api_router.get("/grades")
async def get_grades(student_id: Optional[str] = None, subject: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {"school_id": current_user["school_id"]}
    
    if student_id:
        query["student_id"] = student_id
    if subject:
        query["subject"] = subject
    
    grades = await db.grades.find(query, {"_id": 0}).to_list(1000)
    
    for grade in grades:
        if isinstance(grade.get('created_at'), str):
            grade['created_at'] = datetime.fromisoformat(grade['created_at'])
        if isinstance(grade.get('updated_at'), str):
            grade['updated_at'] = datetime.fromisoformat(grade['updated_at'])
    
    return grades

# ============ Assignment Routes ============

@api_router.post("/assignments", response_model=Assignment)
async def create_assignment(assignment_data: AssignmentCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["teacher", "school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    assignment = Assignment(
        school_id=current_user["school_id"],
        title=assignment_data.title,
        description=assignment_data.description,
        subject=assignment_data.subject,
        class_name=assignment_data.class_name,
        due_date=assignment_data.due_date,
        max_score=assignment_data.max_score,
        attachment_url=assignment_data.attachment_url,
        created_by=current_user["id"]
    )
    
    assignment_doc = assignment.model_dump()
    assignment_doc['created_at'] = assignment_doc['created_at'].isoformat()
    assignment_doc['updated_at'] = assignment_doc['updated_at'].isoformat()
    await db.assignments.insert_one(assignment_doc)
    
    return assignment

@api_router.get("/assignments")
async def get_assignments(class_name: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {"school_id": current_user["school_id"], "is_active": True}
    
    if class_name:
        query["class_name"] = class_name
    
    assignments = await db.assignments.find(query, {"_id": 0}).to_list(1000)
    
    for assignment in assignments:
        if isinstance(assignment.get('created_at'), str):
            assignment['created_at'] = datetime.fromisoformat(assignment['created_at'])
        if isinstance(assignment.get('updated_at'), str):
            assignment['updated_at'] = datetime.fromisoformat(assignment['updated_at'])
    
    return assignments

# ============ Fee Routes ============

@api_router.post("/fees", response_model=Fee)
async def create_fee(fee_data: FeeCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    fee = Fee(
        school_id=current_user["school_id"],
        student_id=fee_data.student_id,
        amount=fee_data.amount,
        fee_type=fee_data.fee_type,
        due_date=fee_data.due_date,
        academic_year=fee_data.academic_year,
        semester=fee_data.semester,
        description=fee_data.description
    )
    
    fee_doc = fee.model_dump()
    fee_doc['created_at'] = fee_doc['created_at'].isoformat()
    fee_doc['updated_at'] = fee_doc['updated_at'].isoformat()
    await db.fees.insert_one(fee_doc)
    
    return fee

@api_router.get("/fees")
async def get_fees(student_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {"school_id": current_user["school_id"]}
    
    if student_id:
        query["student_id"] = student_id
    
    fees = await db.fees.find(query, {"_id": 0}).to_list(1000)
    
    for fee in fees:
        if isinstance(fee.get('created_at'), str):
            fee['created_at'] = datetime.fromisoformat(fee['created_at'])
        if isinstance(fee.get('updated_at'), str):
            fee['updated_at'] = datetime.fromisoformat(fee['updated_at'])
    
    return fees

# ============ Schedule Routes ============

@api_router.post("/schedules")
async def create_schedule(schedule_data: dict, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    schedule = {
        "id": str(uuid.uuid4()),
        "school_id": current_user["school_id"],
        "class_name": schedule_data["class_name"],
        "day": schedule_data["day"],
        "periods": schedule_data["periods"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.schedules.insert_one(schedule)
    # Remove the MongoDB _id from the response
    schedule.pop('_id', None)
    return schedule

@api_router.get("/schedules")
async def get_schedules(class_name: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {"school_id": current_user["school_id"]}
    if class_name:
        query["class_name"] = class_name
    
    schedules = await db.schedules.find(query, {"_id": 0}).to_list(1000)
    return schedules

@api_router.get("/schedules/teacher/{teacher_id}")
async def get_teacher_schedule(teacher_id: str, current_user: dict = Depends(get_current_user)):
    # Get all schedules and filter by teacher
    schedules = await db.schedules.find({"school_id": current_user["school_id"]}, {"_id": 0}).to_list(1000)
    
    teacher_schedule = []
    for schedule in schedules:
        for period in schedule["periods"]:
            if period.get("teacher_id") == teacher_id:
                teacher_schedule.append({
                    "day": schedule["day"],
                    "class_name": schedule["class_name"],
                    "time": period["time"],
                    "subject": period["subject"]
                })
    
    return teacher_schedule

# ============ Rating Routes ============

@api_router.post("/ratings")
async def create_rating(rating_data: dict, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["school_admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    rating = {
        "id": str(uuid.uuid4()),
        "school_id": current_user["school_id"],
        "rater_id": current_user["id"],
        "rater_role": current_user["role"],
        "target_id": rating_data["target_id"],
        "target_type": rating_data["target_type"],
        "rating": rating_data["rating"],
        "category": rating_data["category"],
        "notes": rating_data.get("notes"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.ratings.insert_one(rating)
    # Remove the MongoDB _id from the response
    rating.pop('_id', None)
    return rating

@api_router.get("/ratings")
async def get_ratings(target_id: Optional[str] = None, target_type: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {"school_id": current_user["school_id"]}
    
    if target_id:
        query["target_id"] = target_id
    if target_type:
        query["target_type"] = target_type
    
    ratings = await db.ratings.find(query, {"_id": 0}).to_list(1000)
    return ratings

# ============ Staff Attendance Routes ============

@api_router.post("/staff-attendance")
async def create_staff_attendance(attendance_data: dict, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    attendance = {
        "id": str(uuid.uuid4()),
        "school_id": current_user["school_id"],
        "staff_id": attendance_data["staff_id"],
        "staff_type": attendance_data["staff_type"],  # "teacher"
        "date": attendance_data["date"],
        "status": attendance_data["status"],
        "notes": attendance_data.get("notes"),
        "recorded_by": current_user["id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.staff_attendance.insert_one(attendance)
    return attendance

@api_router.get("/staff-attendance")
async def get_staff_attendance(date: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {"school_id": current_user["school_id"]}
    if date:
        query["date"] = date
    
    records = await db.staff_attendance.find(query, {"_id": 0}).to_list(1000)
    return records

# ============ Payment Routes ============

@api_router.post("/payments", response_model=Payment)
async def create_payment(payment_data: PaymentCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get fee info
    fee = await db.fees.find_one({"id": payment_data.fee_id}, {"_id": 0})
    if not fee:
        raise HTTPException(status_code=404, detail="Fee not found")
    
    # Create payment
    payment = Payment(
        fee_id=payment_data.fee_id,
        student_id=fee["student_id"],
        school_id=current_user["school_id"],
        amount=payment_data.amount,
        payment_method=payment_data.payment_method,
        reference_number=payment_data.reference_number,
        notes=payment_data.notes,
        received_by=current_user["id"]
    )
    
    payment_doc = payment.model_dump()
    payment_doc['payment_date'] = payment_doc['payment_date'].isoformat()
    await db.payments.insert_one(payment_doc)
    
    # Update fee paid amount and status
    new_paid_amount = fee["paid_amount"] + payment_data.amount
    remaining = fee["amount"] - new_paid_amount
    
    if remaining <= 0:
        status = "paid"
    elif new_paid_amount > 0:
        status = "partial"
    else:
        status = "pending"
    
    await db.fees.update_one(
        {"id": payment_data.fee_id},
        {"$set": {"paid_amount": new_paid_amount, "status": status}}
    )
    
    return payment

@api_router.get("/payments")
async def get_payments(student_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {"school_id": current_user["school_id"]}
    
    if student_id:
        query["student_id"] = student_id
    
    payments = await db.payments.find(query, {"_id": 0}).to_list(1000)
    
    for payment in payments:
        if isinstance(payment.get('payment_date'), str):
            payment['payment_date'] = datetime.fromisoformat(payment['payment_date'])
    
    return payments

# ============ Dashboard Routes ============

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "school_admin":
        school_id = current_user["school_id"]
        
        total_students = await db.students.count_documents({"school_id": school_id, "is_active": True})
        total_teachers = await db.teachers.count_documents({"school_id": school_id, "is_active": True})
        total_parents = await db.parents.count_documents({"school_id": school_id, "is_active": True})
        
        # Today's attendance
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        present_today = await db.attendance.count_documents({"school_id": school_id, "date": today, "status": "present"})
        absent_today = await db.attendance.count_documents({"school_id": school_id, "date": today, "status": "absent"})
        
        # Financial stats
        fees = await db.fees.find({"school_id": school_id}, {"_id": 0}).to_list(10000)
        total_fees = sum(fee["amount"] for fee in fees)
        total_paid = sum(fee["paid_amount"] for fee in fees)
        total_pending = total_fees - total_paid
        
        return {
            "total_students": total_students,
            "total_teachers": total_teachers,
            "total_parents": total_parents,
            "present_today": present_today,
            "absent_today": absent_today,
            "total_fees": total_fees,
            "total_paid": total_paid,
            "total_pending": total_pending
        }
    
    return {"message": "Dashboard stats not available for this role"}

# ============ Finance Routes ============
@api_router.post("/salaries")
async def create_salary(salary_data: dict, current_user: dict = Depends(get_current_user)):
    from finance_apis import create_salary_endpoint, SalaryCreate
    data = SalaryCreate(**salary_data)
    return await create_salary_endpoint(data, current_user, db)

@api_router.get("/salaries")
async def get_salaries(current_user: dict = Depends(get_current_user)):
    from finance_apis import get_salaries_endpoint
    return await get_salaries_endpoint(current_user, db)

@api_router.post("/expenses")
async def create_expense(expense_data: dict, current_user: dict = Depends(get_current_user)):
    from finance_apis import create_expense_endpoint, ExpenseCreate
    data = ExpenseCreate(**expense_data)
    return await create_expense_endpoint(data, current_user, db)

@api_router.get("/expenses")
async def get_expenses(current_user: dict = Depends(get_current_user)):
    from finance_apis import get_expenses_endpoint
    return await get_expenses_endpoint(current_user, db)

@api_router.post("/teacher-tasks")
async def create_teacher_task(task_data: dict, current_user: dict = Depends(get_current_user)):
    from finance_apis import create_teacher_task_endpoint, TeacherTaskCreate
    data = TeacherTaskCreate(**task_data)
    return await create_teacher_task_endpoint(data, current_user, db)

@api_router.get("/teacher-tasks")
async def get_teacher_tasks(current_user: dict = Depends(get_current_user), teacher_id: str = None):
    from finance_apis import get_teacher_tasks_endpoint
    return await get_teacher_tasks_endpoint(current_user, db, teacher_id)

@api_router.put("/salaries/{salary_id}")
async def update_salary(salary_id: str, update_data: dict, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.salaries.update_one(
        {"id": salary_id, "school_id": current_user["school_id"]},
        {"$set": {**update_data, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Salary updated successfully"}

@api_router.delete("/salaries/{salary_id}")
async def delete_salary(salary_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.salaries.delete_one({"id": salary_id, "school_id": current_user["school_id"]})
    return {"message": "Salary deleted successfully"}

@api_router.put("/expenses/{expense_id}")
async def update_expense(expense_id: str, update_data: dict, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.expenses.update_one(
        {"id": expense_id, "school_id": current_user["school_id"]},
        {"$set": {**update_data, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Expense updated successfully"}

@api_router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.expenses.delete_one({"id": expense_id, "school_id": current_user["school_id"]})
    return {"message": "Expense deleted successfully"}

@api_router.put("/fees/{fee_id}")
async def update_fee(fee_id: str, update_data: dict, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.fees.update_one(
        {"id": fee_id, "school_id": current_user["school_id"]},
        {"$set": {**update_data, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Fee updated successfully"}

@api_router.delete("/fees/{fee_id}")
async def delete_fee(fee_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.fees.delete_one({"id": fee_id, "school_id": current_user["school_id"]})
    return {"message": "Fee deleted successfully"}

@api_router.put("/schedules/{schedule_id}")
async def update_schedule(schedule_id: str, update_data: dict, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.schedules.update_one(
        {"id": schedule_id, "school_id": current_user["school_id"]},
        {"$set": {**update_data, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Schedule updated successfully"}

@api_router.delete("/schedules/{schedule_id}")
async def delete_schedule(schedule_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.schedules.delete_one({"id": schedule_id, "school_id": current_user["school_id"]})
    return {"message": "Schedule deleted successfully"}

# Include router in app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_db_client():
    global db
    db = client[os.environ['DB_NAME']]

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()