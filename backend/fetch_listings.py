import requests
import sqlite3
import os
from dotenv import load_dotenv
import csv

DATA_FOLDER = "../public"
CSV_FILE = os.path.join(DATA_FOLDER, "nyc_listings.csv")


def store_listings_in_csv():
    """Store rental listings in a CSV file instead of SQLite."""

    fake_listings = [
        ("NYC001", "123 Broadway", 3200, 2, 1, 850, 40.7128, -74.0060, "https://photos.zillowstatic.com/fp/fe9077ca9128a59d096dd1b4ccd19b8e-se_extra_large_1500_800.webp"),
        ("NYC002", "456 5th Ave", 4500, 3, 2, 1200, 40.7532, -73.9822, "https://photos.zillowstatic.com/fp/7b0de2b62c70d551ea735525e8016be7-se_extra_large_1500_800.webp"),
        ("NYC003", "789 Park Ave", 5500, 4, 3, 2000, 40.7711, -73.9644, "https://photos.zillowstatic.com/fp/db550ee89a24eeafcea63dbcd86ffc65-se_large_800_400.webp"),
        ("NYC004", "101 Wall S", 3800, 2, 1, 900, 40.7074, -74.0113, "https://photos.zillowstatic.com/fp/ef9d84397cb3347ca65ca7941dfc7f93-se_large_800_400.webp"),
        ("NYC005", "202 West End Ave", 6000, 3, 2.5, 1800, 40.7776, -73.9904, "https://photos.zillowstatic.com/fp/4b2e871d5e0b0e7ef07965e3c6a54840-se_large_800_400.webp"),
        ("NYC006", "300 Central Park West", 7200, 4, 3, 2500, 40.7851, -73.9695, "https://photos.zillowstatic.com/fp/547d538087426f934b22419ac3532d89-se_large_800_400.webp"),
        ("NYC007", "15 Hudson Yards", 8900, 3, 2.5, 1900, 40.7527, -74.0013, "https://photos.zillowstatic.com/fp/9aa2183cf42eea603679a2618625963b-se_large_800_400.webp"),
        ("NYC008", "88 Greenwich St", 4200, 2, 1.5, 1000, 40.7070, -74.0167, "https://photos.zillowstatic.com/fp/c4bc9cc01fce29e4220f64e3cb4d8a3e-se_large_800_400.webp"),
        ("NYC009", "252 East 57th St", 7800, 3, 2, 1600, 40.7595, -73.9648, "https://photos.zillowstatic.com/fp/101a59bd6075f4b5be7f1c387439d75b-se_large_800_400.webp"),
        ("NYC010", "520 West 28th St", 10500, 4, 4, 2800, 40.7487, -74.0048, "https://photos.zillowstatic.com/fp/18df7d9c23aff2012dce22e34b8231fe-se_large_800_400.webp"),
        ("NYC011", "10 West End Ave", 6700, 3, 2, 1700, 40.7744, -73.9921, "https://photos.zillowstatic.com/fp/a6a0671937e25e0f2e8f2b718544aa61-se_extra_large_1500_800.webp"),
        ("NYC012", "200 East 59th St", 4300, 1, 1, 750, 40.7616, -73.9652, "https://photos.zillowstatic.com/fp/4330739bde9b4907b913f22be9329c46-se_large_800_400.webp"),
        ("NYC013", "111 Murray St", 7200, 3, 1.5, 1300, 40.7146, -74.0129, "https://photos.zillowstatic.com/fp/15974145a7831767ab906d7272915428-se_large_800_400.webp"),
        ("NYC014", "432 Park Ave", 12500, 5, 4, 3200, 40.7615, -73.9718, "https://photos.zillowstatic.com/fp/d189ea833b21589be5a39a463422831e-se_large_800_400.webp"),
        ("NYC015", "80 Riverside Blvd", 7100, 3, 2.5, 1850, 40.7782, -73.9889, "https://photos.zillowstatic.com/fp/4b97ec8cc2337541ef21ae116710dc8f-se_large_800_400.webp")
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
