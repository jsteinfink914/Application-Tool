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
        ("NYC006", "234 East 50th St", 3100, 1, 1, 700, 40.7540, -73.9680, "https://www.glenwoodnyc.com/wp-content/uploads/2019/01/encore-living-room.jpg"),
        ("NYC007", "567 West 42nd St", 4800, 2, 2, 1100, 40.7600, -73.9960, "https://www.apartments.com/images/default-source/default-album/the-eugene.jpg"),
        ("NYC008", "890 Columbus Ave", 3700, 2, 1.5, 950, 40.7980, -73.9640, "https://gtspirit.com/wp-content/uploads/2015/09/nyc-apartment.jpg"),
        ("NYC009", "123 East 88th St", 4500, 3, 2, 1300, 40.7800, -73.9550, "https://www.freshpalace.com/wp-content/uploads/2014/09/manhattan-apartment.jpg"),
        ("NYC010", "456 West End Ave", 5200, 3, 2.5, 1500, 40.7850, -73.9800, "https://www.zumper.com/blog/wp-content/uploads/2015/07/luxury-nyc-apartment.jpg"),
        ("NYC011", "789 Lexington Ave", 2900, 1, 1, 650, 40.7620, -73.9700, "https://kellyinthecity.com/wp-content/uploads/2014/08/nyc-apartment-search.jpg"),
        ("NYC012", "1010 Park Ave", 6100, 4, 3.5, 2000, 40.7780, -73.9600, "https://www.homedit.com/wp-content/uploads/2015/07/nyc-luxury-apartment.jpg"),
        ("NYC013", "2020 Broadway", 3300, 2, 1, 900, 40.7750, -73.9800, "https://www.architecturaldigest.com/story/nyc-apartment-beach-vibes.jpg"),
        ("NYC014", "3030 5th Ave", 4700, 3, 2, 1400, 40.7500, -73.9900, "https://www.thetimes.co.uk/images/serviced-apartments-nyc.jpg"),
        ("NYC015", "4040 Madison Ave", 3500, 2, 1.5, 1000, 40.7600, -73.9750, "https://nypost.com/wp-content/uploads/2025/02/nyc-apartment-subway.jpg"),
        ("NYC016", "5050 7th Ave", 3900, 2, 2, 1050, 40.7100, -74.0100, "https://www.ft.com/content/nyc-apartment-5m.jpg"),
        ("NYC017", "6060 3rd Ave", 4200, 3, 2, 1200, 40.7300, -73.9900, "https://www.curbed.com/images/nyc-apartments.jpg"),
        ("NYC018", "7070 2nd Ave", 3100, 1, 1, 750, 40.7200, -73.9800, "https://www.apartments.com/images/nyc-apartment.jpg"),
        ("NYC019", "8080 1st Ave", 4600, 3, 2.5, 1450, 40.7400, -73.9700, "https://www.renthop.com/images/nyc-apartment.jpg"),
        ("NYC020", "9090 Amsterdam Ave", 3400, 2, 1.5, 950, 40.8000, -73.9700, "https://www.trulia.com/images/nyc-apartment.jpg"),
        ("NYC021", "1111 Riverside Dr", 3800, 2, 2, 1100, 40.8100, -73.9600, "https://www.zillow.com/images/nyc-apartment.jpg"),
        ("NYC022", "1212 York Ave", 5000, 3, 2.5, 1600, 40.7600, -73.9500, "https://www.realtor.com/images/nyc-apartment.jpg"),
        ("NYC023", "1313 8th Ave", 3200, 1, 1, 800, 40.6700, -73.9800, "https://www.rentcafe.com/images/nyc-apartment.jpg"),
        ("NYC024", "1414 9th Ave", 3700, 2, 1.5, 1000, 40.6800, -73.9900, "https://www.instagram.com/p/nyc-apartment.jpg"),
        ("NYC025", "1515 10th Ave", 4100, 2, 2, 1150, 40.6900, -74.0000, "https://www.apartmentlist.com/images/nyc-apartment.jpg"),
        ("NYC026", "1616 11th Ave", 4500, 3, 2, 1300, 40.7000, -74.0100, "https://people.com/images/nyc-apartment.jpg"),
        ("NYC027", "1717 12th Ave", 2900, 1, 1, 700, 40.7100, -74.0200, "https://www.curbed.com/images/nyc-apartment.jpg"),
        ("NYC028", "1818 13th Ave", 5300, 4, 3, 1800, 40.7200, -74.0300, "https://nypost.com/images/nyc-apartment.jpg"),
        ("NYC029", "1919 14th Ave", 3100, 1, 1, 750, 40.7300, -74.0400, "https://en.wikipedia.org/wiki/StreetEasy#/media/File:nyc-apartment.jpg"),
        ("NYC030", "2021 15th Ave", 4800, 3, 2.5, 1500, 40.7400, -74.0500, "https://www.glenwoodnyc.com/images/nyc-apartment.jpg")
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
