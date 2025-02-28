<script>
  import { writable } from "svelte/store";

  // Dropdown state for the menu button
  let showDropdown = writable(false);

  // Function to toggle dropdown visibility
  function toggleDropdown() {
    showDropdown.update(state => !state);
  }
</script>

<style>
  .portal-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #FBF7F0;
    padding: 2rem;
    font-family: 'Editorial New', serif;
    width: 100%;
  }

  /* Menu Button */
  .menu-button {
  position: absolute; /* Make it position relative to .portal-container */
  top: 3rem; /* Adjust vertical position */
  right: 3rem; /* Adjust horizontal position */
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

  /* Dropdown Menu */
  .dropdown-menu {
    position: absolute;
    top: 3.5rem;
    right: 1rem;
    width: 180px;
    background: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 6px;
    display: none;
    flex-direction: column;
    top:110%;
  }

  .dropdown-menu.show {
    display: flex;
  }

  .dropdown-item {
    padding: 10px;
    text-align: left;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .dropdown-item:hover {
    background: #f1f1f1;
  }

  .portal-title {
    position: absolute;
    top: 1rem;
    left: 1rem;
    font-size: 2rem;
    font-weight: bold;
    color: black;
  }

  .property-title {
    font-size: 3rem;
    font-weight: bold;
    color: black;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .portal-buttons {
    width: 100%;
    max-width: 400px;
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .portal-button {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 12px;
    border: 2px solid black;
    border-radius: 8px;
    font-size: 1.2rem;
    font-weight: 600;
    cursor: pointer;
    background: #F9F9F9;
    transition: background 0.3s;
  }

  .portal-button:hover {
    background: #EAEAEA;
  }

  .icon {
    margin-right: 12px;
    font-size: 1.5rem;
    color: #0d4727;
  }

  @media (max-width: 600px) {
    .property-title {
      font-size: 2.2rem;
    }

    .portal-title {
      font-size: 1.5rem;
    }

    .portal-buttons {
      max-width: 100%;
      padding: 1rem;
    }

    .portal-button {
      font-size: 1rem;
      padding: 10px;
    }

    .portal-button a {
  text-decoration: none !important; /* ✅ Forces removal of underline */
  color: inherit !important; /* ✅ Ensures it matches the button text color */
  font-weight: inherit;
  display: flex;
  align-items: center;
  justify-content: center; /* ✅ Centers text inside button */
  width: 100%;
  height: 100%;
}
.portal-button a:hover {
  color: black; /* Prevents color change on hover */
  text-decoration: none; /* Ensures no underline appears */
}

  }
</style>

<div class="portal-container">
  <!-- 📌 Menu Button -->
  <div class="menu-button" on:click={toggleDropdown}>☰</div>

  <!-- 🔽 Dropdown Menu -->
  <div class="dropdown-menu { $showDropdown ? 'show' : '' }">
    <div class="dropdown-item">📜 Transaction History</div>
  </div>


  <!-- 🏢 Property Name -->
  <h2 class="property-title">The Magellan</h2>

  <!-- 🔘 Portal Options -->
  <div class="portal-buttons">
    <button class="portal-button">
      📜 Lease Agreement
    </button>
    <button class="portal-button">
        <a href="#/payment-page">
   💳 Payment & Billing
        </a>
    </button>
    <button class="portal-button">
      🛠 Maintenance Requests
    </button>
    <button class="portal-button">
      📩 Contact Management
    </button>
  </div>
</div>
