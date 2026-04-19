import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
from datetime import datetime, timezone
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def seed_database():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("Seeding database...")
    
    # Clear existing data
    await db.users.delete_many({})
    await db.schools.delete_many({})
    await db.students.delete_many({})
    await db.teachers.delete_many({})
    await db.parents.delete_many({})
    await db.attendance.delete_many({})
    await db.grades.delete_many({})
    await db.fees.delete_many({})
    await db.assignments.delete_many({})
    
    # Create Super Admin
    super_admin_id = str(uuid.uuid4())
    super_admin = {
        "id": super_admin_id,
        "username": "superadmin",
        "password_hash": hash_password("admin123"),
        "full_name": "Super Admin",
        "email": "admin@schoolsystem.com",
        "role": "super_admin",
        "school_id": None,
        "language": "ar",
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(super_admin)
    print(f"✓ Created Super Admin (username: superadmin, password: admin123)")
    
    # Create a demo school
    school_id = str(uuid.uuid4())
    school = {
        "id": school_id,
        "name": "مدرسة النور النموذجية",
        "name_ar": "مدرسة النور النموذجية",
        "name_fr": "École Modèle Al-Nour",
        "address": "باماكو، مالي",
        "phone": "+223 20 22 44 55",
        "email": "info@alnour.edu.ml",
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.schools.insert_one(school)
    print(f"✓ Created Demo School: {school['name']}")
    
    # Create School Admin
    school_admin_id = str(uuid.uuid4())
    school_admin = {
        "id": school_admin_id,
        "username": "schooladmin",
        "password_hash": hash_password("admin123"),
        "full_name": "أحمد محمد",
        "email": "admin@alnour.edu.ml",
        "role": "school_admin",
        "school_id": school_id,
        "language": "ar",
        "phone": "+223 70 11 22 33",
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(school_admin)
    print(f"✓ Created School Admin (username: schooladmin, password: admin123)")
    
    # Create Demo Teacher
    teacher_user_id = str(uuid.uuid4())
    teacher_user = {
        "id": teacher_user_id,
        "username": "teacher1",
        "password_hash": hash_password("teacher123"),
        "full_name": "فاطمة إبراهيم",
        "email": "fatima@alnour.edu.ml",
        "role": "teacher",
        "school_id": school_id,
        "language": "ar",
        "phone": "+223 70 22 33 44",
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(teacher_user)
    
    teacher_id = str(uuid.uuid4())
    teacher = {
        "id": teacher_id,
        "user_id": teacher_user_id,
        "school_id": school_id,
        "subjects": ["الرياضيات", "العلوم"],
        "classes": ["الصف الخامس أ", "الصف السادس ب"],
        "specialization": "الرياضيات",
        "hire_date": datetime.now(timezone.utc).isoformat(),
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.teachers.insert_one(teacher)
    print(f"✓ Created Demo Teacher (username: teacher1, password: teacher123)")
    
    # Create Demo Parent
    parent_user_id = str(uuid.uuid4())
    parent_user = {
        "id": parent_user_id,
        "username": "parent1",
        "password_hash": hash_password("parent123"),
        "full_name": "محمد علي",
        "email": "mohamed@example.com",
        "role": "parent",
        "school_id": school_id,
        "language": "ar",
        "phone": "+223 70 33 44 55",
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(parent_user)
    
    parent_id = str(uuid.uuid4())
    parent = {
        "id": parent_id,
        "user_id": parent_user_id,
        "school_id": school_id,
        "relationship": "father",
        "student_ids": [],
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.parents.insert_one(parent)
    print(f"✓ Created Demo Parent (username: parent1, password: parent123)")
    
    # Create Demo Students
    students_data = [
        {"name": "عائشة محمد", "class": "الصف الخامس أ", "grade": "الابتدائي"},
        {"name": "عمر أحمد", "class": "الصف السادس ب", "grade": "الابتدائي"},
        {"name": "زينب حسن", "class": "الصف الخامس أ", "grade": "الابتدائي"}
    ]
    
    student_ids = []
    for i, student_data in enumerate(students_data, 1):
        student_user_id = str(uuid.uuid4())
        student_user = {
            "id": student_user_id,
            "username": f"student{i}",
            "password_hash": hash_password("student123"),
            "full_name": student_data["name"],
            "email": f"student{i}@alnour.edu.ml",
            "role": "student",
            "school_id": school_id,
            "language": "ar",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(student_user)
        
        student_id = str(uuid.uuid4())
        student = {
            "id": student_id,
            "user_id": student_user_id,
            "school_id": school_id,
            "parent_id": parent_id,
            "class_name": student_data["class"],
            "grade": student_data["grade"],
            "date_of_birth": "2012-01-15",
            "address": "باماكو، مالي",
            "enrollment_date": datetime.now(timezone.utc).isoformat(),
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.students.insert_one(student)
        student_ids.append(student_id)
        print(f"✓ Created Demo Student: {student_data['name']} (username: student{i}, password: student123)")
    
    # Update parent with student IDs
    await db.parents.update_one(
        {"id": parent_id},
        {"$set": {"student_ids": student_ids}}
    )
    
    # Create some attendance records
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    for student_id in student_ids[:2]:
        attendance = {
            "id": str(uuid.uuid4()),
            "student_id": student_id,
            "school_id": school_id,
            "class_name": "الصف الخامس أ",
            "date": today,
            "status": "present",
            "notes": "",
            "recorded_by": teacher_user_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.attendance.insert_one(attendance)
    
    # Mark one student absent
    attendance = {
        "id": str(uuid.uuid4()),
        "student_id": student_ids[2],
        "school_id": school_id,
        "class_name": "الصف السادس ب",
        "date": today,
        "status": "absent",
        "notes": "مريض",
        "recorded_by": teacher_user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.attendance.insert_one(attendance)
    print(f"✓ Created attendance records for today")
    
    # Create some fees
    for student_id in student_ids:
        fee = {
            "id": str(uuid.uuid4()),
            "school_id": school_id,
            "student_id": student_id,
            "amount": 50000.0,
            "paid_amount": 25000.0,
            "discount": 0.0,
            "fee_type": "tuition",
            "due_date": "2025-12-31",
            "academic_year": "2024-2025",
            "semester": "1",
            "description": "رسوم الفصل الدراسي الأول",
            "status": "partial",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.fees.insert_one(fee)
    print(f"✓ Created fee records")
    
    print("\n=== Database Seeded Successfully ===")
    print("\nLogin Credentials:")
    print("\nSuper Admin:")
    print("  Username: superadmin")
    print("  Password: admin123")
    print("\nSchool Admin:")
    print("  Username: schooladmin")
    print("  Password: admin123")
    print("\nTeacher:")
    print("  Username: teacher1")
    print("  Password: teacher123")
    print("\nParent:")
    print("  Username: parent1")
    print("  Password: parent123")
    print("\nStudents:")
    print("  Username: student1, student2, student3")
    print("  Password: student123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
