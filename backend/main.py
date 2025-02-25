from fastapi import FastAPI, HTTPException, Query
import sqlite3
from pydantic import BaseModel
from typing import List, Optional
import requests
import os

app = FastAPI()
DB_NAME = "data/rental_listings.db"
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "YOUR_GOOGLE_API_KEY")

# Database Connection
def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row  # Query results as dicts
    return conn

# Get rental listings with filtering
@app.get("/listings")
def get_listings(
    min_price: Optional[int] = Query(None),
    max_price: Optional[int] = Query(None),
    min_beds: Optional[int] = Query(None),
    max_beds: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    grocery: Optional[str] = Query(None),
    gym: Optional[str] = Query(None)
):
    conn = get_db_connection()
    c = conn.cursor()
    query = "SELECT * FROM listings WHERE 1=1"
    params = []
    
    if min_price:
        query += " AND price >= ?"
        params.append(min_price)
    if max_price:
        query += " AND price <= ?"
        params.append(max_price)
    if min_beds:
        query += " AND beds >= ?"
        params.append(min_beds)
    if max_beds:
        query += " AND beds <= ?"
        params.append(max_beds)
    if search:
        query += " AND address LIKE ?"
        params.append(f"%{search}%")
    
    c.execute(query, params)
    rows = c.fetchall()
    conn.close()
    
    listings = [{**dict(row)} for row in rows]
    
    if grocery:
        listings = add_nearest_place(listings, grocery, "supermarket")
    if gym:
        listings = add_nearest_place(listings, gym, "gym")
    
    return {"listings": listings}

# Add nearest grocery/gym to listings
def add_nearest_place(listings, keyword, place_type):
    for listing in listings:
        place = find_nearest_place(listing["latitude"], listing["longitude"], place_type, keyword)
        if place:
            listing[f"nearest_{place_type}"] = place
    return listings

# Google Places API search
def find_nearest_place(lat, lon, place_type, keyword):
    url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{lon}&radius=5000&type={place_type}&keyword={keyword}&key={GOOGLE_API_KEY}"
    response = requests.get(url)
    data = response.json()
    if "results" in data and data["results"]:
        place = data["results"][0]
        return {
            "name": place["name"],
            "lat": place["geometry"]["location"]["lat"],
            "lon": place["geometry"]["location"]["lng"],
            "distance": "N/A"  # Can add distance calculation later
        }
    return None

# Toggle favorite listing
class FavoriteRequest(BaseModel):
    listing_id: str
FAVORITES_DB = set()

@app.post("/favorites")
def toggle_favorite(request: FavoriteRequest):
    if request.listing_id in FAVORITES_DB:
        FAVORITES_DB.remove(request.listing_id)
        return {"message": "Removed from favorites"}
    else:
        FAVORITES_DB.add(request.listing_id)
        return {"message": "Added to favorites"}

# Run: uvicorn main:app --reload
