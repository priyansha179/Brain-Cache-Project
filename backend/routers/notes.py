from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import models
from database import get_db
import vector_store  # <-- Added this import for the AI database

# 1. Initialize the router
router = APIRouter()

# 2. Schema for validating note data
class NoteCreate(BaseModel):
    title: str
    content: str

# 3. CREATE a Note
@router.post("/notes")
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    # Save to SQL Database
    new_note = models.Note(
        title=note.title, 
        content=note.content
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    
    # Save to ChromaDB (Vector Database) for AI Semantic Search
    vector_store.add_note_to_vector_db(new_note.id, new_note.title, new_note.content)
    
    return new_note

# 4. READ all Notes
@router.get("/notes")
def get_notes(db: Session = Depends(get_db)):
    notes = db.query(models.Note).all()
    return notes

# 5. READ a single Note by ID
@router.get("/notes/{note_id}")
def get_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

# 6. UPDATE a Note
@router.put("/notes/{note_id}")
def update_note(note_id: int, note_update: NoteCreate, db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    note.title = note_update.title
    note.content = note_update.content
    
    db.commit()
    db.refresh(note)
    
    # Note: In a full production app, you would also update the vector database here.
    # For now, we are just updating the SQL database.
    
    return note

# 7. DELETE a Note
@router.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(note)
    db.commit()
    
    # Note: In a full production app, you would also delete it from ChromaDB here.
    
    return {"message": "Note deleted successfully"}