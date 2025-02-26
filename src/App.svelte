
    
   <script>

    // ✅ 1. External Libraries First
  import { onMount, tick } from 'svelte';
  import { writable, get } from 'svelte/store'; 

  // ✅ 2. Store Imports Next (No Duplicates)
  import { 
  listings, 
  favorites, 
  selectedAttributes, 
  userPreferences, 
  toggleFavorite, 
  getCompareData, 
  updateUserPreferences 
} from './store.js';


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
    showMapView.update(value => !value);
    // Ensure the map initializes only when it's first shown
  if (showMapView && !map) {
    setTimeout(() => initializeMap($listings), 500); // Small delay to let UI update
  }
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
    initializeMap(get(compareListings)); // ✅ Re-render map with new mode
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
    await updateUserPreferences({ grocery: groceryStore, gym: gym });
    await tick(); // Wait for listings to update
    compareListings.set(getCompareData());
    if ($showComparePage) {
      clearRoutes(); // ✅ Ensures old routes disappear
      initializeMap(get(compareListings));
    }
  };

  function initializeMap(listingsData) {
    const mode = get(showMode);
    const mapContainer = document.getElementById('map');
     listingsData.forEach(listing => {
        console.log(`🔍 Checking listing: ${listing.address}`);
        console.log(`   🛒 Nearest Grocery:`, listing.nearestGrocery);
        console.log(`   🏋️ Nearest Gym:`, listing.nearestGym);
    });

    if (!mapContainer) {
        console.warn("🚨 #map container missing! Retrying in 500ms...");
        setTimeout(() => initializeMap(listingsData), 500);
        return;
    }
    console.log("✅ #map container FOUND, initializing map...");

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
    console.log("🟢 Listings to add markers for:", listingsData);
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    listingMarkers.clear();
   

    listingsData.forEach((listing,index) => {
        if (listing.lat && listing.lon) {
            const color = getRandomColor(index);
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
                setTimeout(() => initializeMap(data), 500);
            } else {
                initializeMap(data);
            }
        }, 300); // ✅ Small delay to ensure rendering
    }
};

function handleScroll() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    fetchListings({}, true); // Load more listings when near bottom
  }
}

  onMount(() => {
    window.addEventListener("scroll", handleScroll);
  loadGoogleMapsScript(() =>{
    listings.subscribe(l => {
      if (l.length > 0) {
        console.log("✅ Listings loaded, checking if map should initialize...");
        if ($showComparePage && l.some(item => item.lat && item.lon)) { 
          console.log("✅ Initializing Leaflet map with:", l);
          initializeMap(l);
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
    max-width: 900px; /* Keeps layout clean */
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
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 60px;
    background: linear-gradient(90deg, #28a745, #32cd32); /* Smooth green gradient */
    color: white;
    display: flex;
    font-size: 2rem;
    font-weight: bold;
    text-align: left; /* ✅ Left align the text */
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    font-family: 'Arial', sans-serif;
    z-index: 1002; /* Ensures it's always above other elements */
    transition: all 0.3s ease-in-out;
}

/* Smooth Hover Effect */
.glide-banner:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

/* Page Title Styling */
.page-title {
    margin-top: 80px; /* Adds space below the banner */
    text-align: center;
    font-size: 1.8rem;
    font-weight: bold;
    color: #333;
}

.content-container {
    padding-top: 80px; /* Pushes content below the banner */
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
    <h1>Glide</h1>
</div>
<div class="content-container">
<!-- Page Title -->
<h2 class="page-title">Recommendation Feed</h2>
<div class="view-toggle-container">
    <button class="view-toggle-button" on:click={toggleViewMode}>
        {showMapView ? "📜 Listings Only" : "🗺 Listings + Map"}
    </button>
</div>


{#if !$showComparePage}  <!-- ❌ Missing `$` -->
  {#if $listings.length > 0}
    <button class="filter-toggle" on:click={toggleFilterSidebar}>
    {filterSidebarOpen ? "❌ Close Filters" : "🔍 Show Filters"}
    </button>

    <div class="filter-sidebar {filterSidebarOpen ? 'open' : ''}">
      <h3>Filters</h3>

      <div class="filter-group">
        <label>Min Price:</label>
        <input type="number" bind:value={filters.min_price} placeholder="Min Price" />
      </div>

      <div class="filter-group">
        <label>Max Price:</label>
        <input type="number" bind:value={filters.max_price} placeholder="Max Price" />
      </div>

      <div class="filter-group">
        <label>Min Beds:</label>
        <input type="number" bind:value={filters.min_beds} placeholder="Min Beds" />
      </div>

      <div class="filter-group">
        <label>Max Beds:</label>
        <input type="number" bind:value={filters.max_beds} placeholder="Max Beds" />
      </div>

      <div class="filter-group">
        <label>Min Sq Ft:</label>
        <input type="number" bind:value={filters.min_sqft} placeholder="Min Sq Ft" />
      </div>

      <div class="filter-group">
        <label>Max Sq Ft:</label>
        <input type="number" bind:value={filters.max_sqft} placeholder="Max Sq Ft" />
      </div>

      <button class="apply-filters" on:click={() => applyFilters()}>Apply Filters</button>
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
  {:else}
      <p>Listings Loading...</p>
  {/if}
{/if}



  <div class="compare-container">
    {#if $favorites && $favorites.length >= 3}
        <button class="compare-button" on:click={handleCompare}>Compare</button>
    {/if}
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
            <th>Nearest Grocery Store</th>
            <th>Nearest Gym</th>
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