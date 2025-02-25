import requests
import sqlite3
import os
from dotenv import load_dotenv
import csv

DATA_FOLDER = "public"
CSV_FILE = os.path.join(DATA_FOLDER, "nyc_listings.csv")


def store_listings_in_csv():
    """Store rental listings in a CSV file instead of SQLite."""

    fake_listings = [
        ("NYC001", "123 Broadway, New York, NY 10001", 3200, 2, 1, 850, 40.7128, -74.0060, "https://via.placeholder.com/150"),
        ("NYC002", "456 5th Ave, New York, NY 10018", 4500, 3, 2, 1200, 40.7532, -73.9822, "https://via.placeholder.com/150"),
        ("NYC003", "789 Park Ave, New York, NY 10021", 5500, 4, 3, 2000, 40.7711, -73.9644, "https://via.placeholder.com/150"),
        ("NYC004", "101 Wall St, New York, NY 10005", 3800, 2, 1, 900, 40.7074, -74.0113, "https://via.placeholder.com/150"),
        ("NYC005", "202 West End Ave, New York, NY 10023", 6000, 3, 2.5, 1800, 40.7776, -73.9904, "https://via.placeholder.com/150"),
    ]
    os.makedirs(DATA_FOLDER, exist_ok=True)
    # Define the CSV headers
    headers = ["id", "address", "price", "beds", "baths", "sqft", "latitude", "longitude", "photo"]

    # Write the data to a CSV file
    with open(CSV_FILE, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(headers)  # Write header row
        writer.writerows(fake_listings)  # Write listing data

    print(f"✅ Successfully stored {len(fake_listings)} listings in {CSV_FILE}")

if __name__ == "__main__":
    store_listings_in_csv()


# load_dotenv() 

# DB_NAME = "rental_listings.db"
# # REPLIERS_API_URL = "https://api.repliers.io/listings"
# # MAX_LISTINGS = 2  # ✅ Store multiple listings
# # API_KEY = os.getenv("REPLIERS_API_KEY")

# # print(f"🔑 API Key Loaded: {API_KEY}")

# def fetch_and_store_listings():
#     """Fetch rental listings from Repliers API and store in SQLite."""
#     # if not API_KEY:
#     #     print("🚨 Missing API key! Set REPLIERS_API_KEY in environment variables.")
#     #     return

#     # params = {
#     #     "pageNum": 1, 
#     #     "resultsPerPage": 2,
#     #     "class":"residential",
#     #     "type":"lease",
#     #     "state":"CA"# ✅ Fetch two listings
#     # }
#     # headers = {
#     #     "REPLIERS-API-KEY": API_KEY,
#     #     "Content-Type": "application/json"
#     # }

#     # try:
#     #     response = requests.get(REPLIERS_API_URL, params=params, headers=headers)
#     #     response.raise_for_status()
#     #     data = response.json()
#     #     print(f"📤 Sent URL: {response.url}")
#     #     print(f"🔄 API Raw Response: {data}")

#     #     if not isinstance(data, dict) or "listings" not in data:
#     #         print("🚨 Unexpected API response format:", data)
#     #         return

#     #     listings = data.get("listings", [])[:MAX_LISTINGS]
#     # except requests.RequestException as e:
#     #     print(f"🚨 Error fetching listings: {e}")
#     #     return

#     conn = sqlite3.connect(DB_NAME)
#     c = conn.cursor()
    
#     c.execute("DROP TABLE IF EXISTS listings")

#     c.execute('''CREATE TABLE IF NOT EXISTS listings (
#                     id TEXT PRIMARY KEY, 
#                     address TEXT, 
#                     price REAL, 
#                     beds INTEGER, 
#                     baths INTEGER, 
#                     sqft INTEGER, 
#                     latitude REAL, 
#                     longitude REAL, 
#                     photo TEXT)''')
#     fake_listings = [
#         ("NYC001", "123 Broadway, New York, NY 10001", 3200, 2, 1, 850, 40.7128, -74.0060, "https://via.placeholder.com/150"),
#         ("NYC002", "456 5th Ave, New York, NY 10018", 4500, 3, 2, 1200, 40.7532, -73.9822, "https://via.placeholder.com/150"),
#         ("NYC003", "789 Park Ave, New York, NY 10021", 5500, 4, 3, 2000, 40.7711, -73.9644, "https://via.placeholder.com/150"),
#         ("NYC004", "101 Wall St, New York, NY 10005", 3800, 2, 1, 900, 40.7074, -74.0113, "https://via.placeholder.com/150"),
#         ("NYC005", "202 West End Ave, New York, NY 10023", 6000, 3, 2.5, 1800, 40.7776, -73.9904, "https://via.placeholder.com/150"),
#     ]
#     # for listing in fake_listings:
#     #     if not isinstance(listing, dict):
#     #         print(f"🚨 Skipping invalid listing entry: {listing}")
#     #         continue

#     #     # Extract values safely
#     #     listing_id = listing.get("mlsNumber")
#     #     address_data = listing.get("address", {})
#     #     formatted_address = f"{address_data.get('streetNumber', '')} {address_data.get('streetName', '')} {address_data.get('streetSuffix', '')}, {address_data.get('city', '')}, {address_data.get('state', '')} {address_data.get('zip', '')}"

#     #     price = listing.get("listPrice", 0)
#     #     details = listing.get("details", {})
#     #     beds = details.get("numBedrooms", 0)
#     #     baths = details.get("numBathrooms", 0)
#     #     sqft = details.get("sqft", 0)

#     #     map_data = listing.get("map", {})
#     #     latitude = map_data.get("latitude")
#     #     longitude = map_data.get("longitude")

#     #     photos = listing.get("images", [])
#     #     photo = photos[0] if photos else None  # Store first image

#         # Insert into database
#         # c.execute('''INSERT OR REPLACE INTO listings (id, address, price, beds, baths, sqft, latitude, longitude, photo)
#                     #  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
#                 #   (listing_id, formatted_address, price, beds, baths, sqft, latitude, longitude, photo))
#     c.executemany('''INSERT INTO listings (id, address, price, beds, baths, sqft, latitude, longitude, photo)
#                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''', fake_listings)
#     conn.commit()
#     conn.close()
#     print(f"✅ Successfully stored {len(fake_listings)} listings.")

# if __name__ == "__main__":
#     fetch_and_store_listings()
