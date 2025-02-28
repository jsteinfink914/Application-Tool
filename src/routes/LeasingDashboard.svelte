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
  body {
    font-family: 'Playfair Display', serif;
    background-color: #FBF7F0;
    overflow-x: hidden;
    margin: 0; /* ✅ Remove default body margin */
    padding: 0;
    width: 100%; /* ✅ Ensures no extra width beyond the viewport */
  }
  .grouped-sections {
    width: 100%; /* ✅ Ensures no extra width */
    max-width: 1000px; /* ✅ Prevents horizontal scrolling */
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .page-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    padding: 3rem 2rem;
    background: #EDE6DD;
    width: 100%; /* ✅ Avoids 100vw scrollbar issue */
    margin: 0 auto; /* ✅ Ensures no left-side white space */
  }
  * {
    box-sizing: border-box; /* Ensures padding/margin don't extend past width */
    margin: 0;
    padding: 0;
  }

  .header {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .building-title {
    font-size: 3rem;
    font-weight: bold;
    color: #0a3d3f;
  }

  .menu-container {
    position: fixed;
    top: 1rem;
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
    gap: 12px;
    margin-bottom: 2rem;
    justify-content: center;
  }

  .filter-button {
    padding: 10px 18px;
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

  /* ✅ Balanced Grid for Pre-Grouped Units */
  .unit-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    max-width: 100%; /* ✅ Restricts width */
    margin: 0 auto; /* ✅ Centers properly */
    width: 100%;
  }

  .unit-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    text-align: center;
  }

  .action-button {
    background-color: #0a3d3f;
    color: white;
    padding: 10px 15px;
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
