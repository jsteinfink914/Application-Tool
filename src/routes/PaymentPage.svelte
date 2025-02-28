<script>
  import { onMount } from "svelte";

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
      {#if showDropdown}
        <div class="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-lg">
          <button class="block w-full text-left px-4 py-2 hover:bg-gray-100">Transaction History</button>
        </div>
      {/if}
    </div>
  </div>

  
  <div class="w-full max-w-md bg-transparent p-6 rounded-lg">
    
    <!-- 💰 Amount Input -->
    <div class="text-6xl font-bold text-center mb-6 flex items-center justify-center">
      <input 
        type="text" inputMode="decimal" pattern="[0-9]*" 
        placeholder="0.00" 
        bind:value={amount} 
        on:input={handleAmountChange}
        class="bg-transparent text-center text-6xl font-bold text-black focus:outline-none w-auto"
      />
    </div>
    
    <!-- 📌 Recipient Selection -->
    <label class="block text-lg font-bold text-black mb-2">Pay To</label>
    <select bind:value={recipient} class="w-full p-4 border rounded-lg mb-4 focus:ring-2 focus:ring-green-900 focus:outline-none bg-gray-100 hover:bg-gray-200 transition-all duration-300 text-lg font-semibold text-black shadow-md">
      <option value="The Magellan (Landlord)">The Magellan (Landlord)</option>
      <option value="Cupcake Moving">Cupcake Moving</option>
    </select>
    
    <!-- 💳 Payment Method Selection -->
    <label class="block text-lg font-bold text-black mb-2">Payment Method</label>
    <select bind:value={paymentMethod} class="w-full p-4 border rounded-lg mb-4 focus:ring-2 focus:ring-green-900 focus:outline-none bg-gray-100 hover:bg-gray-200 transition-all duration-300 text-lg font-semibold text-black shadow-md">
      <option value="ACH Transfer">ACH Transfer</option>
      <option value="Bilt Card">Bilt Card</option>
      <option value="Zelle">Zelle</option>
    </select>
    
    <!-- 🟢 Pay Now Button -->
    <button class="w-full bg-green-950 text-white py-3 rounded-lg hover:bg-green-900 transition-all duration-300">
      Pay Now
    </button>
  </div>
</div>
