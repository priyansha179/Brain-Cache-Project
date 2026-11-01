from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from routers import tasks, notes, chat  # <-- Make sure 'chat' is imported here

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="BrainCache API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router)
app.include_router(notes.router)
app.include_router(chat.router)  # <-- Make sure 'chat' is included here

@app.get("/")
def read_root():
    return {"message": "Welcome to the BrainCache API"}