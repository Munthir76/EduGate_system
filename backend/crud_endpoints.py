# CRUD Endpoints للتعديل والحذف - يتم استيرادها في server.py

from fastapi import HTTPException, Depends
from datetime import datetime, timezone

# سيتم استيراد المتغيرات المطلوبة من server.py
# db, get_current_user, api_router

async def update_teacher_endpoint(teacher_id: str, update_data: dict, current_user: dict, db):
    """تحديث بيانات معلم"""
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if teacher exists and belongs to same school
    teacher = await db.teachers.find_one(
        {"id": teacher_id, "school_id": current_user["school_id"]}, 
        {"_id": 0}
    )
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    # Update teacher fields
    allowed_fields = ["subjects", "classes", "specialization", "is_active"]
    teacher_update = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    if teacher_update:
        teacher_update["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.teachers.update_one(
            {"id": teacher_id},
            {"$set": teacher_update}
        )
    
    # Update user fields (full_name, email, phone)
    user_allowed_fields = ["full_name", "email", "phone"]
    user_update = {k: v for k, v in update_data.items() if k in user_allowed_fields}
    
    if user_update:
        user_update["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.users.update_one(
            {"id": teacher["user_id"]},
            {"$set": user_update}
        )
    
    if not teacher_update and not user_update:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    return {"message": "Teacher updated successfully", "teacher_id": teacher_id}


async def delete_teacher_endpoint(teacher_id: str, current_user: dict, db):
    """حذف معلم (soft delete)"""
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if teacher exists and belongs to same school
    teacher = await db.teachers.find_one(
        {"id": teacher_id, "school_id": current_user["school_id"]}, 
        {"_id": 0}
    )
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    # Soft delete
    await db.teachers.update_one(
        {"id": teacher_id},
        {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Deactivate user account
    await db.users.update_one(
        {"id": teacher["user_id"]},
        {"$set": {"is_active": False}}
    )
    
    return {"message": "Teacher deleted successfully", "teacher_id": teacher_id}


async def update_student_endpoint(student_id: str, update_data: dict, current_user: dict, db):
    """تحديث بيانات طالب"""
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if student exists and belongs to same school
    student = await db.students.find_one(
        {"id": student_id, "school_id": current_user["school_id"]}, 
        {"_id": 0}
    )
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Update student fields
    allowed_fields = ["class_name", "grade", "parent_id", "date_of_birth", "address", "medical_info", "is_active"]
    student_update = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    if student_update:
        student_update["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.students.update_one(
            {"id": student_id},
            {"$set": student_update}
        )
    
    # Update user fields
    user_allowed_fields = ["full_name", "email", "phone"]
    user_update = {k: v for k, v in update_data.items() if k in user_allowed_fields}
    
    if user_update:
        user_update["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.users.update_one(
            {"id": student["user_id"]},
            {"$set": user_update}
        )
    
    if not student_update and not user_update:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    return {"message": "Student updated successfully", "student_id": student_id}


async def delete_student_endpoint(student_id: str, current_user: dict, db):
    """حذف طالب (soft delete)"""
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if student exists and belongs to same school
    student = await db.students.find_one(
        {"id": student_id, "school_id": current_user["school_id"]}, 
        {"_id": 0}
    )
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Soft delete
    await db.students.update_one(
        {"id": student_id},
        {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Deactivate user account
    await db.users.update_one(
        {"id": student["user_id"]},
        {"$set": {"is_active": False}}
    )
    
    return {"message": "Student deleted successfully", "student_id": student_id}


async def update_parent_endpoint(parent_id: str, update_data: dict, current_user: dict, db):
    """تحديث بيانات ولي أمر"""
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if parent exists and belongs to same school
    parent = await db.parents.find_one(
        {"id": parent_id, "school_id": current_user["school_id"]}, 
        {"_id": 0}
    )
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")
    
    # Update parent fields
    allowed_fields = ["relationship", "student_ids", "is_active"]
    parent_update = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    if parent_update:
        parent_update["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.parents.update_one(
            {"id": parent_id},
            {"$set": parent_update}
        )
    
    # Update user fields
    user_allowed_fields = ["full_name", "email", "phone"]
    user_update = {k: v for k, v in update_data.items() if k in user_allowed_fields}
    
    if user_update:
        user_update["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.users.update_one(
            {"id": parent["user_id"]},
            {"$set": user_update}
        )
    
    if not parent_update and not user_update:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    return {"message": "Parent updated successfully", "parent_id": parent_id}


async def delete_parent_endpoint(parent_id: str, current_user: dict, db):
    """حذف ولي أمر (soft delete)"""
    if current_user["role"] not in ["school_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if parent exists and belongs to same school
    parent = await db.parents.find_one(
        {"id": parent_id, "school_id": current_user["school_id"]}, 
        {"_id": 0}
    )
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")
    
    # Soft delete
    await db.parents.update_one(
        {"id": parent_id},
        {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Deactivate user account
    await db.users.update_one(
        {"id": parent["user_id"]},
        {"$set": {"is_active": False}}
    )
    
    return {"message": "Parent deleted successfully", "parent_id": parent_id}
