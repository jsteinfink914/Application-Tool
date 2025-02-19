import { writable, get } from 'svelte/store';
import Papa from 'papaparse';

export const listings = writable([]);
export const favorites = writable([]);
export const selectedAttributes = writable(['price', 'sq_ft', 'laundry in building', 'doorman', 'dishwasher']);
export const userPreferences = writable({ grocery: '', gym: '' });

/**
 * Function to update user preferences
 */


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
  const updatedListings = get(listings);

  console.log("Favorites:", favs);
  console.log("Selected Attributes:", attrs);
  console.log("Updated Listings:", updatedListings);

  return favs.map(fav => {
    // Find the latest listing in `updatedListings`, or fallback to `fav`
    const updatedListing = updatedListings.find(l => l.address === fav.address);

    if (!updatedListing) {
      console.warn(`⚠️ Favorite listing not found in updatedListings: ${fav.address}`);
    }

    let selectedData = { 
      address: fav.address, 
      lat: updatedListing?.lat ?? fav.lat,
      lon: updatedListing?.lon ?? fav.lon,
      // Ensure nearest location data is included
      nearestGrocery: updatedListing?.nearestGrocery ?? { name: 'N/A', distance: 'N/A' },
      nearestGym: updatedListing?.nearestGym ?? { name: 'N/A', distance: 'N/A' }
    };

    // Ensure selected attributes are copied
    attrs.forEach(attr => {
      selectedData[attr] = updatedListing?.[attr] ?? 'N/A';
    });

    console.log(`🔍 Compare Data for ${fav.address}:`, selectedData);
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
 * Search for nearest place using Google Places API
 */
async function findNearestPlace(listing, type, keyword) {
  try {
      const url = `/api/places?lat=${listing.lat}&lon=${listing.lon}&type=${type}&keyword=${encodeURIComponent(keyword)}&t=${Date.now()}`;
      console.log("Fetching from:", url);
      const response = await fetch(url, { cache: 'no-store' });
      const data = await response.json();
      console.log(`Response for ${type} (${keyword}) at ${listing.address}:`, data);
      
      if (data.results && data.results.length > 0) {
          return {
              name: data.results[0].name,
              lat: data.results[0].geometry.location.lat,
              lon: data.results[0].geometry.location.lng,
          };
      }
  } catch (error) {
      console.error(`🚨 Error finding ${keyword}:`, error);
  }
  return null;
}



export async function updateUserPreferences(preferences) {
  console.log("updateUserPreferences called with:", preferences);
  userPreferences.set(preferences);

  if (!preferences.grocery || !preferences.gym) {
    console.warn("⚠️ Grocery store or gym preference is missing.");
    return;
  }

  console.log(`🌍 Finding nearest locations for grocery: ${preferences.grocery} and gym: ${preferences.gym}`);

  // Check if listings are loaded
  const currentListings = get(listings);
  if (currentListings.length === 0) {
    console.warn("⚠️ Listings not yet loaded. Retrying in 1 second...");
    setTimeout(() => updateUserPreferences(preferences), 1000);
    return;
  }

  // Update each listing with its nearest grocery and gym locations
  const updatedListings = await Promise.all(
    currentListings.map(async (listing,index) => {
      console.log(`Updating listing #${index} (${listing.address})`);
      const nearestGrocery = await findNearestPlace(listing, "supermarket", preferences.grocery);
      console.log(`findNearestPlace (grocery) response for ${listing.address}:`, nearestGrocery);
      if (nearestGrocery) {
        const distance = haversineDistance(listing.lat, listing.lon, nearestGrocery.lat, nearestGrocery.lon);
        listing.nearestGrocery = { ...nearestGrocery, distance: distance.toFixed(2) + " mi" };
        console.log(`Nearest Grocery for ${listing.address}: ${nearestGrocery.lat}, ${nearestGrocery.lon}`);
      } else {
        listing.nearestGrocery = null;
      }
      const nearestGym = await findNearestPlace(listing, "gym", preferences.gym);
      if (nearestGym) {
        const distance = haversineDistance(listing.lat, listing.lon, nearestGym.lat, nearestGym.lon);
        listing.nearestGym = { ...nearestGym, distance: distance.toFixed(2) + " mi" };
        console.log(`Nearest Gym for ${listing.address}: ${nearestGym.lat}, ${nearestGym.lon}`);
      } else {
        listing.nearestGym = null;
        console.warn(`No nearest gym found for ${listing.address}`);
      }
      return listing;
    })
  );

  listings.set(updatedListings);
  compareListings.set(getCompareData());
  console.log(`✅ Updated listings with nearest grocery and gym`, updatedListings);
  return updatedListings
}



function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * 
      Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
* Find the closest grocery and gym to each listing
*/
export function findNearestLocations(listingsData) {
  const preferences = get(userPreferences);
  const grocery = preferences.groceryLatLon;
  const gym = preferences.gymLatLon;

  if (!grocery || !gym) {
      console.warn("⚠️ No geocoded grocery/gym locations available.");
      return listingsData;
  }

  return listingsData.map(listing => {
      if (!listing.lat || !listing.lon) return listing;

      const groceryDist = haversineDistance(listing.lat, listing.lon, grocery.lat, grocery.lon);
      const gymDist = haversineDistance(listing.lat, listing.lon, gym.lat, gym.lon);

      return {
          ...listing,
          nearestGrocery: { name: preferences.grocery, distance: groceryDist.toFixed(2) + " mi" },
          nearestGym: { name: preferences.gym, distance: gymDist.toFixed(2) + " mi" }
      };
  });
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
