import { writable } from 'svelte/store';
import Papa from 'papaparse';

export const listings = writable([]);
export const favorites = writable([]);
export const selectedAttributes = writable(['price', 'sq_ft', 'laundry', 'doorman', 'dishwasher']);
export const userPreferences = writable({ grocery: '', gym: '' });

// Function to update user preferences
export function updateUserPreferences(preferences) {
  userPreferences.set(preferences);
}

// Function to toggle favorite listings
export function toggleFavorite(listing) {
  favorites.update(favs => {
    const exists = favs.some(fav => fav.address === listing.address);
    return exists ? favs.filter(fav => fav.address !== listing.address) : [...favs, listing];
  });
}

// Function to get comparison data from favorites
export function getCompareData() {
  let compareData = [];
  favorites.subscribe(favs => {
    compareData = favs.map(listing => {
      return selectedAttributes.subscribe(attrs => {
        return attrs.reduce((acc, attr) => {
          acc[attr] = listing[attr];
          return acc;
        }, {});
      });
    });
  });
  return compareData;
}

async function geocodeAddress(address) {
  // Check local storage first
  const cached = JSON.parse(localStorage.getItem(`geo_${address}`));
  if (cached) return cached;

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
    const data = await response.json();

    if (data.length > 0) {
      const location = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      localStorage.setItem(`geo_${address}`, JSON.stringify(location)); // Store result
      return location;
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }
  return null;
}

// Function to batch process geocoding (5 requests every 2 seconds)
async function batchGeocode(listings) {
  const results = [];
  for (let i = 0; i < listings.length; i++) {
    if (i % 5 === 0) await new Promise((r) => setTimeout(r, 10000)); // Delay every 5 requests

    // Check cache first
    const cached = JSON.parse(localStorage.getItem(`geo_${listings[i].address}`));
    if (cached) {
      results.push({ ...listings[i], lat: cached.lat, lon: cached.lon });
      continue;
    }

    // Fetch geocode
    try {
      const location = await geocodeAddress(listings[i].address);
      if (location) {
        localStorage.setItem(`geo_${listings[i].address}`, JSON.stringify(location)); // Cache it
        results.push({ ...listings[i], lat: location.lat, lon: location.lon });
      } else {
        results.push(listings[i]); // Keep original if failed
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      results.push(listings[i]); // Prevent app from breaking
    }
  }
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
        console.log("CSV Loaded:", result.data.length, "entries"); // ✅ Logs total listings
        const limitedListings = result.data.slice(0, 10); // Limit initial listings to 30
        console.log("Limited Listings:", limitedListings); // ✅ Logs trimmed listings

        const listingsWithLatLon = await batchGeocode(limitedListings);
        listings.set(listingsWithLatLon);
        console.log("Listings Updated in Store:", listingsWithLatLon.length); // ✅ Logs final update
      },
      error: (error) => console.error("CSV Parsing Error:", error),
    });
  } catch (error) {
    console.error("Error loading listings:", error);
  }
}

// Load data when store initializes
loadListings();
