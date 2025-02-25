from fastapi import FastAPI
import sqlite3
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🔥 Allows all origins (for development). Restrict in production.
    allow_credentials=True,
    allow_methods=["*"],  # ✅ Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # ✅ Allow all headers
)

DB_NAME = "rental_listings.db"

@app.get("/listings")
def get_listings():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute("SELECT * FROM listings")
    listings = [dict(row) for row in c.fetchall()]
    
    conn.close()
    return {"listings": listings}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
