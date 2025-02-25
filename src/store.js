import { writable, get } from 'svelte/store';

export const listings = writable([]);
export const favorites = writable([]);
export const selectedAttributes = writable(['price', 'sqft', 'beds', 'baths']);
export const userPreferences = writable({ grocery: '', gym: '' });

async function fetchListings(filters = {}) {
  // let query = new URLSearchParams(filters).toString();
  let url = "http://127.0.0.1:8000/listings";

  try {
      const res = await fetch(url);
      const data = await res.json();
      listings.set(data.listings);
  } catch (error) {
      console.error("Error fetching listings:", error);
  }
}

fetchListings(); // Load listings on startup

/**
 * Toggle a listing as a favorite
 */
export async function toggleFavorite(listingId) {
  try {
      const res = await fetch("http://127.0.0.1:8000/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listing_id: listingId })
      });

      const data = await res.json();
      console.log("Favorite updated:", data);
  } catch (error) {
      console.error("Error toggling favorite:", error);
  }
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
export async function findNearestPlace(lat, lon, type, keyword) {
  try {
      const url = `http://127.0.0.1:8000/places?lat=${lat}&lon=${lon}&type=${type}&keyword=${encodeURIComponent(keyword)}`;
      const response = await fetch(url, { cache: 'no-store' });
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
          // Sort results by distance from the given location
          const sortedResults = data.results.map(place => {
              return {
                  ...place,
                  distance: haversineDistance(lat, lon, place.geometry.location.lat, place.geometry.location.lng)
              };
          }).sort((a, b) => a.distance - b.distance);
          
          const nearest = sortedResults[0];
          return {
              name: nearest.name,
              lat: nearest.geometry.location.lat,
              lon: nearest.geometry.location.lng,
              distance: `${nearest.distance.toFixed(2)} mi`
          };
      }
  } catch (error) {
      console.error(`Error finding ${keyword}:`, error);
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
