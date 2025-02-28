import BuildingDashboard from "./src/routes/BuildingDashboard.svelte";
import RenterPortal from "./src/routes/RenterPortal.svelte";
import MovingServices from "./src/routes/MovingServices.svelte";

const routes = {
  "/building-dashboard": BuildingDashboard,
  "/moving-services": MovingServices,
  "/renter-portal": RenterPortal
};

export default routes;
