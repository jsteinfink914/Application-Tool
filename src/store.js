import { writable } from 'svelte/store';
import Papa from 'papaparse';
import { get } from 'svelte/store'; 

export const listings = writable([]);
export const favorites = writable([]);
export const selectedAttributes = writable(['price', 'sq_ft', 'laundry in building', 'doorman', 'dishwasher']);
export const userPreferences = writable({ grocery: '', gym: '' });

// Function to update user preferences
export function updateUserPreferences(preferences) {
  userPreferences.set(preferences);
}

// Function to toggle favorite listings
export function toggleFavorite(listing) {
  favorites.update(favs => {
    const exists = favs.some(fav => fav.address === listing.address);
    return exists ? favs.filter(fav => fav.address !== listing.address) : [...favs, { ...listing }];
  });
};

// Function to get comparison data from favorites
export function getCompareData() {
  let compareData = [];

  // Get current selected attributes
  const attrs = get(selectedAttributes);

  // Get the current favorite listings
  const favs = get(favorites);

  compareData = favs.map(listing => {
    let formattedListing = { address: listing.address }; // Always include address
    attrs.forEach(attr => {
      formattedListing[attr] = listing[attr] !== undefined ? listing[attr] : 'N/A';
    });
    return formattedListing;
  });

  return compareData;
}

async function geocodeAddress(address) {
  const apiKey = "AIzaSyB5TEd6BSGVllv5x3-oXF1m7AN_Yjg0-NU";
  console.log(`🌍 Geocoding via Google: ${address}`);

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      console.log(`✅ Geocoded: ${address} → [${location.lat}, ${location.lng}]`);
      return { lat: location.lat, lon: location.lng };
    } else {
      console.warn(`⚠️ Google Geocode failed for: ${address}`, data);
      return null;
    }
  } catch (error) {
    console.error(`🚨 Google Geocoding error for ${address}:`, error);
    return null;
  }
}



// Function to batch process geocoding (5 requests every 2 seconds)
async function batchGeocode(listings) {
  const results = [];

  for (let i = 0; i < listings.length; i++) {
    if (i % 3 === 0) await new Promise((r) => setTimeout(r, 3000)); // Prevent rate limits

    const cached = JSON.parse(localStorage.getItem(`geo_${listings[i].address}`));
    if (cached) {
      results.push({ ...listings[i], lat: cached.lat, lon: cached.lon });
      continue;
    }

    try {
      const location = await geocodeAddress(listings[i].address);
      if (location) {
        localStorage.setItem(`geo_${listings[i].address}`, JSON.stringify(location));
        results.push({ ...listings[i], lat: location.lat, lon: location.lon });
      } else {
        console.warn(`⚠️ Skipping ${listings[i].address} - no lat/lon`);
      }
    } catch (error) {
      console.error(`🚨 Geocoding error for ${listings[i].address}:`, error);
    }
  }

  console.log("✅ Geocoding complete, results:", results);
  return results;
}

// Load dataset from CSV file
async function loadListings() {
  try {
    const response = await fetch('/2016-12-20.csv');
    if (!response.ok) throw new Error(`Failed to load CSV: ${response.statusText}`);
    const csvText = await response.text();

    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      complete: async (result) => {
        console.log(`📊 CSV Loaded: ${result.data.length} entries`);
        const limitedListings = result.data.slice(0, 10);
        console.log(`🔹 Limited Listings:`, limitedListings);

        const listingsWithLatLon = await Promise.all(
          limitedListings.map(async (listing) => {
            if (!listing.lat || !listing.lon) {
              const location = await geocodeAddress(listing.address);
              return location ? { ...listing, lat: location.lat, lon: location.lon } : listing;
            }
            return listing;
          })
        );

        listings.set(listingsWithLatLon);
        console.log("✅ Listings Updated in Store:", listingsWithLatLon);
      },
      error: (error) => console.error("❌ CSV Parsing Error:", error),
    });
  } catch (error) {
    console.error("🚨 Error loading listings:", error);
  }
}


// Load data when store initializes
loadListings();
