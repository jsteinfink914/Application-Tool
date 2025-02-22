
    
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

  if (map) {
        console.warn("🛑 Removing existing Leaflet map instance!");
        map.remove();
        map = null;
    }
    if (!map) {
        console.log("✅ Initializing Leaflet map...");
        map = L.map('map').setView([40.7128, -74.0060], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    }
    console.log("🟢 Listings to add markers for:", listingsData);
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    const listingIcon = L.icon({
        iconUrl: '/icons/house.png', 
        iconSize: [30, 30]
    });

    const groceryIcon = L.icon({
        iconUrl: '/icons/grocery.png',
        iconSize: [25, 25]
    });

    const gymIcon = L.icon({
        iconUrl: '/icons/gym.png',
        iconSize: [25, 25]
    });

    listingsData.forEach(listing => {
        if (listing.lat && listing.lon) {
            console.log(`📌 Adding marker for ${listing.address}`);
            const marker = L.marker([listing.lat, listing.lon], {icon: listingIcon}).addTo(map);
            markers.push(marker);
            marker.bindPopup(`
                <strong>${listing.address}</strong><br>
                🛒 Nearest Grocery: ${listing.nearestGrocery?.name || 'N/A'} (${listing.nearestGrocery?.distance || 'N/A'})<br>
                🏋️ Nearest Gym: ${listing.nearestGym?.name || 'N/A'} (${listing.nearestGym?.distance || 'N/A'})
            `);
             // On click, dynamically add gym and grocery markers using their custom icons.
        marker.on('click', () => {
          // Clear any existing secondary markers for this listing
          if (listing.gymMarker) {
            map.removeLayer(listing.gymMarker);
            listing.gymMarker = null;
          }
          if (listing.groceryMarker) {
            map.removeLayer(listing.groceryMarker);
            listing.groceryMarker = null;
          }
          // Add gym marker if valid data exists using gymIcon
          if (listing.nearestGym?.lat && listing.nearestGym?.lon) {
            listing.gymMarker = L.marker(
              [listing.nearestGym.lat, listing.nearestGym.lon],
              { icon: gymIcon }
            ).addTo(map);
            listing.gymMarker.bindPopup(`
                    <strong>🏋️ Gym: ${listing.nearestGym.name}</strong><br>
                    📍 Distance: ${listing.nearestGym.distance}
                `);
          }
          // Add grocery marker if valid data exists using groceryIcon
          if (listing.nearestGrocery?.lat && listing.nearestGrocery?.lon) {
            listing.groceryMarker = L.marker(
              [listing.nearestGrocery.lat, listing.nearestGrocery.lon],
              { icon: groceryIcon }
            ).addTo(map);
            listing.groceryMarker.bindPopup(`
                    <strong>🛒 Grocery: ${listing.nearestGrocery.name}</strong><br>
                    📍 Distance: ${listing.nearestGrocery.distance}
                `);
          }
        });
      } else {
        console.warn(`⚠️ Missing lat/lon for:`, listing);
      }
    });
    console.log("✅ Map and markers successfully initialized.");
  }
            


  const handleFavoriteToggle = (listing) => {
    toggleFavorite({
        ...listing,  // ✅ Store the entire listing, not just selected columns
        lat: listing.lat,
        lon: listing.lon
    });
    favorites.update(favs => [...favs]); // ✅ Ensure reactivity
};



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
     right: 0; /* Slide into view */
  }
  .sidebar-toggle {
    position: fixed;
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
    <button class="sidebar-toggle {sidebarOpen ? 'open' : ''}" on:click={toggleSidebar}>
      {sidebarOpen ? "❌ Close" : "⚙ Preferences"}
    </button>
    <div id="sidebar" class:open={sidebarOpen}>
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