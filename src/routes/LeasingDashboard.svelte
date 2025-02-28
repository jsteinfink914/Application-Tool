<script>
  import { writable } from "svelte/store";
  import { fade } from "svelte/transition";

  let showDropdown = writable(false);
  let filterAction = writable("All");

  const units = [
    { id: 23, name: "Unit 1212", action: "Collect Deposit" },
    { id: 24, name: "Unit 1313", action: "Completed" },
    { id: 10, name: "Unit 808", action: "Approve Application" },
    { id: 11, name: "Unit 909", action: "View Documents" },
    { id: 12, name: "Unit 1010", action: "Send Lease" },
    { id: 7, name: "Unit 707", action: "Send Onboarding" },
    { id: 1, name: "Unit 101", action: "Approve Application" },
    { id: 4, name: "Unit 404", action: "Send Lease" },
    { id: 13, name: "Unit 111", action: "Update Listing" },
    { id: 14, name: "Unit 222", action: "Adjust Pricing" },
    { id: 15, name: "Unit 333", action: "Boost Visibility" },
    { id: 8, name: "Unit 808", action: "Promote Listing" },
    { id: 3, name: "Unit 303", action: "Assign to Agent" },
    { id: 2, name: "Unit 202", action: "Schedule Showings" },
    { id: 20, name: "Unit 808", action: "Send Renewal" },
    { id: 21, name: "Unit 909", action: "Prepare for Market" },
    { id: 22, name: "Unit 1010", action: "Post to Market" },
    { id: 5, name: "Unit 505", action: "Send Renewal" },
    { id: 19, name: "Unit 707", action: "Prepare for Market" },
    { id: 6, name: "Unit 606", action: "Post to Market" }
  ];

  // Compute filtered units based on filter selection
  $: filteredUnits = $filterAction === "All" ? units : units.filter(unit => unit.action === $filterAction);

  // Function to toggle active filter buttons
  function toggleActionFilter(action) {
    filterAction.set($filterAction === action ? "All" : action);
  }

  function toggleDropdown() {
    showDropdown.update(state => !state);
  }
</script>

<!-- 🌎 Page Container -->
<div class="page-container">
  <!-- 📌 Fixed Header with Menu Button -->
  <header class="header">
    <h2 class="building-title">The Magellan</h2>
    <button class="menu-button" on:click={toggleDropdown}>☰</button>
    {#if $showDropdown}
      <div class="dropdown-menu" transition:fade>
        <button class="dropdown-item">Transaction History</button>
      </div>
    {/if}
  </header>

  <!-- 🎛️ Filter Buttons -->
  <div class="filter-buttons">
    <button 
      class="filter-button { $filterAction === 'Approve Application' ? 'active' : '' }" 
      on:click={() => toggleActionFilter("Approve Application")}
    >
      ✅ Approve Application
    </button>
    <button 
      class="filter-button { $filterAction === 'Send Lease' ? 'active' : '' }" 
      on:click={() => toggleActionFilter("Send Lease")}
    >
      ✉️ Send Lease
    </button>
    <button 
      class="filter-button { $filterAction === 'Send Renewal' ? 'active' : '' }" 
      on:click={() => toggleActionFilter("Send Renewal")}
    >
      🔄 Send Renewal
    </button>
    <button 
      class="filter-button { $filterAction === 'Promote Listing' ? 'active' : '' }" 
      on:click={() => toggleActionFilter("Promote Listing")}
    >
      📢 Promote Listing
    </button>
    <button 
      class="filter-button { $filterAction === 'Collect Deposit' ? 'active' : '' }" 
      on:click={() => toggleActionFilter("Collect Deposit")}
    >
      💰 Collect Deposit
    </button>
    <button 
      class="filter-button { $filterAction === 'View Documents' ? 'active' : '' }" 
      on:click={() => toggleActionFilter("View Documents")}
    >
      📄 View Documents
    </button>
  </div>

  <!-- 📌 Grouped Unit Display -->
  <div class="unit-grid">
    {#each filteredUnits as unit}
      <div class="unit-card">
        <h4 class="unit-name">{unit.name}</h4>
        <button class="action-button">
          {unit.action} →
        </button>
      </div>
    {/each}
  </div>
</div>

<!-- 🖌 Styles -->
<style>
  body {
    font-family: 'Playfair Display', serif;
    background-color: #FBF7F0;
  }

  /* 📌 Page Layout */
  .page-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
  }

  /* 📌 Fixed Header */
  .header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: white;
    border-bottom: 2px solid black;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
  }

  .building-title {
    font-size: 2.5rem;
    font-weight: bold;
  }

  /* 🎛️ Filter Buttons */
  .filter-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 6rem;
    margin-bottom: 2rem;
    justify-content: center;
  }

  .filter-button {
    padding: 8px 15px;
    border: 2px solid black;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    background: white;
    transition: background 0.3s, color 0.3s;
  }

  .filter-button.active {
    background: black;
    color: white;
  }

  /* 🔲 Unit Grid */
  .unit-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    max-width: 1200px;
    width: 100%;
  }

  /* 🏠 Unit Card */
  .unit-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 2px solid black;
    transition: box-shadow 0.3s;
  }

  .unit-card:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }

  .unit-name {
    font-size: 1.5rem;
    font-weight: bold;
    color: black;
  }

  /* 📌 Menu Button */
  .menu-button {
    background: black;
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.5rem;
    color: white;
  }

  .menu-button:hover {
    background: #333;
  }

  /* 🔘 Action Button */
  .action-button {
    background-color: #0a3d3f;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.3s;
    border: none;
  }

  .action-button:hover {
    background-color: #062c2d;
  }
</style>
