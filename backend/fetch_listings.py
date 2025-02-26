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
        ("NYC001", "123 Broadway", 3200, 2, 1, 850, 40.7128, -74.0060, "https://photos.zillowstatic.com/fp/fe9077ca9128a59d096dd1b4ccd19b8e-se_extra_large_1500_800.webp"),
        ("NYC002", "456 5th Ave", 4500, 3, 2, 1200, 40.7532, -73.9822, "https://photos.zillowstatic.com/fp/7b0de2b62c70d551ea735525e8016be7-se_extra_large_1500_800.webp"),
        ("NYC003", "789 Park Ave", 5500, 4, 3, 2000, 40.7711, -73.9644, "https://photos.zillowstatic.com/fp/db550ee89a24eeafcea63dbcd86ffc65-se_large_800_400.webp"),
        ("NYC004", "101 Wall S", 3800, 2, 1, 900, 40.7074, -74.0113, "https://photos.zillowstatic.com/fp/ef9d84397cb3347ca65ca7941dfc7f93-se_large_800_400.webp"),
        ("NYC005", "202 West End Ave", 6000, 3, 2.5, 1800, 40.7776, -73.9904, "https://photos.zillowstatic.com/fp/4b2e871d5e0b0e7ef07965e3c6a54840-se_large_800_400.webp"),
        ("NYC006", "12 East 86th St", 3200, 1, 1, 750, 40.7794, -73.9574, "https://www.equityapartments.com/new-york-city/upper-east-side/12-east-86th-st-apartments"),
    ("NYC007", "200 East 39th St", 4500, 2, 2, 1100, 40.7480, -73.9761, "https://www.equityapartments.com/new-york-city/midtown-east/200-east-39th-st-apartments"),
    ("NYC008", "777 6th Ave", 5000, 2, 2, 1150, 40.7440, -73.9920, "https://www.equityapartments.com/new-york-city/chelsea/777-6th-avenue-apartments"),
    ("NYC009", "101 West End Ave", 6000, 3, 2.5, 1500, 40.7740, -73.9900, "https://www.equityapartments.com/new-york-city/upper-west-side/101-west-end-apartments"),
    ("NYC010", "505 West 37th St", 4800, 2, 2, 1200, 40.7560, -73.9960, "https://www.equityapartments.com/new-york-city/midtown-west/505-west-37th-street-apartments"),
    ("NYC011", "10 Hanover Square", 5200, 2, 2, 1300, 40.7040, -74.0090, "https://www.equityapartments.com/new-york-city/financial-district/10-hanover-square-apartments"),
    ("NYC012", "180 Montague St", 4000, 1, 1, 800, 40.6940, -73.9920, "https://www.equityapartments.com/new-york-city/brooklyn-heights/180-montague-apartments"),
    ("NYC013", "34 Berry St", 3700, 1, 1, 850, 40.7190, -73.9610, "https://www.equityapartments.com/new-york-city/williamsburg/34-berry-apartments"),
    ("NYC014", "The Sagamore, 189 West 89th St", 4100, 1, 1, 900, 40.7880, -73.9740, "https://www.equityapartments.com/new-york-city/upper-west-side/the-sagamore-apartments"),
    ("NYC015", "The Westminster, 180 West 20th St", 4700, 2, 2, 1100, 40.7420, -73.9960, "https://www.equityapartments.com/new-york-city/chelsea/the-westminster-apartments"),
    ("NYC016", "The Tate, 535 West 23rd St", 4900, 2, 2, 1150, 40.7480, -74.0060, "https://www.equityapartments.com/new-york-city/chelsea/the-tate-apartments"),
    ("NYC017", "The Olivia, 315 West 33rd St", 4600, 2, 2, 1050, 40.7530, -73.9960, "https://www.equityapartments.com/new-york-city/midtown-west/the-olivia-apartments"),
    ("NYC018", "The Larstrand, 277 West 77th St", 5300, 2, 2, 1200, 40.7830, -73.9800, "https://www.equityapartments.com/new-york-city/upper-west-side/the-larstrand-apartments"),
    ("NYC019", "The Pearl, 400 East 66th St", 5500, 3, 2.5, 1400, 40.7650, -73.9550, "https://www.equityapartments.com/new-york-city/upper-east-side/the-pearl-apartments"),
    ("NYC020", "The Monterey, 175 East 96th St", 4300, 1, 1, 950, 40.7850, -73.9500, "https://www.equityapartments.com/new-york-city/upper-east-side/the-monterey-apartments"),
    ("NYC021", "The Biltmore, 271 West 47th St", 4800, 2, 2, 1100, 40.7590, -73.9870, "https://www.equityapartments.com/new-york-city/midtown-west/the-biltmore-apartments"),
    ("NYC022", "The Capitol, 776 6th Ave", 5000, 2, 2, 1150, 40.7440, -73.9920, "https://www.equityapartments.com/new-york-city/chelsea/the-capitol-apartments"),
    ("NYC023", "The Vanguard Chelsea, 77 West 24th St", 5200, 2, 2, 1200, 40.7440, -73.9920, "https://www.equityapartments.com/new-york-city/chelsea/the-vanguard-chelsea-apartments"),
    ("NYC024", "The Verdesian, 211 North End Ave", 5400, 2, 2, 1250, 40.7150, -74.0150, "https://www.equityapartments.com/new-york-city/battery-park-city/the-verdesian-apartments"),
    ("NYC025", "The Solaire, 20 River Terrace", 5600, 3, 2.5, 1500, 40.7150, -74.0150, "https://www.equityapartments.com/new-york-city/battery-park-city/the-solaire-apartments"),
    ("NYC026", "The Vanguard, 77 West 24th St", 4800, 2, 2, 1100, 40.7440, -73.9920, "https://www.equityapartments.com/new-york-city/chelsea/the-vanguard-apartments")
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
