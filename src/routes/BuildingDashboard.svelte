<script>
  import { writable } from "svelte/store";

  // Units Data
  const units = [
    { id: 1, name: "Unit 101", status: "Current on Rent", maintenance: false, message: true },
    { id: 2, name: "Unit 202", status: "Late on Rent", maintenance: true, message: true },
    { id: 3, name: "Unit 303", status: "Current on Rent", maintenance: false, message: true },
    { id: 4, name: "Unit 404", status: "Late on Rent", maintenance: false, message: true },
    { id: 5, name: "Unit 505", status: "Current on Rent", maintenance: true, message: true },
    { id: 6, name: "Unit 606", status: "Current on Rent", maintenance: false, message: true },
  ];

  // State for Search and Filters
  let searchQuery = writable("");
  let filterStatus = writable(""); // "Current on Rent" or "Late on Rent"
  let filterMaintenance = writable(""); // "Needs Maintenance" or "No Maintenance"
   // Dropdown state
  let showMenu = writable(false);

  // Computed: Filtered Units Based on Search & Filters
  $: filteredUnits = units.filter(unit => {
    return (
      unit.name.toLowerCase().includes($searchQuery.toLowerCase()) &&
      (!$filterStatus || unit.status === $filterStatus) &&
      (!$filterMaintenance || (unit.maintenance ? "Needs Maintenance" : "No Maintenance") === $filterMaintenance)
    );
  });

  function toggleStatusFilter(status) {
    filterStatus.set($filterStatus === status ? "" : status);
  }

  function toggleMaintenanceFilter(type) {
    filterMaintenance.set($filterMaintenance === type ? "" : type);
  }

  function toggleMenu() {
    showMenu.update(state => !state);
  }
</script>

<style>
  .dashboard-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #FBF7F0;
    padding: 2rem;
    font-family: 'Editorial New', serif;
  }

  .menu-button {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    background: black;
    border-radius: 50%;
    width: 3.5rem;
    height: 3.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    font-size: 1.5rem;
    color: white;
    z-index:1002;
  }

  .menu-button:hover {
    background: #333;
  }

  .dashboard-title {
    position: absolute;
    top: 1.5rem;
    left: 1.5rem;
    font-size: 2rem;
    font-weight: bold;
    color: black;
  }

  .property-title {
    font-size: 4rem;
    font-weight: bold;
    color: black;
    margin-bottom: 2rem;
  }

  .search-bar {
    width: 100%;
    max-width: 400px;
    padding: 10px;
    border: 2px solid black;
    border-radius: 8px;
    font-size: 1.2rem;
    text-align: center;
    margin-bottom: 20px;
  }

  .filter-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

.filter-button {
    padding: 12px 20px;
    border: none;
    border-radius: 20px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    background: #e5e5e5;
    transition: background 0.3s, color 0.3s;
  }

  .filter-button.active {
    background: #0a3d3f;
    color: white;
  }

  .unit-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    max-width: 1000px;
    width: 100%;
  }

  .unit-card {
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    border: 1px solid #ddd;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .unit-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .status {
    font-size: 1.2rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;
  }

  .status .icon {
    margin-right: 0.5rem;
  }

  .maintenance {
    font-size: 1.2rem;
    font-weight: 500;
    color: orange;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .message-button {
    background: #0d4727;
    color: white;
    padding: 0.6rem 1rem;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
    margin-top: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s;
    width: 100%;
    cursor: pointer;
  }

  .message-button:hover {
    background: #08321d;
  }

 /* 📱 Mobile Adjustments */
@media (max-width: 600px) {
    .dashboard-container {
        padding: 1rem;
    }

    .property-title {
        font-size: 2.2rem;
    }

    .dashboard-title {
        font-size: 1.5rem;
    }

    .filter-buttons {
        gap: 5px;
    }

    .filter-button {
        font-size: 0.8rem;
        padding: 5px 10px;
    }

    .search-bar {
        max-width: 100%;
        font-size: 0.9rem;
    }

    .unit-grid {
        grid-template-columns: 1fr; /* 📌 Make it single column on small screens */
    }

    .menu-button {
        background: black;
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s;
    cursor: pointer;
    font-size: 1.5rem;
    color: white;
    z-index: 1002;
    margin-top:40px;
    }
    .menu-container {
  position: relative; /* Ensures dropdown is positioned relative to this */
  display: inline-block; /* Prevents full-width stretching */
  z-index:1002;
}

.dropdown-menu {
  position: absolute;
  top: 100%; /* Makes it appear directly below */
  right: 0; /* Aligns it with the right side of the menu button */
  width: 200px;
  background: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  display: none;
  flex-direction: column;
  z-index: 1003;
}

.dropdown-menu.show {
  display: flex;

}

  .dropdown-item {
    padding: 12px;
    text-align: left;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .dropdown-item:hover {
    background: #f1f1f1;
  }

}
</style>

<div class="dashboard-container">
  <div class="menu-container">
    <!-- ☰ Menu Button -->
    <div class="menu-button" on:click={toggleMenu}>☰</div>

  <!-- 🔽 Dropdown Menu (Now properly inside menu-container) -->
    {#if $showMenu}
      <div class="dropdown-menu show">
        <a href="#/leasing-dashboard" class="dropdown-item">📊 Leasing Dashboard</a>
      </div>
    {/if}
  </div>

  <!-- Property Name -->
  <h2 class="property-title">The Magellan</h2>

  <!-- 🔎 Search Bar -->
  <input 
    class="search-bar" 
    type="text" 
    placeholder="Find a unit..." 
    bind:value={$searchQuery} 
  />

  <!-- 🎛️ Filter Buttons -->
  <div class="filter-buttons">
    <button 
      class="filter-button { $filterStatus === 'Current on Rent' ? 'active' : '' }" 
      on:click={() => toggleStatusFilter("Current on Rent")}
    >
      ✅ Current on Rent
    </button>
    <button 
      class="filter-button { $filterStatus === 'Late on Rent' ? 'active' : '' }" 
      on:click={() => toggleStatusFilter("Late on Rent")}
    >
      ⚠️ Late on Rent
    </button>
    <button 
      class="filter-button { $filterMaintenance === 'Needs Maintenance' ? 'active' : '' }" 
      on:click={() => toggleMaintenanceFilter("Needs Maintenance")}
    >
      🛠 Needs Maintenance
    </button>
    <button 
      class="filter-button { $filterMaintenance === 'No Maintenance' ? 'active' : '' }" 
      on:click={() => toggleMaintenanceFilter("No Maintenance")}
    >
      ✅ No Maintenance
    </button>
  </div>

  <!-- Units Grid -->
  <div class="unit-grid">
    {#each filteredUnits as unit}
      <div class="unit-card">
        <h3 class="text-2xl font-semibold text-black mb-2">{unit.name}</h3>
        <div class="status">{unit.status}</div>
        {#if unit.maintenance}
          <div class="maintenance">🛠 Maintenance Request</div>
        {/if}
        {#if unit.message}
          <button class="message-button">📩 Message Renter</button>
        {/if}
      </div>
    {/each}
  </div>
</div>
