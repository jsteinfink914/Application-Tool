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

  // Function to toggle the filter
  function toggleActionFilter(action) {
    selectedAction.update(curr => (curr === action ? "All" : action));
  }

  // Dynamically filtered units based on selected action
  const filteredUnits = derived(selectedAction, $selectedAction => {
    if ($selectedAction === "All") return units;

    return units.filter(unit => unit.action === $selectedAction);
  });

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

  </header>

    <!-- 📌 Menu Container -->
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

  <!-- 📌 Filtered Unit Display -->
  <div class="grouped-sections">
    {#if $filteredUnits.length === 0}
      <p>No units match this filter.</p>
    {:else}
      {#each $filteredUnits as unit}
        <div class="unit-card">
          <h4 class="unit-name">{unit.name}</h4>
          <button class="action-button">{unit.action} →</button>
        </div>
      {/each}
    {/if}
  </div>
</div>

<!-- 🖌 Styles -->
<style>
  body {
    font-family: 'Playfair Display', serif;
    background-color: #FBF7F0;
  }

  .page-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    padding: 3rem 2rem;
    background: #EDE6DD;
  }

  .header {
    width: 100%;
    max-width: 600px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: white;
    border-bottom: 2px solid black;
    position: absolute;
    top: 50px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .building-title {
    font-size: 2.5rem;
    font-weight: bold;
    margin-top: 1rem;
  }

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

  .grouped-sections {
    width: 100%;
    max-width: 1200px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }

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
    width: 220px;
  }

  .unit-card:hover {
    box-shadow: 0 5px 12px rgba(0, 0, 0, 0.2);
  }

  .unit-name {
    font-size: 1.3rem;
    font-weight: bold;
    text-align: center;
  }

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
    position: relative;
    display: flex;
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
</style>
