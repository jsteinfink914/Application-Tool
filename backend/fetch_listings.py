import requests
import sqlite3
import os

API_KEY = os.getenv("REPLIERS_API_KEY", "YOUR_REPLIERS_API_KEY")
API_URL = "https://api.repliers.io/listings?location=New%20York%20City&type=rent"

DB_NAME = "data/rental_listings.db"

def create_database():
    """Create the listings table if it doesn't exist."""
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS listings (
                    id TEXT PRIMARY KEY,
                    address TEXT,
                    price INTEGER,
                    beds INTEGER,
                    baths INTEGER,
                    sqft INTEGER,
                    latitude REAL,
                    longitude REAL,
                    photo TEXT,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    conn.commit()
    conn.close()


def fetch_listings():
    """Fetch rental listings from Repliers API and store them in the database."""
    headers = {"Authorization": f"Bearer {API_KEY}"}
    response = requests.get(API_URL, headers=headers)

    if response.status_code == 200:
        data = response.json()
        listings = data.get("listings", [])

        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()

        for listing in listings:
            c.execute('''INSERT OR REPLACE INTO listings (id, address, price, beds, baths, sqft, latitude, longitude, photo)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''', 
                      (listing["id"], listing["address"], listing["price"], listing["beds"], listing["baths"], 
                       listing["sqft"], listing.get("latitude", 0), listing.get("longitude", 0), listing["photos"][0]))

        conn.commit()
        conn.close()
        print(f"Stored {len(listings)} listings successfully.")

    else:
        print(f"Error fetching data: {response.status_code} - {response.text}")


if __name__ == "__main__":
    create_database()
    fetch_listings()
