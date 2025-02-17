import { writable, get } from 'svelte/store';
import Papa from 'papaparse';

export const listings = writable([]);
export const favorites = writable([]);
export const selectedAttributes = writable(['price', 'sq_ft', 'laundry in building', 'doorman', 'dishwasher']);
export const userPreferences = writable({ grocery: '', gym: '' });

/**
 * Function to update user preferences
 */
export function updateUserPreferences(preferences) {
  userPreferences.set(preferences);
}

/**
 * Toggle a listing as a favorite
 */
export function toggleFavorite(listing) {
  favorites.update(favs => {
    const exists = favs.some(fav => fav.address === listing.address);
    const updatedFavs = exists
      ? favs.filter(fav => fav.address !== listing.address)
      : [...favs, { ...listing }];

    console.log("❤️ Updated Favorites:", updatedFavs);
    return [...updatedFavs];  // ✅ Forces Svelte reactivity
  });
}



/**
 * Extract selected attributes for comparison
 */
export function getCompareData() {
  const favs = get(favorites);
  const attrs = get(selectedAttributes);

  return favs.map(listing => {
    let selectedData = { 
      address: listing.address, 
      lat: listing.lat,  // ✅ Ensure lat/lon are always stored
      lon: listing.lon 
    };
    attrs.forEach(attr => {
      selectedData[attr] = listing[attr] ?? 'N/A'; // ✅ Store only selected attributes
    });
    return selectedData;
  });
}


/**
 * Geocode an address using Google API
 */
async function geocodeAddress(address) {
  const cacheKey = `geo_${address}`;
  const cached = JSON.parse(localStorage.getItem(cacheKey));
  if (cached) return cached;

  try {
    console.log(`🌍 Geocoding: ${address}`);
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyB5TEd6BSGVllv5x3-oXF1m7AN_Yjg0-NU`);
    const data = await response.json();
    
    console.log(`🔍 Geocode Response for ${address}:`, data); // ✅ Log response

    if (data.results.length > 0) {
      const location = {
        lat: data.results[0].geometry.location.lat,
        lon: data.results[0].geometry.location.lng
      };
      localStorage.setItem(cacheKey, JSON.stringify(location)); // Cache result
      return location;
    } else {
      console.warn(`⚠️ Google Maps could not find lat/lon for: ${address}`);
    }
  } catch (error) {
    console.error(`🚨 Geocoding error for ${address}:`, error);
  }
  return null;
}

/**
 * Batch process geocoding with rate limiting
 */
async function batchGeocode(listingsData) {
  const results = [];
  for (let i = 0; i < listingsData.length; i++) {
    if (i % 5 === 0) await new Promise(r => setTimeout(r, 3000)); // ✅ Rate limit to avoid Google API errors

    const cached = JSON.parse(localStorage.getItem(`geo_${listingsData[i].address}`));
    if (cached) {
      results.push({ ...listingsData[i], lat: cached.lat, lon: cached.lon });
      continue;
    }

    try {
      const location = await geocodeAddress(listingsData[i].address);
      if (location) {
        results.push({ ...listingsData[i], lat: location.lat, lon: location.lon });
      } else {
        console.warn(`⚠️ Could not get lat/lon for: ${listingsData[i].address}`);
      }
    } catch (error) {
      console.error(`🚨 Geocoding failed for ${listingsData[i].address}:`, error);
    }
  }

  console.log("✅ Final batch geocode results:", results);
  return results.length > 0 ? results : []; // ✅ Ensure an array is returned
}


/**
 * Load CSV data and geocode listings
 */
async function loadListings() {
  try {
    const response = await fetch('/2016-12-20.csv');
    if (!response.ok) throw new Error(`Failed to load CSV: ${response.statusText}`);
    const csvText = await response.text();

    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      complete: async (result) => {
        if (!result.data || result.data.length === 0) {
          console.error("🚨 CSV data is empty or invalid!");
          return;
        }

        console.log(`📊 CSV Loaded: ${result.data.length} entries`);
        const limitedListings = result.data.slice(0, 10);
        console.log(`🔹 Limited Listings Before Geocode:`, limitedListings);

        const listingsWithLatLon = await batchGeocode(limitedListings) || [];

        console.log(`✅ Final geocoded listings before storing:`, listingsWithLatLon);

        if (!Array.isArray(listingsWithLatLon) || listingsWithLatLon.length === 0) {
          console.error("🚨 No valid listings with lat/lon found!");
          return;
        }

        listings.set([...listingsWithLatLon]); // ✅ Ensure an array is stored
        console.log(`✅ Listings Updated in Store:`, get(listings)); // ✅ Confirm it's updated
      },
      error: (error) => console.error("🚨 CSV Parsing Error:", error),
    });
  } catch (error) {
    console.error("🚨 Error loading listings:", error);
  }
}


// Load listings on startup
loadListings();
