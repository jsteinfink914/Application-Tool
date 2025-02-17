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
  // Check local storage first
  const cached = JSON.parse(localStorage.getItem(`geo_${address}`));
  if (cached) return cached;

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
    const data = await response.json();

    if (data.length > 0) {
      console.log(`📍 Found Geocode: ${data[0].lat}, ${data[0].lon}`);
      const location = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      localStorage.setItem(`geo_${address}`, JSON.stringify(location)); // Store result
      return location;
    }else {
      console.warn(`⚠️ No geocode result for: ${address}`);
      return null;
  } 
}catch (error) {
    console.warn(`⚠️ No geocode result for: ${address}`);
    console.error("Geocoding error:", error);
  }
  return null;
}

// Function to batch process geocoding (5 requests every 2 seconds)
async function batchGeocode(listings) {
  const results = [];
  for (let i = 0; i < listings.length; i++) {
    if (i % 3 === 0) await new Promise((r) => setTimeout(r, 10000)); // ✅ Increase delay to 5s

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
        results.push({ ...listings[i], lat: null, lon: null }); // ✅ Prevents breaking UI
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      results.push({ ...listings[i], lat: null, lon: null }); // ✅ Prevents breaking UI
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
        console.log("CSV Loaded:", result.data.length, "entries");
        const limitedListings = result.data.slice(0, 10); // Limit to 10
        console.log("Limited Listings:", limitedListings);

        listings.set([]); // Ensure store is reset before updating
        listings.update(() => limitedListings); // ✅ Ensures Svelte reactivity

        console.log("Listings Updated in Store:", limitedListings.length, listings); // Debug output
      },
      error: (error) => console.error("CSV Parsing Error:", error),
    });
  } catch (error) {
    console.error("Error loading listings:", error);
  }
}

// Load data when store initializes
loadListings();
