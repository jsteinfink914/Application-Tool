<script>
  import { listings, favorites, selectedAttributes, userPreferences } from './store';
  import { toggleFavorite, getCompareData } from './store';
  import { onMount } from 'svelte';
  import L from 'leaflet';

  let map;
  let markers = [];
  
  // Initialize map with markers
  function initializeMap(listings) {
    map = L.map('map').setView([40.7128, -74.0060], 12);  // Center map at NYC coordinates
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    listings.forEach(listing => {
      if (listing.lat && listing.lon) {
        const marker = L.marker([listing.lat, listing.lon]).addTo(map);
        markers.push(marker);
      }
    });
  }

  onMount(() => {
    const compareListings = getCompareData();
    if (compareListings.length > 0) {
      initializeMap(compareListings);
    }
  });
</script>
