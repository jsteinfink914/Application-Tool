<script>
  import { onMount } from "svelte";

  let amount = "";
  let recipient = "The Magellan (Landlord)";
  let paymentMethod = "ACH Transfer";

  function handleAmountChange(event) {
    let rawValue = event.target.value.replace(/,/g, "");
    amount = isNaN(rawValue) || rawValue === "" ? "" : parseFloat(rawValue).toLocaleString("en-US");
  }
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-[#FBF7F0] px-6" style="font-family: 'Editorial New, serif'">
  <h2 class="text-4xl font-bold mb-6">glide</h2>

  <div class="w-full max-w-md bg-transparent p-6 rounded-lg">
    <div class="text-6xl font-bold text-center mb-6 flex items-center justify-center">
      <input 
        type="text" inputMode="decimal" pattern="[0-9]*" 
        placeholder="0.00" 
        bind:value={amount} 
        on:input={handleAmountChange}
        class="bg-transparent text-center text-6xl font-bold text-black focus:outline-none w-auto"
      />
    </div>

    <!-- Recipient Selection -->
    <label class="block text-lg font-bold text-black mb-2">Pay To</label>
    <select bind:value={recipient} class="w-full p-4 border rounded-lg mb-4 bg-gray-100 hover:bg-gray-200 transition-all duration-300 text-lg font-semibold text-black shadow-md">
      <option value="The Magellan (Landlord)">The Magellan (Landlord)</option>
      <option value="Cupcake Moving">Cupcake Moving</option>
    </select>

    <!-- Payment Method Selection -->
    <label class="block text-lg font-bold text-black mb-2">Payment Method</label>
    <select bind:value={paymentMethod} class="w-full p-4 border rounded-lg mb-4 bg-gray-100 hover:bg-gray-200 transition-all duration-300 text-lg font-semibold text-black shadow-md">
      <option value="ACH Transfer">ACH Transfer</option>
      <option value="Bilt Card">Bilt Card</option>
      <option value="Zelle">Zelle</option>
    </select>

    <!-- Pay Now Button -->
    <button class="w-full bg-green-950 text-white py-3 rounded-lg hover:bg-green-900 transition-all duration-300">
      Pay Now
    </button>
  </div>
</div>
