<script>
  import { writable, derived } from "svelte/store";
  import { fade } from "svelte/transition";

  let showDropdown = writable(false);
  let selectedAction = writable("All");

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

  function toggleActionFilter(action) {
    selectedAction.update(curr => (curr === action ? "All" : action));
  }

  const groupedUnits = derived(selectedAction, $selectedAction => {
    const filtered = $selectedAction === "All" ? units : units.filter(unit => unit.action === $selectedAction);

    return {
      "Leasing Actions": filtered.filter(unit => ["Approve Application", "Send Lease", "View Documents", "Collect Deposit"].includes(unit.action)),
      "Marketing & Listings": filtered.filter(unit => ["Update Listing", "Adjust Pricing", "Boost Visibility", "Promote Listing", "Assign to Agent", "Schedule Showings"].includes(unit.action)),
      "Renewals & Market Prep": filtered.filter(unit => ["Send Renewal", "Prepare for Market", "Post to Market"].includes(unit.action)),
    };
  });

  function toggleDropdown() {
    showDropdown.update(state => !state);
  }
</script>

<!-- 🌎 Page Container -->
<div class="page-container">
  <!-- 📌 Header (No longer fixed) -->
  <header class="header">
    <h2 class="building-title">The Magellan</h2>
  </header>

  <!-- 📌 Menu Button (Top-Right) -->
  <div class="menu-container">
    <button class="menu-button" on:click={toggleDropdown}>☰</button>
    {#if $showDropdown}
      <div class="dropdown-menu" transition:fade>
        <button class="dropdown-item">Transaction History</button>
      </div>
    {/if}
  </div>

  <!-- 🎛️ Filter Buttons -->
  <div class="filter-buttons">
    {#each ["All", "Approve Application", "Send Lease", "Send Renewal", "Promote Listing", "Collect Deposit", "View Documents"] as action}
      <button 
        class="filter-button { $selectedAction === action ? 'active' : '' }" 
        on:click={() => toggleActionFilter(action)}
      >
        {action}
      </button>
    {/each}
  </div>

  <!-- 📌 Pre-grouped Horizontal Unit Display -->
  <div class="grouped-sections">
    {#each Object.entries($groupedUnits) as [category, unitList]}
      {#if unitList.length > 0}
        <div class="section">
          <h3 class="section-title">{category}</h3>
          <div class="unit-grid">
            {#each unitList as unit}
              <div class="unit-card">
                <h4 class="unit-name">{unit.name}</h4>
                <button class="action-button">{unit.action} →</button>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/each}

    {#if Object.values($groupedUnits).every(group => group.length === 0)}
      <p class="no-results">No units match this filter.</p>
    {/if}
  </div>
</div>

<!-- 🖌 Styles -->
<style>
  /* ✅ Global Reset */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Playfair Display', serif;
    background-color: #FBF7F0;
    overflow-x: hidden; /* ✅ Prevents horizontal scrolling */
    margin: 0;
    padding: 0;
    width: 100%;
  }

  .page-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    padding: 4rem 2rem; /* ✅ Increased padding */
    background: #FBF7F0;
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
  }

  .header {
    text-align: center;
    margin-bottom: 2rem; /* ✅ Increased spacing below title */
  }

  .building-title {
    font-size: 3rem;
    font-weight: bold;
    color: #0a3d3f;
  }

  .menu-container {
    position: fixed;
    top: 3rem;
    right: 1rem;
    z-index: 1002;
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

  .filter-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 15px; /* ✅ More spacing between filter buttons */
    margin-bottom: 2.5rem;
    justify-content: center;
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

  /* ✅ Ensures Proper Layout Without Extra White Space */
  .grouped-sections {
    width: 100%;
    max-width: 1100px; /* ✅ Slightly wider to fit naturally */
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 3rem; /* ✅ Extra space between sections */
  }

  .section {
    width: 100%;
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    margin-bottom: 2.5rem; /* ✅ More spacing between sections */
  }

  .section-title {
    font-size: 1.8rem;
    font-weight: bold;
    margin-bottom: 1.5rem; /* ✅ More spacing below section titles */
    text-align: center;
    color: #0a3d3f;
    border-bottom: 2px solid #ddd;
    padding-bottom: 10px;
  }

  /* ✅ Improved Grid Layout */
  .unit-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); /* ✅ Slightly larger units */
    gap: 1.5rem; /* ✅ More spacing between unit cards */
    max-width: 100%;
    width: 100%;
    margin: 0 auto;
  }

  .unit-card {
    background: white;
    padding: 1.75rem; /* ✅ Slightly more padding */
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    text-align: center;
    border: 1px solid #ddd;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .unit-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  .unit-name {
    font-size: 1.3rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 1rem;
  }

  .action-button {
    background-color: #0a3d3f;
    color: white;
    padding: 12px 18px; /* ✅ More comfortable button size */
    border-radius: 8px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.3s;
    border: none;
  }

  .action-button:hover {
    background-color: #062c2d;
  }
</style>
