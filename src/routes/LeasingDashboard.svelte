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

  // Group units into subsets for better organization
  const groupedUnits = {
    "Leasing Actions": units.filter(unit => ["Approve Application", "Send Lease", "View Documents", "Collect Deposit"].includes(unit.action)),
    "Marketing & Listings": units.filter(unit => ["Update Listing", "Adjust Pricing", "Boost Visibility", "Promote Listing", "Assign to Agent", "Schedule Showings"].includes(unit.action)),
    "Renewals & Market Prep": units.filter(unit => ["Send Renewal", "Prepare for Market", "Post to Market"].includes(unit.action)),
  };

  let selectedAction = writable("All");

  function toggleActionFilter(action) {
    selectedAction.set($selectedAction === action ? "All" : action);
  }

  function toggleDropdown() {
    showDropdown.update(state => !state);
  }
</script>

<!-- 🌎 Page Container -->
<div class="page-container">
  <!-- 📌 Fixed Header with Menu Button -->
  <header class="header">
    <!-- 🔹 Centered Title -->
    <h2 class="building-title">The Magellan</h2>

    <!-- 📌 Menu Container to prevent shifting -->
    <div class="menu-container">
      <button class="menu-button" on:click={toggleDropdown}>☰</button>

      {#if $showDropdown}
        <div class="dropdown-menu" transition:fade>
          <button class="dropdown-item">Transaction History</button>
        </div>
      {/if}
    </div>
  </header>

  <!-- 🎛️ Filter Buttons -->
  <div class="filter-buttons">
    {#each ["Approve Application", "Send Lease", "Send Renewal", "Promote Listing", "Collect Deposit", "View Documents"] as action}
      <button 
        class="filter-button { $selectedAction === action ? 'active' : '' }" 
        on:click={() => toggleActionFilter(action)}
      >
        {action}
      </button>
    {/each}
  </div>

  <!-- 📌 Grouped Unit Display -->
  <div class="grouped-sections">
    {#each Object.entries(groupedUnits) as [category, unitList]}
      <div class="section">
        <h3 class="section-title">{category}</h3>
        <div class="unit-grid">
          {#each unitList as unit}
            <div class="unit-card">
              <h4 class="unit-name">{unit.name}</h4>
              <button class="action-button">
                {unit.action} →
              </button>
            </div>
          {/each}
        </div>
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
    justify-content: start;
    min-height: 100vh;
    padding: 3rem 2rem;
    background: #EDE6DD;
  }

  /* 📌 Fixed Header */
   .header {
    width: 100%;
    max-width: 600px; /* Centers the title better */
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: white;
    border-bottom: 2px solid black;
    position: fixed;
    top: 50px; /* Adjusted to sit below the Glide banner */
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    border-radius: 8px; /* Adds subtle rounding */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .building-title {
    font-size: 2.5rem;
    font-weight: bold;
    margin-top: 1rem;
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
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    background: white;
    transition: background 0.3s, color 0.3s;
  }

  .filter-button.active {
    background: black;
    color: white;
  }

  /* 📌 Group Sections */
  .grouped-sections {
    width: 100%;
    max-width: 1200px;
  }

  .section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }

  .section-title {
    font-size: 1.6rem;
    font-weight: bold;
    margin-bottom: 1rem;
    border-bottom: 2px solid black;
    padding-bottom: 5px;
  }

  /* 🔲 Unit Grid */
  .unit-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  /* 🏠 Unit Card */
  .unit-card {
    background: white;
    padding: 1rem;
    border-radius: 10px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid black;
    transition: box-shadow 0.3s;
  }

  .unit-card:hover {
    box-shadow: 0 5px 12px rgba(0, 0, 0, 0.2);
  }

  .unit-name {
    font-size: 1.3rem;
    font-weight: bold;
    text-align: center;
  }

  /* 🔘 Action Button */
  .action-button {
    background-color: #0a3d3f;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.3s;
    border: none;
  }

  .action-button:hover {
    background-color: #062c2d;
  }
  .menu-container {
    position: relative; /* Keeps dropdown anchored */
    display: flex; /* Prevents movement */
  }

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
    transition: background 0.3s;
  }

  .menu-button:hover {
    background: #333;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
   @media (max-width: 600px) {
    .header {
      max-width: 90%;
      padding: 0.8rem;
    }

    .building-title {
      font-size: 1.5rem;
    }

    .menu-button {
      width: 2rem;
      height: 2rem;
      font-size: 1rem;
    }
  }

</style>
