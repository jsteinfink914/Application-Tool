<script>
  let amount = "";
  let recipient = "The Magellan (Landlord)";
  let paymentMethod = "ACH Transfer";
  let showDropdown = false;

  function handleAmountChange(event) {
    let rawValue = event.target.value.replace(/,/g, "");
    amount = isNaN(rawValue) || rawValue === "" ? "" : parseFloat(rawValue).toLocaleString("en-US");
  }

  function toggleDropdown() {
    showDropdown = !showDropdown;
  }
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-[#FBF7F0] px-6" style="font-family: 'Editorial New, serif'">
  
  <!-- 📌 Menu Button -->
  <div class="absolute top-4 left-4">
    <div class="relative group">
      <button class="menu-button" on:click={toggleDropdown}>
        ☰
      </button>

      {#if showDropdown}
        <div class="dropdown-menu">
          <button class="dropdown-item">Transaction History</button>
        </div>
      {/if}
    </div>
  </div>

  <h2 class="text-4xl font-bold mb-6">glide</h2>
  
  <div class="w-full max-w-md bg-transparent p-6 rounded-lg">
    
    <!-- 💰 Amount Input -->
    <div class="text-6xl font-bold text-center mb-6 flex items-center justify-center">
      <input 
        type="text" inputMode="decimal" pattern="[0-9]*" 
        placeholder="0.00" 
        bind:value={amount} 
        on:input={handleAmountChange}
        class="amount-input"
      />
    </div>
    
    <!-- 📌 Recipient Selection -->
    <label class="input-label">Pay To</label>
    <select bind:value={recipient} class="input-select">
      <option value="The Magellan (Landlord)">The Magellan (Landlord)</option>
      <option value="Cupcake Moving">Cupcake Moving</option>
    </select>
    
    <!-- 💳 Payment Method Selection -->
    <label class="input-label">Payment Method</label>
    <select bind:value={paymentMethod} class="input-select">
      <option value="ACH Transfer">ACH Transfer</option>
      <option value="Bilt Card">Bilt Card</option>
      <option value="Zelle">Zelle</option>
    </select>
    
    <!-- 🟢 Pay Now Button -->
    <button class="pay-button">
      Pay Now
    </button>
  </div>
</div>

<style>
  /* Menu Button */
  .menu-button {
    width: 3rem;
    height: 3rem;
    background: black;
    color: white;
    font-size: 1.5rem;
    font-weight: bold;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .menu-button:hover {
    background: #333;
  }

  /* Dropdown Menu */
  .dropdown-menu {
    position: absolute;
    top: 3.5rem;
    left: 0;
    width: 180px;
    background: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    padding: 5px 0;
  }

  .dropdown-item {
    padding: 10px;
    text-align: left;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    border: none;
    background: white;
    width: 100%;
    text-align: left;
  }

  .dropdown-item:hover {
    background: #f1f1f1;
  }

  /* Input Fields */
  .input-label {
    display: block;
    font-size: 1.1rem;
    font-weight: bold;
    color: black;
    margin-bottom: 5px;
  }

  .input-select {
    width: 100%;
    padding: 12px;
    border: 2px solid #ccc;
    border-radius: 8px;
    font-size: 1.1rem;
    background: #f9f9f9;
    transition: background 0.3s, border 0.3s;
  }

  .input-select:hover {
    background: #eaeaea;
  }

  /* Amount Input */
  .amount-input {
    background: transparent;
    text-align: center;
    font-size: 3rem;
    font-weight: bold;
    color: black;
    border: none;
    outline: none;
    width: 100%;
  }

  /* Pay Button */
  .pay-button {
    width: 100%;
    background: #0d4727;
    color: white;
    font-size: 1.2rem;
    font-weight: bold;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .pay-button:hover {
    background: #06391b;
  }

  /* Responsive Design */
  @media (max-width: 600px) {
    .amount-input {
      font-size: 2.5rem;
    }

    .input-label {
      font-size: 1rem;
    }

    .input-select {
      font-size: 1rem;
    }

    .pay-button {
      font-size: 1rem;
    }
  }
</style>
