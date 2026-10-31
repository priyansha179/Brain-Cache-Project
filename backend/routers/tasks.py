from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import models
from database import get_db

router = APIRouter()

# 1. Updated Schema to accept the new fields
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool = False
    due_date: Optional[datetime] = None
    urgency_level: int = 1
    category: str = "General"

class TaskUpdate(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool = False
    due_date: Optional[datetime] = None
    urgency_level: int = 1
    category: str = "General"

# Helper function for the Proposal's Algorithm
def calculate_priority_score(task):
    # 1. Deadline Urgency (0.5 weight)
    if task.due_date:
        # Make sure timezones match
        now = datetime.now(timezone.utc)
        due = task.due_date.replace(tzinfo=timezone.utc)
        days_remaining = (due - now).days
        
        if days_remaining <= 0:
            deadline_urgency = 1.0 # Due today or overdue = max urgency
        else:
            deadline_urgency = 1.0 / (days_remaining + 1) # Inverse of days remaining
    else:
        deadline_urgency = 0.0

    # 2. Urgency Level (0.3 weight) - Divide by 3 so max is 1.0
    urgency_score = task.urgency_level / 3.0

    # 3. Recency Score (0.1 weight) - Tasks created recently get a slight boost
    now = datetime.now(timezone.utc)
    created = task.created_at.replace(tzinfo=timezone.utc)
    days_old = (now - created).days
    recency_score = 1.0 if days_old == 0 else (1.0 / (days_old + 1))

    # 4. Category Weight (0.1 weight) - Example: Work gets slightly higher priority
    category_weights = {"Work": 1.0, "Study": 0.8, "Personal": 0.5}
    category_score = category_weights.get(task.category, 0.5)

    # FINAL FORMULA from Proposal Section 3.3.4
    final_score = (0.5 * deadline_urgency) + (0.3 * urgency_score) + (0.1 * recency_score) + (0.1 * category_score)
    
    return final_score


# 2. CREATE a Task
@router.post("/tasks")
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    new_task = models.Task(
        title=task.title, 
        description=task.description,
        completed=task.completed,
        due_date=task.due_date,
        urgency_level=task.urgency_level,
        category=task.category
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

# 3. READ all Tasks (SORTED BY PRIORITY!)
@router.get("/tasks")
def get_tasks(db: Session = Depends(get_db)):
    tasks = db.query(models.Task).all()
    
    # Sort tasks dynamically based on the algorithm
    # If a task is completed, push it to the bottom (priority 0)
    sorted_tasks = sorted(
        tasks, 
        key=lambda t: calculate_priority_score(t) if not t.completed else -1, 
        reverse=True
    )
    return sorted_tasks

# 4. READ a single Task by ID
@router.get("/tasks/{task_id}")
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

# 5. UPDATE a Task
@router.put("/tasks/{task_id}")
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.title = task_update.title
    task.description = task_update.description
    task.completed = task_update.completed
    task.due_date = task_update.due_date
    task.urgency_level = task_update.urgency_level
    task.category = task_update.category
    
    db.commit()
    db.refresh(task)
    return task

# 6. DELETE a Task
@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}