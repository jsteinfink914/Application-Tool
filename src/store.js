import { writable, get } from 'svelte/store';

export const listings = writable([]);
export const favorites = writable([]);
export const selectedAttributes = writable(['price', 'sqft', 'beds', 'baths']);
export const userPreferences = writable({ grocery: '', gym: '' });

async function fetchListingsFromCSV() {
  const url = '/data/nyc_listings.csv'; // Ensure this path is correct

  try {
      const response = await fetch(url);
      const text = await response.text();
      const data = parseCSV(text);
      listings.set(data);
      console.log("✅ Listings loaded from CSV:", data);
  } catch (error) {
      console.error("🚨 Error fetching listings from CSV:", error);
  }
}

/**
* Parse CSV data into an array of objects
*/
function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  const headers = lines.shift().split(",");

  return lines.map(line => {
      const values = line.split(",");
      return headers.reduce((obj, header, index) => {
          obj[header.trim()] = values[index] ? values[index].trim() : "";
          return obj;
      }, {});
  });
}

fetchListingsFromCSV(); // Load listings on startup

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

  return favs.map(fav => {
      const updatedListing = updatedListings.find(l => l.id === fav.id) || fav;
      return {
          address: fav.address,
          lat: updatedListing.latitude,
          lon: updatedListing.longitude,
          nearestGrocery: updatedListing.nearestGrocery || { name: 'N/A', distance: 'N/A' },
          nearestGym: updatedListing.nearestGym || { name: 'N/A', distance: 'N/A' },
          ...attrs.reduce((acc, attr) => {
              acc[attr] = updatedListing[attr] || 'N/A';
              return acc;
          }, {})
      };
  });
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
        const sortedResults = data.results.sort((a, b) => {
          const distA = haversineDistance(listing.lat, listing.lon, a.geometry.location.lat, a.geometry.location.lng);
          const distB = haversineDistance(listing.lat, listing.lon, b.geometry.location.lat, b.geometry.location.lng);
          return distA - distB; // Smallest distance first
      });
      const nearest = sortedResults[0]; // Pick closest
      const distance = haversineDistance(listing.lat, listing.lon, nearest.geometry.location.lat, nearest.geometry.location.lng);

      console.log(`✅ Closest ${type} for ${listing.address}: ${nearest.name} (${distance.toFixed(2)} mi)`);
      return {
        name: nearest.name,
        lat: nearest.geometry.location.lat,
        lon: nearest.geometry.location.lng,
        distance: `${distance.toFixed(2)} mi`
    };
  }else {
      console.warn(`⚠️ No ${type} found near ${listing.address}`);
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
      currentListings.map(async (listing, index) => {
          console.log(`Updating listing #${index} (${listing.address})`);
          const nearestGrocery = await findNearestPlace(listing.lat, listing.lon, "supermarket", preferences.grocery);
          if (nearestGrocery) {
              const distance = haversineDistance(listing.lat, listing.lon, nearestGrocery.lat, nearestGrocery.lon);
              listing.nearestGrocery = { ...nearestGrocery, distance: distance.toFixed(2) + " mi" };
          } else {
              listing.nearestGrocery = null;
          }

          const nearestGym = await findNearestPlace(listing.lat, listing.lon, "gym", preferences.gym);
          if (nearestGym) {
              const distance = haversineDistance(listing.lat, listing.lon, nearestGym.lat, nearestGym.lon);
              listing.nearestGym = { ...nearestGym, distance: distance.toFixed(2) + " mi" };
          } else {
              listing.nearestGym = null;
              console.warn(`No nearest gym found for ${listing.address}`);
          }
          return listing;
      })
  );

  listings.set(updatedListings);
  console.log(`✅ Updated listings with nearest grocery and gym`, updatedListings);
  return updatedListings;
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
