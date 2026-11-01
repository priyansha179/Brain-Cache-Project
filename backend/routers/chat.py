from fastapi import APIRouter
from pydantic import BaseModel
import vector_store
from google import genai
import os
from dotenv import load_dotenv

# Load the API key from the .env file
load_dotenv()

# Configure the new Gemini Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter()

class ChatRequest(BaseModel):
    query: str

@router.post("/chat")
def chat_with_brain(request: ChatRequest):
    # 1. RETRIEVAL: Search ChromaDB for the most relevant notes
    search_results = vector_store.search_notes(request.query, top_k=3)
    
    # Extract the actual text from the search results
    retrieved_documents = search_results['documents'][0]
    
    if not retrieved_documents:
        return {"ai_response": "I couldn't find any notes related to your question."}
        
    # 2. AUGMENTATION: Combine the notes into a context string
    context = "\n\n".join(retrieved_documents)
    
    # 3. GENERATION: Send the prompt to Gemini
    prompt = f"""You are BrainCache, a helpful AI assistant. 
Answer the user's question using ONLY the context provided below. 
If the answer is not in the context, say "I don't have a note about that."

Context:
{context}

User Question: {request.query}
"""
    
    try:
        # Call the Gemini API using the new SDK
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt
        )
        
        return {
            "query": request.query,
            "retrieved_context": retrieved_documents,
            "ai_response": response.text
        }
    except Exception as e:
        return {"error": f"Gemini API Error: {str(e)}"}