<script>


  let services = [
    { id: 1, name: "Cupcake Moving Co.", price: "$500", rating: "4.8" },
    { id: 2, name: "Swift Movers", price: "$650", rating: "4.5" },
    { id: 3, name: "Rapid Relocation", price: "$700", rating: "4.7" },
    { id: 4, name: "Heavy Lifter Haulers", price: "$550", rating: "4.6" },
    { id: 5, name: "Elite Moving Team", price: "$800", rating: "4.9" },
    { id: 6, name: "Smooth Transition Movers", price: "$600", rating: "4.4" }
  ];
</script>

<div class="moving-container">
  <!-- Menu Button -->

  <!-- Glide Logo -->

  <!-- Page Title -->
  <h2 class="page-title">Moving Services</h2>

  <!-- Services Grid -->
  <div class="services-grid">
    {#each services as service}
      <div class="service-card">
        <span class="rating">⭐ {service.rating} / 5.0</span>
        <h3 class="service-name">{service.name}</h3>
        <p class="service-price">{service.price}</p>
        <button class="book-button">
  Book Now 🚛 <!-- Truck emoji -->
</button>
      </div>
    {/each}
  </div>
</div>

<style>
  /* ✅ Global Layout */
  .moving-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #FBF7F0;
    padding: 2rem;
    font-family: 'Editorial New', serif;
  }

  /* ✅ Menu Button */
  .menu-button {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
  }

  .circle-button {
    width: 3.5rem;
    height: 3.5rem;
    background: black;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .circle-button:hover {
    background: #333;
  }

  .icon {
    color: white;
    font-size: 1.8rem;
  }

  /* ✅ Typography */
  .logo {
    position: absolute;
    top: 1.5rem;
    left: 1.5rem;
    font-size: 2rem;
    font-weight: bold;
    color: black;
  }

  .page-title {
    font-size: 3rem;
    font-weight: bold;
    margin-bottom: 2rem;
    color: black;
  }

  /* ✅ Services Grid */
  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    width: 100%;
    max-width: 800px;
  }

  /* ✅ Service Cards */
  .service-card {
    background: white;
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid #ddd;
    position: relative;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .service-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }

  .rating {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1rem;
    font-weight: bold;
    color: black;
  }

  .service-name {
    font-size: 1.5rem;
    font-weight: bold;
    color: black;
    margin-bottom: 0.5rem;
  }

  .service-price {
    font-size: 1.3rem;
    font-weight: bold;
    color: black;
  }

  /* ✅ Book Now Button */
  .book-button {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    display: flex;
    align-items: center;
    background: #0d4727;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: background 0.3s;
    font-size: 0.9rem;
  }

  .book-button:hover {
    background: #08361f;
  }

  @media (max-width: 600px) {
    .services-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
