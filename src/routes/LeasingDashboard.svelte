<script>
  import { fade } from "svelte/transition";

  let showDropdown = false;
  let filter = "All";

  function toggleDropdown() {
    showDropdown = !showDropdown;
  }

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

  function filteredUnits() {
    if (filter === "All") return units;
    return units.filter(unit => unit.action.includes(filter));
  }
</script>

<div class="page-container">
  
  <!-- 📌 Menu Button (TOP RIGHT) -->
  <div class="menu-wrapper">
    <button class="menu-button" on:click={toggleDropdown}>
      ☰
    </button>

    {#if showDropdown}
      <div class="dropdown-menu" transition:fade>
        <button class="dropdown-item">Transaction History</button>
      </div>
    {/if}
  </div>

  <!-- 🏠 App Title -->
  <h2 class="app-title">glide</h2>
  <h2 class="building-title">The Magellan</h2>

  <!-- Filter Dropdown -->
  <div class="filter-container">
    <label for="filter" class="filter-label">Filter Actions:</label>
    <select id="filter" bind:value={filter} class="filter-dropdown">
      <option value="All">All</option>
      <option value="Approve Application">Approve Application</option>
      <option value="Send Lease">Send Lease</option>
      <option value="Send Renewal">Send Renewal</option>
      <option value="Promote Listing">Promote Listing</option>
      <option value="Collect Deposit">Collect Deposit</option>
      <option value="View Documents">View Documents</option>
    </select>
  </div>

  <!-- Grid Display -->
  <div class="unit-grid">
    {#each filteredUnits() as unit}
      <div class="unit-card">
        <div class="unit-info">
          <h3 class="unit-name">{unit.name}</h3>
        </div>
        <button class="action-button">
          {unit.action} →
        </button>
      </div>
    {/each}
  </div>
</div>

<style>
  /* 🌎 Global Styles */
  @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap");

  body {
    font-family: 'Playfair Display', serif;
    background-color: #FBF7F0;
  }

  /* 📌 Main Page Layout */
  .page-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    background-color: #FBF7F0;
  }

  .app-title {
    position: absolute;
    top: 1.5rem;
    left: 1rem;
    font-size: 2.5rem;
    font-weight: bold;
    color: black;
  }

  .building-title {
    font-size: 4rem;
    font-weight: bold;
    margin-bottom: 2rem;
  }

  /* 🔘 Filter Container */
  .filter-container {
    margin-bottom: 2rem;
  }

  .filter-label {
    font-size: 1.2rem;
    font-weight: bold;
    color: black;
  }

  .filter-dropdown {
    width: 200px;
    padding: 0.8rem;
    border: 2px solid black;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    background: #F9F9F9;
    transition: background 0.3s;
    margin-left: 1rem;
  }

  .filter-dropdown:hover {
    background: #EAEAEA;
  }

  /* 🔲 Unit Grid */
  .unit-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
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
    font-size: 1.8rem;
    font-weight: bold;
    color: black;
  }

  /* 🔘 Action Button */
  .action-button {
    display: flex;
    align-items: center;
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

  /* 📌 Menu Button (TOP RIGHT) */
  .menu-wrapper {
    position: absolute;
    top: 1rem;
    right: 1rem;
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
  }

  .menu-button:hover {
    background: #333;
  }

</style>
