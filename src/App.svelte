<script>
  import { listings, favorites, selectedAttributes, userPreferences } from './store.js';
  import { toggleFavorite, getCompareData, updateUserPreferences } from './store.js';
  import { onMount, tick } from 'svelte';
  import L from 'leaflet';
  import { writable } from 'svelte/store';

  let map;
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
  
  const updatePreferences = () => {
    updateUserPreferences({ grocery: groceryStore, gym: gym });
  };

  function initializeMap(listingsData) {
    if (!map && document.getElementById('map')) {
      console.log("✅ Initializing Leaflet map...");
      map = L.map('map').setView([40.7128, -74.0060], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    }
    
    if (map) {
      markers.forEach(marker => map.removeLayer(marker));
      markers = [];
      listingsData.forEach(listing => {
        if (listing.lat && listing.lon) {
          console.log(`📌 Adding marker for ${listing.address}`);
          const marker = L.marker([listing.lat, listing.lon]).addTo(map);
          markers.push(marker);
        } else {
          console.warn(`⚠️ Missing lat/lon for:`, listing);
        }
      });
    }
  }

  const handleFavoriteToggle = (listing) => {
    toggleFavorite(listing);
    favorites.update(favs => [...favs]);
  };

  const handleCompare = async () => {
    let data = getCompareData();
    compareListings.set(data);

    if (data.length > 0) {
      showComparePage.set(true);
      await tick();

      // Initialize map ONLY when the compare page is shown
      setTimeout(() => {
        if (document.getElementById('map')) {
          initializeMap(data);
        }
      }, 500);
    }
  };

  onMount(() => {
  listings.subscribe(l => {
    console.log("✅ Listings Updated in Store:", l); // Log to confirm update
    if (l.length > 0) {
      initializeMap(l);
    }
  });
});
</script>

<style>
  @import 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
  
  #container {
    display: flex;
    height: 100vh;
  }
  #map-container {
    flex: 1;
    height: 100vh;
  }
  #sidebar {
    width: 300px;
    padding: 20px;
    border-left: 2px solid #ddd;
    background-color: #fff;
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
</style>

{#if !$showComparePage}
  <div class="listing-container">
    {#each $listings as listing}
      <div class="listing">
        <span>{listing.address}</span>
        <button on:click={() => handleFavoriteToggle(listing)}>
          {#if $favorites.some(fav => fav.address === listing.address)} ♥ {:else} ♡ {/if}
        </button>
      </div>
    {/each}
  </div>
  {#if $favorites.length >= 3}
    <button class="compare-button" on:click={handleCompare}>Compare</button>
  {/if}
{:else}
  <div id="container">
    <div id="map-container">
      <div id="map"></div>
    </div>
    <div id="sidebar">
      <h3>Preferences</h3>
      <input type="text" bind:value={groceryStore} placeholder="Favorite Grocery Store" />
      <input type="text" bind:value={gym} placeholder="Favorite Gym" />
      <button on:click={updatePreferences}>Save Preferences</button>
      <h3>Attributes</h3>
      <input type="checkbox" bind:checked={$selectedAttributesLocal.price} /> Price
      <input type="checkbox" bind:checked={$selectedAttributesLocal.squareFootage} /> Square Footage
      <input type="checkbox" bind:checked={$selectedAttributesLocal.laundryInBuilding} /> Laundry in Building
      <input type="checkbox" bind:checked={$selectedAttributesLocal.doorman} /> Doorman
      <input type="checkbox" bind:checked={$selectedAttributesLocal.dishwasher} /> Dishwasher
    </div>
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
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
