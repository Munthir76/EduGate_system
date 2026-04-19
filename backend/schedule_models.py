# Additional models for Schedule and Ratings

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
import uuid

# Schedule Models
class ScheduleCreate(BaseModel):
    class_name: str
    day: str  # Monday, Tuesday, etc
    periods: List[dict]  # [{"time": "8:00-9:00", "subject": "Math", "teacher_id": "..."}]

class Schedule(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    school_id: str
    class_name: str
    day: str
    periods: List[dict]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Rating Models
class RatingCreate(BaseModel):
    target_id: str  # teacher_id or student_id
    target_type: str  # "teacher" or "student"
    rating: float  # 1-5
    category: str  # "teaching", "discipline", "attendance", etc
    notes: Optional[str] = None

class Rating(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    school_id: str
    rater_id: str  # who gave the rating
    rater_role: str  # "school_admin" or "teacher"
    target_id: str
    target_type: str
    rating: float
    category: str
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
