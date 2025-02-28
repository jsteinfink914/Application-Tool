import BuildingDashboard from "./src/routes/BuildingDashboard.svelte";
import RenterPortal from "./src/routes/RenterPortal.svelte";
import MovingServices from "./src/routes/MovingServices.svelte";
import PaymentPage from "./src/routes/PaymentPage.svelte";

const routes = {
  "/building-dashboard": BuildingDashboard,
  "/moving-services": MovingServices,
  "/renter-portal": RenterPortal,
  "/payment-page": PaymentPage
};

export default routes;
