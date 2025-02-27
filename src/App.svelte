
    
   <script>

    // ✅ 1. External Libraries First
  import { onMount, tick } from 'svelte';
  import { writable, get } from 'svelte/store'; 
  import Router from "svelte-spa-router";
  import MovingServices from "./routes/MovingServices.svelte";
  import BuildingDashboard from "./routes/BuildingDashboard.svelte";

  // ✅ 2. Store Imports Next (No Duplicates)
  import { 
  listings, 
  allListings,
  favorites, 
  selectedAttributes, 
  userPreferences, 
  toggleFavorite, 
  getCompareData, 
  updateUserPreferences,
  findNearestPlace
} from './store.js';

 const currentRoute = writable(window.location.hash.replace("#", "") || "/");
  
  // Listen for hash changes
  window.addEventListener("hashchange", () => {
    currentRoute.set(window.location.hash.replace("#", "") || "/");
  });


let filters = writable({
    min_price: "",
    max_price: "",
    min_beds: "",
    max_beds: "",
    min_baths: "",
    max_baths: "",
    min_sqft: "",
    max_sqft: ""
});

  let map;
  let markers = [];
  let listingMarkers = new Map();
  let showMode = writable("OnClick");
  let compareListings = writable([]);
  let selectedAttributesLocal = writable({
    price: true,
    sqft: true,
    beds: true,
    baths: true
  });

  let openInfoWindows = []
  let routeInfoWindows = []; 

  let directionsService;
  let directionsRenderers = [];
  let cachedRoutes = new Map(); // ✅ Stores already-fetched routes

  let groceryStore = '';
  let gym = '';
  let showComparePage = writable(false);
  let showMap = writable(false); // ✅ Moved inside <script>

  let showMapView = writable(false);


  let filterSidebarOpen = false;

function toggleFilterSidebar() {
    filterSidebarOpen = !filterSidebarOpen;
}
function toggleViewMode() {
    showMapView.update(value => {
        const newValue = !value;

        // Only initialize map when switching to map view
        if (newValue) {
            setTimeout(() => {
                const mapContainer = document.getElementById('map-listings');
                if (mapContainer) {
                    console.log("✅ Listings Map found, initializing...");
                    initializeMap($listings,false);
                } else {
                    console.warn("🚨 Listings Map container still missing!");
                }
            }, 500);
        }

        return newValue;
    });
}



  let sidebarOpen = false;
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
    console.log("Sidebar state:", sidebarOpen); // Debugging
  }

  function toggleShowMode() {
    showMode.update(mode => (mode === "onClick" ? "showAll" : "onClick"));
    clearGymAndGroceryMarkers(); 
    clearRoutes();
    initializeMap(get(compareListings),true); // ✅ Re-render map with new mode
  }

  // **Predefined Colors for Unique Listings**
  const colors = [
    "red", "blue", "green", "purple", "orange", "pink", "yellow", "cyan"
  ];

  function getRandomColor(index) {
    return colors[index % colors.length];
  }

   // **Load Google Maps API dynamically**
  function loadGoogleMapsScript(callback) {
    if (window.google && window.google.maps) {
      callback();
      return;
    }
    fetch('/api/maps-key')
        .then(response => response.json())
        .then(({ key }) => {
            if (!key) throw new Error("Missing API key from backend.");
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = callback;
    document.head.appendChild(script);
  })
  }

  function getRouteMidPoint(route) {
  let totalDistance = 0;
  let coveredDistance = 0;
  let midPoint = null;

  // ✅ Calculate total route distance
  route.steps.forEach(step => totalDistance += step.distance.value);

  // ✅ Find the midpoint step
  for (const step of route.steps) {
    coveredDistance += step.distance.value;
    if (coveredDistance >= totalDistance / 2) { 
      return step.end_location;
    }
  }

  return route.steps[Math.floor(route.steps.length / 2)].end_location;
}




  const updatePreferences = async () => {
    console.log("🔄 Updating user preferences...");
    
    const prefs = get(userPreferences);
    await updateUserPreferences({ 
        grocery: groceryStore, 
        gym: gym, 
        poiTypes: prefs.poiTypes // ✅ Include POIs in update
    });

    await tick(); // ✅ Wait for Svelte reactivity updates
    compareListings.set(getCompareData());

    if ($showComparePage) {
        clearRoutes();
        initializeMap(get(compareListings), true);
    } else {
        initializeMap(get(listings), false); // ✅ Ensure POIs refresh in normal view
    }
};


  async function initializeMap(listingsData, isComparePage = false) {
    await tick();
    const mode = get(showMode);
     let mapContainer = isComparePage
        ? document.getElementById('map')
        : document.getElementById('map-listings');
     listingsData.forEach(listing => {
        console.log(`🔍 Checking listing: ${listing.address}`);
        console.log(`   🛒 Nearest Grocery:`, listing.nearestGrocery);
        console.log(`   🏋️ Nearest Gym:`, listing.nearestGym);
    });

  console.log(getComputedStyle(mapContainer));


    if (!mapContainer) {
        console.warn("🚨 #map container missing! Retrying in 500ms...");
        setTimeout(() => initializeMap(listingsData, false), 500);
        return;
    }
    console.log(mapContainer);
    console.log("✅ #map container FOUND, initializing map...");
     // 🔥 DESTROY EXISTING MAP IF SWITCHING PAGES
    if (map) {
        console.warn("🔄 Removing existing Google Map instance...");
        map = null;  // Force reinitialization
    }
    if (!map) {
         map = new google.maps.Map(mapContainer, {
        center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
        zoom: 12,
      });
      // ✅ Close all InfoWindows when clicking on the map (but not markers)
        map.addListener("click", () => {
            closeAllInfoWindows();
            closeAllRouteInfoWindows();
        });

    }
    else {
    console.log("🔄 Resizing map...");
    google.maps.event.trigger(map, "resize"); // ✅ Fix hidden map bug
}
    console.log("🟢 Listings to add markers for:", listingsData);
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    listingMarkers.clear();
   

    listingsData.forEach((listing,index) => {
        if (listing.lat && listing.lon) {
            const color = isComparePage ? getRandomColor(index) : "blue"; 
            console.log(`📌 Adding marker for ${listing.address}`);
             const listingMarker = new google.maps.Marker({
                    position: { lat: listing.lat, lng: listing.lon },
                    map,
                    title: listing.address,
                    icon: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
                  });

              const infoWindow = new google.maps.InfoWindow({
                    content: `<strong>${listing.address}</strong>`,
                  });

              listingMarker.addListener("click", () => {
                    closeAllInfoWindows();
                    closeAllRouteInfoWindows();
                    infoWindow.open(map, listingMarker);
                    openInfoWindows.push(infoWindow); //Tracked opened window
                    // ✅ Only show gym/grocery on click if mode is "onClick"
                      if (mode === "onClick") {
                        clearGymAndGroceryMarkers(); // ✅ Remove previous ones
                        clearRoutes();
                        addGymAndGroceryMarkers(listing, color, true);
                      }else {
                          clearRoutes(); // ✅ Prevents routes from appearing in "Show All"
                        }
                  });

              markers.push(listingMarker);
              listingMarkers.set(listing.address, { listingMarker, color });

                  // ✅ Add gym & grocery markers immediately if "Show All"
                  if (mode === "showAll"){
                    closeAllInfoWindows();
                    closeAllRouteInfoWindows();
                    addGymAndGroceryMarkers(listing, color, false);
                }
               
                    addPOIMarkers(listing);
                    console.log(`📌 Adding marker for POI's`);

        }
              });
  }
  
  function clearGymAndGroceryMarkers() {
  markers = markers.filter(marker => {
    if (marker.isGym || marker.isGrocery) {
      marker.setMap(null); // ✅ Remove from map
      return false; // ✅ Filter out removed markers
    }
    return true;
  });
}
function addPOIMarkers(listing) {
    if (!listing.nearestPOIs) return;

    // 🔹 Define colors for different POI types
    const poiIcons = {
        Cafes: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUfJcLFW5wuE5-H6AXuHDJcjLeH1uD_lJCGw&s",
        Parks: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.flaticon.com%2Ffree-icon%2Fpark_1466383&psig=AOvVaw0m4QnG4bGYRB_E3dX_6fCf&ust=1740709132737000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCODl-_3k4osDFQAAAAAdAAAAABAE",
        "Public Transport": "data:image/png;base64,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",
        Schools: "data:image/png;base64,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",
        Restaurants: "data:image/png;base64,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"
    };
    // 🔥 Loop through all selected POIs and add markers
    Object.keys(listing.nearestPOIs).forEach(poiType => {
        const poi = listing.nearestPOIs[poiType];
        if (!poi || !poi.lat || !poi.lon) return; // Skip if missing coordinates

        const poiMarker = new google.maps.Marker({
            position: { lat: poi.lat, lng: poi.lon },
            map,
            title: `${poiType}: ${poi.name}`,
            icon: {
                url: poiIcons[poiType] || "https://img.icons8.com/ios-filled/48/marker.png", // Default icon
                scaledSize: new google.maps.Size(30, 30)
            }
        });

        markers.push(poiMarker);

        // 🔹 Add info window to show POI details
        const infoWindow = new google.maps.InfoWindow({
            content: `<strong>${poiType}: ${poi.name}</strong><br>📍 Distance: ${poi.distance}`
        });

        poiMarker.addListener("click", () => {
            infoWindow.open(map, poiMarker);
        });

        console.log(`📍 Added POI marker: ${poiType} (${poi.name})`);
    });
}



// ✅ Close all currently open InfoWindows
function closeAllInfoWindows() {
    openInfoWindows.forEach(infoWindow => infoWindow.close());
    openInfoWindows = []; // ✅ Reset open InfoWindows
}

 //✅ Close all InfoWindows that show travel time on routes
function closeAllRouteInfoWindows() {
    routeInfoWindows.forEach(infoWindow => infoWindow.close());
    routeInfoWindows = []; // ✅ Reset route InfoWindows
}



  const handleFavoriteToggle = (listing) => {
    toggleFavorite({
        ...listing,  // ✅ Store the entire listing, not just selected columns
        lat: listing.lat,
        lon: listing.lon
    });
    favorites.update(favs => [...favs]); // ✅ Ensure reactivity
};

function drawRoute(listing, destination) {
  const routeKey = `${listing.lat},${listing.lon}-${destination.lat},${destination.lon}`;
  if (cachedRoutes.has(routeKey)) {
    console.log(`✅ Using cached route for ${routeKey}`);
    displayCachedRoute(cachedRoutes.get(routeKey));
    return;
  }
  const request = {
    origin: { lat: listing.lat, lng: listing.lon },
    destination: { lat: destination.lat, lng: destination.lon },
    travelMode: google.maps.TravelMode.WALKING,
  };

 directionsService.route(request, (result, status) => {
    if (status === google.maps.DirectionsStatus.OK) {
      cachedRoutes.set(routeKey, result); // ✅ Store in cache
      displayCachedRoute(result);
    } else {
      console.warn("⚠️ Directions API request failed:", status);
    }
  });
}

function displayCachedRoute(result) {
  const directionsRenderer = new google.maps.DirectionsRenderer({
    map,
    directions: result,
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: "#007bff",
      strokeOpacity: 0.9,
      strokeWeight: 7,
    },
  });

  directionsRenderers.push(directionsRenderer);

  const route = result.routes[0].legs[0];
  const travelTime = route.duration.text; // ✅ Extract travel time
  const midPoint = getRouteMidPoint(route); 
  const infoWindow = new google.maps.InfoWindow({
    content: `<strong>🚶 ${travelTime}</strong>`, // ✅ Show travel time above route
    position: midPoint, // ✅ Position at route midpoint
  });

  infoWindow.open(map); // ✅ Show travel time on map
  routeInfoWindows.push(infoWindow);
}

function clearRoutes() {
  directionsRenderers.forEach(renderer => renderer.setMap(null));
  directionsRenderers = [];
}


function addGymAndGroceryMarkers(listing,color,drawRoutes) {
    // Remove existing gym and grocery markers if they exist
  if (listing.gymMarker) {
    listing.gymMarker.setMap(null);
    listing.gymMarker = null;
  }
  if (listing.groceryMarker) {
    listing.groceryMarker.setMap(null);
    listing.groceryMarker = null;
  }
  // Clear previous routes
  clearRoutes();
  if (!directionsService) {
    directionsService = new google.maps.DirectionsService();
  }

  // ✅ Custom icon sizes
  const gymIcon = {
      url: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
      scaledSize: new google.maps.Size(30, 30),
    };

    const groceryIcon = {
      url: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
      scaledSize: new google.maps.Size(30, 30),
    };

    // Add gym marker
    if (listing.nearestGym?.lat && listing.nearestGym?.lon) {
    console.log(`🏋️ Adding gym marker at ${listing.nearestGym.lat}, ${listing.nearestGym.lon}`);

    listing.gymMarker = new google.maps.Marker({
      position: { lat: listing.nearestGym.lat, lng: listing.nearestGym.lon },
      map, // ✅ Make sure the marker is added to the map
      icon: gymIcon,
      title: `Gym: ${listing.nearestGym.name}`,
    });

    listing.gymMarker.isGym = true; // ✅ Identify as gym marker
    const gymInfoWindow = new google.maps.InfoWindow({
      content: `<strong>🏋️ Gym: ${listing.nearestGym.name}</strong><br>📍 Distance: ${listing.nearestGym.distance}`,
    });

    listing.gymMarker.addListener("click", () => {
      gymInfoWindow.open(map, listing.gymMarker);
    });
    markers.push(listing.gymMarker);
    if (drawRoutes) drawRoute(listing, listing.nearestGym);
  }
   else {
    console.warn("⚠️ No gym coordinates found for:", listing.address);
  }

  // ✅ Add Grocery Marker
  if (listing.nearestGrocery?.lat && listing.nearestGrocery?.lon) {
    console.log(`🛒 Adding grocery marker at ${listing.nearestGrocery.lat}, ${listing.nearestGrocery.lon}`);

    listing.groceryMarker = new google.maps.Marker({
      position: { lat: listing.nearestGrocery.lat, lng: listing.nearestGrocery.lon },
      map, // ✅ Ensure it's added to the map
      icon: groceryIcon,
      title: `Grocery: ${listing.nearestGrocery.name}`,
    });

    listing.groceryMarker.isGrocery = true; // ✅ Identify as grocery marker

    const groceryInfoWindow = new google.maps.InfoWindow({
      content: `<strong>🛒 Grocery: ${listing.nearestGrocery.name}</strong><br>📍 Distance: ${listing.nearestGrocery.distance}`,
    });

    listing.groceryMarker.addListener("click", () => {
      groceryInfoWindow.open(map, listing.groceryMarker);
    });
    
    markers.push(listing.groceryMarker);
     // ✅ Draw route to Grocery
    if (drawRoutes) drawRoute(listing, listing.nearestGrocery);
  }

    else {
    console.warn("⚠️ No grocery coordinates found for:", listing.address);
  }
}


  const handleCompare = async () => {
    await tick();
    const data = getCompareData();
    console.log("🔍 Compare Data:", data); // ✅ Ensure lat/lon is present
    compareListings.set(data);

    if (data.length > 0) {
        showComparePage.set(true);
        showMap.set(true); // ✅ Use .set(true) since it's a writable store
         console.log("🟢 showMap Value:", $showMap);
        await tick(); // ✅ Wait for UI update before initializing map
        console.log("🔍 Final Compare Data:", $compareListings);
        
        setTimeout(() => { // ✅ Ensure #map container exists before initializing
            const mapContainer = document.getElementById('map');
            if (!mapContainer) {
                console.warn("🚨 #map container still missing! Retrying in 500ms...");
                setTimeout(() => initializeMap(data, true), 500);
            } else {
                initializeMap(data, true);
            }
        }, 300); // ✅ Small delay to ensure rendering
    }
};

function handleScroll() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    fetchListings({}, true); // Load more listings when near bottom
  }
}

async function togglePOI(poi) {
    userPreferences.update(prefs => {
        const poiTypes = new Set(prefs.poiTypes || []); // Ensure it's a Set
        if (poiTypes.has(poi)) {
            poiTypes.delete(poi); // Remove if already selected
        } else {
            poiTypes.add(poi); // Add if not selected
        }
        return { ...prefs, poiTypes: Array.from(poiTypes) };
    });

    await tick(); // ✅ Wait for Svelte to update userPreferences
    console.log("📍 Updated POIs:", get(userPreferences).poiTypes);
    updatePreferences(); // ✅ Now ensures correct POIs are used
}


async function applyFilters() {
    const filterValues = get(filters); // Get the latest filter values
    const allData = get(allListings); // Get the full dataset
    const selectedPOIs = get(userPreferences).poiTypes || []; // Get selected POIs
    console.log(`✅ POI Listings: ${selectedPOIs} results.`);

    const filteredListings = allData.filter(listing => {
        return (
            (!filterValues.min_price || listing.price >= filterValues.min_price) &&
            (!filterValues.max_price || listing.price <= filterValues.max_price) &&
            (!filterValues.min_beds || listing.beds >= filterValues.min_beds) &&
            (!filterValues.max_beds || listing.beds <= filterValues.max_beds) &&
            (!filterValues.min_baths || listing.baths >= filterValues.min_baths) &&
            (!filterValues.max_baths || listing.baths <= filterValues.max_baths) &&
            (!filterValues.min_sqft || listing.sqft >= filterValues.min_sqft) &&
            (!filterValues.max_sqft || listing.sqft <= filterValues.max_sqft)
        );
    });

    console.log(`✅ Filtered Listings: ${filteredListings.length} results.`);
    // 🔹 Step 2: Fetch POI Data Only If Needed
    if (selectedPOIs.length > 0) {
        console.log(`🔍 Fetching POIs for: ${selectedPOIs}`);

        for (let listing of filteredListings) {
            listing.nearestPOIs = {};
             // 🔥 Use `await Promise.all()` for better performance
            await Promise.all(selectedPOIs.map(async (poiType) => {
                listing.nearestPOIs[poiType] = await findNearestPlace(listing, poiType, poiType);
            }));
        }
    }

    listings.set(filteredListings); // Update the filtered results


    // 🔥 Reload the Map after filtering
    setTimeout(() => {
        initializeMap(filteredListings, false); // Reinitialize with filtered data
    }, 200);
}





  onMount(() => {
    window.addEventListener("scroll", handleScroll);
  loadGoogleMapsScript(() =>{
    listings.subscribe(l => {
      if (l.length > 0) {
        console.log("✅ Listings loaded, checking if map should initialize...");
        if ($showComparePage && l.some(item => item.lat && item.lon)) { 
          console.log("✅ Initializing Leaflet map with:", l);
          initializeMap(l,true);
        } else {
          console.warn("⚠️ Map not initialized - missing lat/lon or compare page not active.");
        }
      } else {
        console.warn("⚠️ Listings not yet loaded.");
      }
    });
  });
  });

</script>


<!-- Router -->
<main>
  <Router routes={{
    "/moving-services": MovingServices,
    "/building-dashboard": BuildingDashboard
  }} />
</main>

<style>
  @import 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
  
  #container {
    display: flex;
    height: 100vh;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  #map-container {
    width: 100%;
    height: 500px;
  }
  .table-container {
    width: 100%;
    max-width: 1200px;
    margin: 20px auto;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 15px;
  }
  .listing-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  .listing {
    background: white;
    padding: 15px;
    margin: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    width: 30%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .listings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* 2 wide */
    gap: 15px; /* Space between tiles */
    width: 100%;
    max-width: 90%; /* Keeps layout clean */
    margin: auto;
    padding: 10px;
}
.quick-apply-button {
   background-color: #007bff;
    color: white;
    border: none;
    padding: 8px;
    font-size: 12px;
    font-weight: bold;
    border-radius: 5px;
    cursor: pointer;
    width: 100%;
    margin-top: 5px;
    transition: background-color 0.2s;
}

.quick-apply-button:hover {
  background-color: #0056b3; /* Darker blue on hover */
}

/* Ensure proper alignment */
.listing-card {
   display: flex;
    flex-direction: column;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    padding: 10px;
    text-align: left;
    position: relative;
    transition: transform 0.2s;
    width: 100%; /* Adjust to grid */
    max-width: 400px; /* Prevents them from being too large */
}

.listing-card:hover {
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15); /* Slightly stronger shadow instead of scaling */
}

.listing-image {
    width: 100%;
    height: 140px; /* Adjust height to be smaller */
    border-radius: 8px;
    overflow: hidden;
    position: relative;
}

.listing-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.favorite-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(255, 255, 255, 0.8);
    border: none;
    font-size: 1.3rem;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
    z-index: 10; /* Ensures it's always above other elements */
    transition: background 0.2s;
}

.favorite-button:hover {
    background: rgba(255, 255, 255, 1);
}
.listing-info {
  padding: 10px 0;
}

.listing-price {
  font-size: 1.2em;
  font-weight: bold;
  margin: 0;
}

.listing-details {
  font-size: 0.8em;
  color: gray;
}

.listing-address {
  font-size: 0.8em;
  font-weight: bold;
  margin-top: 5px;
}



  #map {
    width: 100%;
    height: 100%;
    display:block;
  }
  #map-listings {
    width: 100%;
    height: 100%;
  }
  #sidebar {
    width: 300px;
    padding: 20px;
    border-left: 2px solid #ddd;
    background-color: #fff;
    position: fixed;
    right: 0;
    top: 0;
    height: 100vh;
    transition: transform 0.3s ease-in-out;
    transform: translateX(100%);
    z-index: 1000;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
  }
  #sidebar.open {
     transform: translateX(0); 
  }
  .sidebar-toggle {
    position: fixed;
    transition: right 0.3s ease-in-out;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    z-index: 1100;
    border-radius: 8px 0 0 8px;
  }
  .sidebar-toggle.open {
    right: 300px; /* Moves button next to sidebar */
  }
  .listing-details {
    width: 100%;
    max-width: 1200px;
    margin: 20px auto;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 15px;
  }
  .compare-container {
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 1003; /* Ensure it stays above everything */
}
  .compare-button {
  padding: 12px 20px;
  background-color: #007bff;
  color: white;
  font-size: 1em;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
}

.compare-button:hover {
  background-color: #0056b3;
}
  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 10px;
    border: 1px solid #ddd;
    text-align: left;
  }

  th {
    background-color: #f4f4f4;
  }
  .save-button {
    margin-top: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    padding: 8px;
    cursor: pointer;
    border-radius: 4px;
    width: 100%;
  }

  .attributes-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
  }

  .attributes-table td {
    padding: 8px;
    border: 1px solid #ddd;
    text-align: left;
  }

  .attributes-table input {
    margin-right: 10px;
  }

 .filter-sidebar {
    position: fixed;
    right: 0;
    top: 0;
    width: 300px;
    height: 100vh;
    background: white;
    padding: 20px;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
    transform: translateX(100%); /* Start hidden */
    transition: transform 0.3s ease-in-out;
    z-index: 1000;
    overflow-y: auto; /* Allows scrolling if content overflows */
    display: flex;
    flex-direction: column;
    gap: 15px; /* Space between inputs */
}
.filter-sidebar.open {
  transform: translateX(0);
}

.filter-toggle {
   position: fixed;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    padding: 10px;
    background-color: blue;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 8px 0 0 8px;
    z-index: 1101;
}

/* Filter Labels & Inputs */
.filter-group {
    display: flex;
    flex-direction: column;
    gap: 5px; /* Small spacing between label and input */
}

.filter-group label {
    font-size: 14px;
    font-weight: bold;
    color: #333; /* Dark gray for readability */
}

.filter-group input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 14px;
}
.apply-filters {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px;
  margin-top: 10px;
  cursor: pointer;
  width: 100%;
  border-radius: 5px;
}
.apply-filters:hover {
    background: #0056b3;
}
/* Green Banner Styling */
.glide-banner {
      position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 50px;
    background: #EDE6DD;
    z-index: 1000;
}

/* Smooth Hover Effect */
.glide-banner:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

/* Page Title Styling */
.page-title {
    margin-top: 20px; /* Adds space below the banner */
    text-align: center;
    font-size: 1.8rem;
    font-weight: bold;
    color: #333;
}

.content-container {
    padding-top: 40px; /* Pushes content below the banner */
}

.view-toggle-container {
    text-align: right;
    padding: 10px 20px;
}

.view-toggle-button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 15px;
    font-size: 1rem;
    font-weight: bold;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.view-toggle-button:hover {
    background-color: #0056b3;
}

/* Default: Listings take full width */
.view-layout {
    display: flex;
    flex-direction: column;
}
/* Split View: Listings on the left, Map on the right */
.view-layout.split-view {
    flex-direction: row;
    gap: 15px;
}

/* When in split view, make listings smaller */
.view-layout.split-view .listings-grid {
    flex: 1;
    max-width: 50%; /* Listings take up half the space */
    overflow-y: auto;
}
#map-container-listings {
    flex: 1;
    max-width: 50%;
    height: 100vh;
}
.logo {
    position: absolute;
    top: 10px;
    left: 20px;
    font-size: 24px;
    font-weight: bold;
    color: black;
    font-family: 'Editorial New', serif;
}
.toggle-switch {
    position: relative;
    top: auto;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    color: black;
    padding: 6px;
    border-radius: 30px;
    display: flex;
    width: 180px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 1200;
}

.toggle-option {
    flex: 1;
    text-align: center;
    padding: 10px;
    border-radius: 30px;
    cursor: pointer;
    transition: background 0.3s, color 0.3s;
    font-weight: 600;
}

.toggle-option.selected {
    background: #0d4727;
    color: white;
}

.floating-chat {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 60px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    z-index: 1300;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #ccc;
    cursor: pointer;
    transition: width 0.3s ease, height 0.3s ease, border-radius 0.3s ease;
    overflow: hidden;
}

.floating-chat:hover {
    width: 300px;
    height: 60px;
    border-radius: 30px;
    justify-content: flex-start;
    padding-left: 15px;
}

.chat-icon {
    font-size: 24px;
    color: #333;
}

.chat-content {
    display: none;
}

.floating-chat:hover .chat-content {
    display: block;
    width: 100%;
}
.nav-button {
    background-color: #007bff;
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    text-decoration: none;
    font-weight: bold;
    display: inline-block;
    margin-top: 60px;
  }

  .nav-button:hover {
    background-color: #0056b3;
  }

@media (max-width: 600px) {
    .listings-grid {
        grid-template-columns: repeat(1, 1fr); /* 1 column on small screens */
    }

    .listing-card {
        max-width: 100%; /* Adjust width for mobile */
    }
}


</style>
<div class="glide-banner">
   <div class="logo">glide</div>



</div>
<a href="#/moving-services" class="nav-button">🚛 Moving Services</a>

{#if $currentRoute !== "/moving-services"}
{#if $currentRoute !== "/building-dashboard"}
  {#if !$showComparePage}  <!-- ❌ Missing `$` -->
  <div class="content-container">
  <!-- Page Title -->
  <!-- View Toggle -->
  <div class="toggle-switch">
    <div class="toggle-option selected" on:click={toggleViewMode}>
        {$showMapView ? "Map" : "Listings"}
    </div>
</div>
    {#if $listings.length > 0}
      <button class="filter-toggle" on:click={toggleFilterSidebar}>
        {filterSidebarOpen ? "❌ Close Filters" : "🔍 Show Filters"}
      </button>

      <div class="filter-sidebar {filterSidebarOpen ? 'open' : ''}">
        <h3>Filters</h3>

        <div class="filter-group">
          <label>Min Price:</label>
          <input type="number" bind:value={$filters.min_price} placeholder="Min Price" />
        </div>

        <div class="filter-group">
          <label>Max Price:</label>
          <input type="number" bind:value={$filters.max_price} placeholder="Max Price" />
        </div>

        <div class="filter-group">
          <label>Min Beds:</label>
          <input type="number" bind:value={$filters.min_beds} placeholder="Min Beds" />
        </div>

        <div class="filter-group">
          <label>Max Beds:</label>
          <input type="number" bind:value={$filters.max_beds} placeholder="Max Beds" />
        </div>

        <div class="filter-group">
          <label>Min Sq Ft:</label>
          <input type="number" bind:value={$filters.min_sqft} placeholder="Min Sq Ft" />
        </div>

        <div class="filter-group">
          <label>Max Sq Ft:</label>
          <input type="number" bind:value={$filters.max_sqft} placeholder="Max Sq Ft" />
        </div>
        <div class="filter-group">
        {#each ["Cafes", "Parks", "Public Transport", "Schools", "Restaurants"] as poi}
              <label>
                  <input type="checkbox"
                        on:change={() => togglePOI(poi)}
                        checked={$userPreferences.poiTypes.includes(poi)} />
                  {poi}
              </label>
          {/each}
      </div>

        <button class="apply-filters" on:click={applyFilters}>Apply Filters</button>

      </div>
      <div class="view-layout { $showMapView ? 'split-view' : '' }">
        <div class="listings-grid">
            {#each $listings as listing (listing.address)}
              <div class="listing-card">
                <div class="listing-image">
                  <img src={listing.photo || "https://via.placeholder.com/300"} alt="Listing Image" />
                  <button class="favorite-button" on:click={() => toggleFavorite(listing)}>
                    {#if $favorites.some(fav => fav.address === listing.address)} ❤️ {:else} ♡ {/if}
                  </button>
                </div>
                <div class="listing-info">
                  <h3 class="listing-price">${listing.price.toLocaleString()}</h3>
                  <p class="listing-details">{listing.beds} Beds • {listing.baths} Baths • {listing.sqft} sqft</p>
                  <p class="listing-address">{listing.address}</p>
                </div>
                <button class="quick-apply-button" on:click={() => handleQuickApply(listing)}>
              Quick Apply
              </button>
              </div>
            {/each}
          </div>

        {#if $showMapView}
          <div id="map-container-listings">
              <div id="map-listings"></div>
          </div>
        {/if}
      </div>
      <div class="compare-container">
        {#if $favorites && $favorites.length >= 3}
          <button class="compare-button" on:click={handleCompare}>Compare</button>
        {/if}
      </div>
    {:else}
        <p>Listings Loading...</p>
    {/if}
  </div>
  <div class="floating-chat">
    <div class="chat-icon">💬</div>
    <div class="chat-content">
        <div class="chat-display">Chat messages will appear here...</div>
        <div class="chat-input-container">
            <input type="text" class="chat-input" placeholder="Type a message...">
        </div>
    </div>
</div>
{:else}
  <div id="container">
    <button class="sidebar-toggle" class:open={sidebarOpen} on:click={toggleSidebar}>
      {sidebarOpen ? "❌ Close" : "⚙ Preferences"}
    </button>
    <div id="sidebar" class="{sidebarOpen ? 'open' : ''}">
      <h3>Preferences</h3>
      <input type="text" bind:value={groceryStore} placeholder="Favorite Grocery Store" />
      <input type="text" bind:value={gym} placeholder="Favorite Gym" />
      <button class="save-button" on:click={updatePreferences}>Save Preferences</button> <!-- ✅ Now below inputs -->

<h3>Attributes</h3>

      <table class="attributes-table">
  <tbody>
    <tr>
      <td><input type="checkbox" bind:checked={$selectedAttributesLocal.price} /> Price</td>
    </tr>
    <tr>
      <td><input type="checkbox" bind:checked={$selectedAttributesLocal.sqft} /> Square Footage</td>
    </tr>
    <tr>
      <td><input type="checkbox" bind:checked={$selectedAttributesLocal.beds} /> Beds</td>
    </tr>
    <tr>
      <td><input type="checkbox" bind:checked={$selectedAttributesLocal.baths} /> Baths</td>
    </tr>
  </tbody>
</table>

    </div>

    <div class="listing-details">
      <h3>Comparison</h3>
      <table>
        <thead>
          <tr>
            <th>Address</th>
            {#if $selectedAttributesLocal.price} <th>Price</th> {/if}
            {#if $selectedAttributesLocal.sqft} <th>Sq Ft</th> {/if}
            {#if $selectedAttributesLocal.beds} <th>Beds</th> {/if}
            {#if $selectedAttributesLocal.baths} <th>Baths</th> {/if}
            <th>Nearest Favorite Grocery Store</th>
            <th>Nearest Favorite Gym</th>
            {#each $userPreferences.poiTypes as poiType}
            <th>Nearest {poiType}</th>
        {/each}
          </tr>
        </thead>
        <tbody>
          {#each $compareListings as listing}
            <tr>
              <td>{listing.address}</td>
              {#if $selectedAttributesLocal.price} <td>{listing.price || 'N/A'}</td> {/if}
              {#if $selectedAttributesLocal.sqft} <td>{listing.sqft || 'N/A'}</td> {/if}
              {#if $selectedAttributesLocal.beds} <td>{listing.beds || 'N/A'}</td> {/if}
              {#if $selectedAttributesLocal.baths} <td>{listing.baths || 'N/A'}</td> {/if}
              <td>{listing.nearestGrocery?.name} ({listing.nearestGrocery?.distance})</td>
              <td>{listing.nearestGym?.name} ({listing.nearestGym?.distance})</td>
              {#each $userPreferences.poiTypes as poiType}
                <td>{listing.nearestPOIs?.[poiType]?.name || 'N/A'} ({listing.nearestPOIs?.[poiType]?.distance || ''})</td>
            {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if $showMap}
    <div>
    <!-- Toggle Button for Show All / On Click Mode -->
    <button on:click={toggleShowMode} style="margin-bottom: 10px;">
      { $showMode === "onClick" ? "Show All" : "On Click" }
    </button>
  </div>
      <div id="map-container">
        <div id="map"></div>
      </div>
    {/if}
  </div>
{/if}
{/if}
{/if}