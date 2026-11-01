import chromadb
from sentence_transformers import SentenceTransformer

# 1. Initialize the ChromaDB client (it will save to a folder called 'chroma_db')
chroma_client = chromadb.PersistentClient(path="./chroma_db")

# 2. Create or get the collection where our notes will be stored
# This is like a "table" in a normal database
collection = chroma_client.get_or_create_collection(name="brain_cache_notes")

# 3. Load the embedding model specified in your proposal (all-MiniLM-L6-v2)
# This model turns text into vector numbers
print("Loading embedding model... (This might take a few seconds the first time)")
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model loaded successfully!")

def add_note_to_vector_db(note_id: int, title: str, content: str):
    """Takes a note, converts it to a vector, and saves it to ChromaDB"""
    
    # Combine title and content for better search results
    text_to_embed = f"Title: {title}\nContent: {content}"
    
    # Generate the embedding (the vector)
    embedding = embedding_model.encode(text_to_embed).tolist()
    
    # Save to ChromaDB
    collection.add(
        embeddings=[embedding],
        documents=[text_to_embed],
        metadatas=[{"note_id": note_id, "title": title}],
        ids=[str(note_id)] # ChromaDB requires IDs to be strings
    )
    print(f"Note {note_id} added to vector database.")

def search_notes(query: str, top_k: int = 3):
    """Searches ChromaDB for notes semantically similar to the query"""
    
    # Convert the user's query into a vector
    query_embedding = embedding_model.encode(query).tolist()
    
    # Search the database
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )
    
    return results