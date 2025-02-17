import { writable } from 'svelte/store';
import Papa from 'papaparse';

export const listings = writable([]);
export const favorites = writable([]);
export const selectedAttributes = writable(['price', 'sq_ft', 'laundry', 'doorman', 'dishwasher']);
export const userPreferences = writable({ grocery: '', gym: '' });

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
    if (i % 5 === 0) await new Promise((r) => setTimeout(r, 2000)); // Delay every 5 requests
    const location = await geocodeAddress(listings[i].address);
    results.push(location ? { ...listings[i], lat: location.lat, lon: location.lon } : listings[i]);
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
        console.log("CSV Loaded:", result.data);
        const limitedListings = result.data.slice(0, 30); // Limit initial listings to 30
        const listingsWithLatLon = await batchGeocode(limitedListings);
        listings.set(listingsWithLatLon);
        console.log("Listings Updated:", listingsWithLatLon);
      },
      error: (error) => console.error("CSV Parsing Error:", error),
    });
  } catch (error) {
    console.error("Error loading listings:", error);
  }
}

// Load data when store initializes
loadListings();
