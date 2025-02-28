<script>
  import { fade } from "svelte/transition";

  let amount = "";
  let recipient = "The Magellan (Landlord)";
  let paymentMethod = "ACH Transfer";
  let showDropdown = false;
  
  const chargeAmount = 5000; // Set predefined charge

  function handleAmountChange(event) {
    let rawValue = event.target.value.replace(/,/g, "");
    amount = isNaN(rawValue) || rawValue === "" ? "" : parseFloat(rawValue).toLocaleString("en-US");
  }

  function toggleDropdown() {
    showDropdown = !showDropdown;
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
        <button class="dropdown-item">📜 Transaction History</button>
      </div>
    {/if}
  </div>

  <!-- 🏠 App Title -->
  
  <div class="form-container">
    
    <!-- 💰 Amount Input -->
     <div class="amount-box">
      <h3>Rent Amount</h3>
      <span class="amount-display">${chargeAmount.toLocaleString("en-US")}</span>
    </div>
    
    <!-- 📌 Recipient Selection -->
    <label class="label">Pay To</label>
    <select bind:value={recipient} class="dropdown">
      <option value="The Magellan (Landlord)">The Magellan (Landlord)</option>
      <option value="Cupcake Moving">Cupcake Moving</option>
    </select>
    
    <!-- 💳 Payment Method Selection -->
    <label class="label">Payment Method</label>
    <select bind:value={paymentMethod} class="dropdown">
      <option value="ACH Transfer">ACH Transfer</option>
      <option value="Bilt Card">Bilt Card</option>
      <option value="Zelle">Zelle</option>
    </select>
    
    <!-- 🟢 Pay Now Button -->
    <button class="pay-now">
      Pay Now
    </button>
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
    padding: 1.5rem;
    background-color: #FBF7F0; /* Ensuring exact match */
  }

  .app-title {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }

  /* 🔘 Form Container */
  .form-container {
    width: 100%;
    max-width: 400px;
    padding: 2rem;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* 💰 Amount Input */
  .amount-box {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .amount-input {
    width: 100%;
    font-size: 3.5rem;
    text-align: center;
    border: none;
    outline: none;
    background: transparent;
  }

  /* 📌 Labels & Dropdowns */
  .label {
    font-size: 1rem;
    font-weight: bold;
    color: black;
  }

  .dropdown {
    width: 100%;
    padding: 1rem;
    border: 2px solid black;
    border-radius: 8px;
    font-size: 1.2rem;
    font-weight: 600;
    cursor: pointer;
    background: #F9F9F9;
    transition: background 0.3s;
  }

  .dropdown:hover {
    background: #EAEAEA;
  }

  /* 🟢 Pay Now Button */
  .pay-now {
    width: 100%;
    background-color: #0a3d3f;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.3s;
  }

  .pay-now:hover {
    background-color: #062c2d;
  }
   .amount-display {
    font-size: 3.5rem;
    font-weight: bold;
    text-align: center;
    display: block;
    color: black;
  }

  /* 📌 Menu Button (TOP RIGHT) */
  .menu-wrapper {
    position: absolute;
    top: 2rem; /* Lowering it slightly */
    right: 1rem; /* Moving it to the right */
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

  .menu-button:hover {
    background: #333;
  }

  /* 🔽 Dropdown */
  .dropdown-menu {
    position: absolute;
    top: 3.5rem;
    right: 0; /* Adjusted to keep it aligned */
    width: 180px;
    background: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 6px;
    display: flex;
    flex-direction: column;
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

</style>
