<script>
  import { FiMenu, FiAlertCircle, FiMessageSquare, FiCheckCircle } from "svelte-icons/fi";

  const units = [
    { id: 1, name: "Unit 101", status: "Current on Rent", maintenance: false, message: true },
    { id: 2, name: "Unit 202", status: "Late on Rent", maintenance: true, message: true },
    { id: 3, name: "Unit 303", status: "Current on Rent", maintenance: false, message: true },
    { id: 4, name: "Unit 404", status: "Late on Rent", maintenance: false, message: true },
    { id: 5, name: "Unit 505", status: "Current on Rent", maintenance: true, message: true },
    { id: 6, name: "Unit 606", status: "Current on Rent", maintenance: false, message: true },
  ];
</script>

<style>
  .dashboard-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #FBF7F0;
    padding: 2rem;
    font-family: 'Editorial New', serif;
  }

  .menu-button {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    background: black;
    border-radius: 50%;
    width: 3.5rem;
    height: 3.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    cursor: pointer;
  }

  .menu-button:hover {
    background: #333;
  }

  .dashboard-title {
    position: absolute;
    top: 1.5rem;
    left: 1.5rem;
    font-size: 2rem;
    font-weight: bold;
    color: black;
  }

  .property-title {
    font-size: 4rem;
    font-weight: bold;
    color: black;
    margin-bottom: 2rem;
  }

  .unit-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    max-width: 1000px;
    width: 100%;
  }

  .unit-card {
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    border: 1px solid #ddd;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .unit-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .status {
    font-size: 1.2rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;
  }

  .status .icon {
    margin-right: 0.5rem;
  }

  .maintenance {
    font-size: 1.2rem;
    font-weight: 500;
    color: orange;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .message-button {
    background: #0d4727;
    color: white;
    padding: 0.6rem 1rem;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
    margin-top: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s;
    width: 100%;
  }

  .message-button:hover {
    background: #08321d;
  }

  @media (max-width: 600px) {
    .property-title {
      font-size: 2rem;
    }

    .dashboard-title {
      font-size: 1.5rem;
    }
  }
</style>

<div class="dashboard-container">
  <!-- Menu Button -->
  <div class="menu-button">
    <FiMenu size={24} color="white" />
  </div>

  <!-- Dashboard Title -->
  <h2 class="dashboard-title">glide</h2>

  <!-- Property Name -->
  <h2 class="property-title">The Magellan</h2>

  <!-- Units Grid -->
  <div class="unit-grid">
    {#each units as unit}
      <div class="unit-card">
        <h3 class="text-2xl font-semibold text-black mb-2">{unit.name}</h3>

        <div class="status">
          {#if unit.status === "Current on Rent"}
            <FiCheckCircle class="icon text-green-600" size={20} />
          {:else}
            <FiAlertCircle class="icon text-red-600" size={20} />
          {/if}
          {unit.status}
        </div>

        {#if unit.maintenance}
          <div class="maintenance">
            <FiAlertCircle class="icon" size={20} /> Maintenance Request
          </div>
        {/if}

        {#if unit.message}
          <button class="message-button">
            Message Renter <FiMessageSquare class="ml-2" size={20} />
          </button>
        {/if}
      </div>
    {/each}
  </div>
</div>
