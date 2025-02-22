
    
   <script>
  import { listings, favorites, selectedAttributes, userPreferences } from './store.js';
  import { toggleFavorite, getCompareData, updateUserPreferences } from './store.js';
  import { onMount, tick } from 'svelte';
  import L from 'leaflet';
  import { writable,get } from 'svelte/store';

  let map;
  const GOOGLE_MAPS_API_KEY = 'AIzaSyB5TEd6BSGVllv5x3-oXF1m7AN_Yjg0-NU'
  let markers = [];
  let compareListings = writable([]);
  let selectedAttributesLocal = writable({
    price: true,
    squareFootage: true,
    laundryInBuilding: true,
    doorman: true,
    dishwasher: true,
  });

  let groceryStore = '';
  let gym = '';
  let showComparePage = writable(false);
  let showMap = writable(false); // ✅ Moved inside <script>

  let sidebarOpen = false;
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
    console.log("Sidebar state:", sidebarOpen); // Debugging
  }

   // **Load Google Maps API dynamically**
  function loadGoogleMapsScript(callback) {
    if (window.google && window.google.maps) {
      callback();
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB5TEd6BSGVllv5x3-oXF1m7AN_Yjg0-NU&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = callback;
    document.head.appendChild(script);
  }



  const updatePreferences = async () => {
    await updateUserPreferences({ grocery: groceryStore, gym: gym });
    await tick(); // Wait for listings to update
    compareListings.set(getCompareData());
    if ($showComparePage) {
      initializeMap(get(compareListings));
    }
  };

  function initializeMap(listingsData) {
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
    }
    console.log("🟢 Listings to add markers for:", listingsData);
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    listingsData.forEach(listing => {
        if (listing.lat && listing.lon) {
            console.log(`📌 Adding marker for ${listing.address}`);
             const marker = new google.maps.Marker({
                          position: { lat: listing.lat, lng: listing.lon },
                          map,
                          title: listing.address,
                          icon: "/icons/house.png",
                        });
              const infoWindow = new google.maps.InfoWindow({
                        content: `
                          <strong>${listing.address}</strong><br>
                          🛒 Nearest Grocery: ${listing.nearestGrocery?.name || 'N/A'} (${listing.nearestGrocery?.distance || 'N/A'})<br>
                          🏋️ Nearest Gym: ${listing.nearestGym?.name || 'N/A'} (${listing.nearestGym?.distance || 'N/A'})
                        `,
                      });
              marker.addListener("click", () => {
                    infoWindow.open(map, marker);
                    addGymAndGroceryMarkers(listing);
                  });
            markers.push(marker);
        }else{
           console.warn(`⚠️ Missing lat/lon for:`, listing);
        }
    });
      console.log("✅ Google Map and markers successfully initialized.");
  }
    


  const handleFavoriteToggle = (listing) => {
    toggleFavorite({
        ...listing,  // ✅ Store the entire listing, not just selected columns
        lat: listing.lat,
        lon: listing.lon
    });
    favorites.update(favs => [...favs]); // ✅ Ensure reactivity
};

function addGymAndGroceryMarkers(listing) {
    // Remove existing gym and grocery markers if they exist
  if (listing.gymMarker) {
    listing.gymMarker.setMap(null);
    listing.gymMarker = null;
  }
  if (listing.groceryMarker) {
    listing.groceryMarker.setMap(null);
    listing.groceryMarker = null;
  }

    // Add gym marker
    if (listing.nearestGym?.lat && listing.nearestGym?.lon) {
    console.log(`🏋️ Adding gym marker at ${listing.nearestGym.lat}, ${listing.nearestGym.lon}`);

    listing.gymMarker = new google.maps.Marker({
      position: { lat: listing.nearestGym.lat, lng: listing.nearestGym.lon },
      map, // ✅ Make sure the marker is added to the map
      icon: "/icons/gym.png",
      title: `Gym: ${listing.nearestGym.name}`,
    });

    const gymInfoWindow = new google.maps.InfoWindow({
      content: `<strong>🏋️ Gym: ${listing.nearestGym.name}</strong><br>📍 Distance: ${listing.nearestGym.distance}`,
    });

    listing.gymMarker.addListener("click", () => {
      gymInfoWindow.open(map, listing.gymMarker);
    });
  } else {
    console.warn("⚠️ No gym coordinates found for:", listing.address);
  }

  // ✅ Add Grocery Marker
  if (listing.nearestGrocery?.lat && listing.nearestGrocery?.lon) {
    console.log(`🛒 Adding grocery marker at ${listing.nearestGrocery.lat}, ${listing.nearestGrocery.lon}`);

    listing.groceryMarker = new google.maps.Marker({
      position: { lat: listing.nearestGrocery.lat, lng: listing.nearestGrocery.lon },
      map, // ✅ Ensure it's added to the map
      icon: "/icons/grocery.png",
      title: `Grocery: ${listing.nearestGrocery.name}`,
    });

    const groceryInfoWindow = new google.maps.InfoWindow({
      content: `<strong>🛒 Grocery: ${listing.nearestGrocery.name}</strong><br>📍 Distance: ${listing.nearestGrocery.distance}`,
    });

    listing.groceryMarker.addListener("click", () => {
      groceryInfoWindow.open(map, listing.groceryMarker);
    });
  } else {
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



  onMount(() => {
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
  .compare-button {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
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
</style>

{#if !$showComparePage}  <!-- ❌ Missing `$` -->
  {#if $listings.length > 0}
  <div class="table-container">
  <h3>Available Listings</h3>
    <div class="listing-container">
      {#each $listings as listing (listing.address)}
        <div class="listing">
          <span>{listing.address}</span>
          <button class="favorite-button" on:click={() => toggleFavorite(listing)}>
            {#if $favorites.some(fav => fav.address === listing.address)} ❤️ {:else} ♡ {/if}
          </button>
        </div>
      {/each}
    </div>
  </div>
  {:else}
  <p>Listings Loading.</p> <!-- ✅ Debugging message -->
{/if}


  {#if $favorites && $favorites.length >= 3}
    <button class="compare-button" on:click={handleCompare}>Compare</button>
  {:else}
    <p>⚠️ Select at least 3 favorites to compare.</p> <!-- ✅ Debugging text -->
  {/if}

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
      <td><input type="checkbox" bind:checked={$selectedAttributesLocal.squareFootage} /> Square Footage</td>
    </tr>
    <tr>
      <td><input type="checkbox" bind:checked={$selectedAttributesLocal.laundryInBuilding} /> Laundry in Building</td>
    </tr>
    <tr>
      <td><input type="checkbox" bind:checked={$selectedAttributesLocal.doorman} /> Doorman</td>
    </tr>
    <tr>
      <td><input type="checkbox" bind:checked={$selectedAttributesLocal.dishwasher} /> Dishwasher</td>
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
            {#if $selectedAttributesLocal.squareFootage} <th>Sq Ft</th> {/if}
            {#if $selectedAttributesLocal.laundryInBuilding} <th>Laundry</th> {/if}
            {#if $selectedAttributesLocal.doorman} <th>Doorman</th> {/if}
            {#if $selectedAttributesLocal.dishwasher} <th>Dishwasher</th> {/if}
            <th>Nearest Grocery Store</th>
            <th>Nearest Gym</th>
          </tr>
        </thead>
        <tbody>
          {#each $compareListings as listing}
            <tr>
              <td>{listing.address}</td>
              {#if $selectedAttributesLocal.price} <td>{listing.price || 'N/A'}</td> {/if}
              {#if $selectedAttributesLocal.squareFootage} <td>{listing.squareFootage || 'N/A'}</td> {/if}
              {#if $selectedAttributesLocal.laundryInBuilding} <td>{listing.laundryInBuilding || 'N/A'}</td> {/if}
              {#if $selectedAttributesLocal.doorman} <td>{listing.doorman || 'N/A'}</td> {/if}
              {#if $selectedAttributesLocal.dishwasher} <td>{listing.dishwasher || 'N/A'}</td> {/if}
              <td>{listing.nearestGrocery?.name} ({listing.nearestGrocery?.distance})</td>
              <td>{listing.nearestGym?.name} ({listing.nearestGym?.distance})</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if $showMap}
      <div id="map-container">
        <div id="map"></div>
      </div>
    {/if}
  </div>
{/if}