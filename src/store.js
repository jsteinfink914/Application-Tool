import { writable } from 'svelte/store';
import Papa from 'papaparse';

// Geocode an address to get lat and lon
async function geocodeAddress(address) {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
  const data = await response.json();
  if (data.length > 0) {
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } else {
    return null;  // Return null if no results are found
  }
}

// Load dataset from CSV file
async function loadListings() {
  const response = await fetch('/mnt/data/2016-12-20.csv');
  const csvText = await response.text();
  return new Promise((resolve) => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      complete: async (result) => {
        // Geocode each listing to get lat and lon
        const listingsWithLatLon = await Promise.all(result.data.map(async (listing) => {
          const location = await geocodeAddress(listing.address);
          return location ? { ...listing, lat: location.lat, lon: location.lon } : listing;
        }));
        resolve(listingsWithLatLon);
      },
    });
  });
}

export const listings = writable([]);
loadListings().then(data => listings.set(data));

export const favorites = writable([]);
export const selectedAttributes = writable(['price', 'sq_ft', 'laundry', 'doorman', 'dishwasher']);
export const userPreferences = writable({ grocery: '', gym: '' });

// Function to toggle favorite listings
export function toggleFavorite(listing) {
  favorites.update(favs => {
    const exists = favs.some(fav => fav.id === listing.id);
    return exists ? favs.filter(fav => fav.id !== listing.id) : [...favs, listing];
  });
}

// Compare Page Logic
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

// Function to update user preferences
export function updateUserPreferences(preferences) {
  userPreferences.set(preferences);
}

// Function to find nearest grocery store and gym
async function getNearestLocations(listings, userPrefs) {
  if (!userPrefs.grocery || !userPrefs.gym) return;
  
  const geocode = async (address) => {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
    const data = await response.json();
    return data.length > 0 ? { lat: data[0].lat, lon: data[0].lon } : null;
  };
  
  const groceryLocation = await geocode(userPrefs.grocery);
  const gymLocation = await geocode(userPrefs.gym);
  
  if (!groceryLocation || !gymLocation) return;
  
  listings.update(listingArray => {
    return listingArray.map(listing => {
      const distance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };
      
      return {
        ...listing,
        grocery_distance: distance(listing.lat, listing.lon, groceryLocation.lat, groceryLocation.lon),
        gym_distance: distance(listing.lat, listing.lon, gymLocation.lat, gymLocation.lon)
      };
    });
  });
}

userPreferences.subscribe(prefs => getNearestLocations(listings, prefs));

// Export everything
export { listings, favorites, selectedAttributes, userPreferences, toggleFavorite, getCompareData, updateUserPreferences };
