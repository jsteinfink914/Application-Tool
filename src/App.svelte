<script>
  import { listings, favorites, selectedAttributes, userPreferences } from './store.js';
  import { toggleFavorite, getCompareData, updateUserPreferences } from './store.js';
  import { onMount } from 'svelte';
  import L from 'leaflet';
  import { writable } from 'svelte/store';

  let map;
  let markers = [];
  let compareListings = [];
  let selectedAttributesLocal = writable({
    price: true,
    squareFootage: true,
    laundryInBuilding: true,
    doorman: true,
    dishwasher: true,
  });

  $: selectedAttributesLocalValue = $selectedAttributesLocal;
  // Sidebar input for grocery store and gym
  let groceryStore = '';
  let gym = '';
  
  const updatePreferences = () => {
    updateUserPreferences(groceryStore, gym);
  };

  // Initialize map with markers
  function initializeMap(listings) {
    if (!map) {
      map = L.map('map').setView([40.7128, -74.0060], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    }

    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    listings.forEach(listing => {
      if (listing.lat && listing.lon) {
        const marker = L.marker([listing.lat, listing.lon]).addTo(map);
        markers.push(marker);
      }
    });
  }
  // Toggle favorite logic
  const handleFavoriteToggle = (listing) => {
    toggleFavorite(listing);
  };

  // Compare button logic
  const handleCompare = () => {
    compareListings = getCompareData();
    if (compareListings.length > 0) {
      initializeMap(compareListings); // Add the map with compare listings
    }
  };

  onMount(() => {
    console.log("Listings:", listings);
    console.log("Favorites:", favorites);
    console.log("Selected Attributes:", selectedAttributes);
    setTimeout(() => {
      if (listings.length > 0) {
        initializeMap(listings);
      }
    }, 500);
  });
</script>

<style>
   @import 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
  /* Add basic styling for the sidebar, map, and compare page */
  #sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: 300px;
    background-color: #fff;
    padding: 20px;
    border-left: 2px solid #ddd;
  }

  #map {
    height: 100vh;
    width: 100%;
  }

  .listing {
    display: flex;
    justify-content: space-between;
    margin: 10px 0;
    border: 1px solid #ccc;
    padding: 10px;
  }

  .favorites-list {
    margin-top: 20px;
  }

  .compare-button {
    margin-top: 20px;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
  }

  .listing-details {
    margin: 20px 0;
  }
</style>

<div id="map"></div>

<!-- Sidebar for grocery store and gym input -->
<div id="sidebar">
  <h3>Preferences</h3>
  <label for="grocery-store">Favorite Grocery Store:</label>
  <input
    type="text"
    id="grocery-store"
    bind:value={groceryStore}
    placeholder="Enter grocery store"
  />
  <br />

  <label for="gym">Favorite Gym:</label>
  <input
    type="text"
    id="gym"
    bind:value={gym}
    placeholder="Enter gym"
  />
  <br />
  <button on:click={updatePreferences}>Save Preferences</button>

  <h3>Attributes</h3>
  <div>
    <input type="checkbox" bind:checked={$selectedAttributesLocal.price} /> Price
    <br />
    <input type="checkbox" bind:checked={$selectedAttributesLocal.squareFootage} /> Square Footage
    <br />
    <input type="checkbox" bind:checked={$selectedAttributesLocal.laundryInBuilding} /> Laundry in Building
    <br />
    <input type="checkbox" bind:checked={$selectedAttributesLocal.doorman} /> Doorman
    <br />
    <input type="checkbox" bind:checked={$selectedAttributesLocal.dishwasher} /> Dishwasher
    <br />
  </div>

  <!-- Compare button -->
  {#if $favorites.length > 1}
    <button class="compare-button" on:click={handleCompare}>Compare</button>
  {/if}
</div>

<!-- Listings display -->
<div class="listing-container">
  {#each listings as listing}
    <div class="listing">
      <span>{listing.address}</span>
      <button on:click={() => handleFavoriteToggle(listing)}>
        {favorites.includes(listing) ? '♥' : '♡'}
      </button>
    </div>
  {/each}
</div>

<!-- Compare Page -->
{#if compareListings.length > 0}
  <div class="listing-details">
    <h3>Comparison</h3>
    <table>
      <thead>
        <tr>
          <th>Address</th>
          {#if $selectedAttributesLocal.price} <th>Price</th> {/if}
          {#if $selectedAttributesLocal.squareFootage} <th>Sq Ft</th> {/if}
          {#if $selectedAttributesLocal.laundryInBuilding} <th>Laundry in Building</th> {/if}
          {#if $selectedAttributesLocal.doorman} <th>Doorman</th> {/if}
          {#if $selectedAttributesLocal.dishwasher} <th>Dishwasher</th> {/if}
        </tr>
      </thead>
      <tbody>
        {#each compareListings as listing}
          <tr>
            <td>{listing.address}</td>
            {#if $selectedAttributesLocal.price} <td>{listing.price}</td> {/if}
            {#if $selectedAttributesLocal.squareFootage} <td>{listing.squareFootage}</td> {/if}
            {#if $selectedAttributesLocal.laundryInBuilding} <td>{listing.laundryInBuilding}</td> {/if}
            {#if $selectedAttributesLocal.doorman} <td>{listing.doorman}</td> {/if}
            {#if $selectedAttributesLocal.dishwasher} <td>{listing.dishwasher}</td> {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
