import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { VendorProfileRoutes } from "../modules/vendorProfile/vendorProfile.route";
import { ProduceRoutes } from "../modules/produce/produce.route";
import { RentalSpaceRoutes } from "../modules/rentalSpace/rentalSpace.route";
import { OrderRoutes } from "../modules/order/order.route";
import { CommunityPostRoutes } from "../modules/communityPost/communityPost.route";
import { SustainabilityCertRoutes } from "../modules/sustainabilityCert/sustainabilityCert.route";

const router = Router();

// ─── All Module Routes ────────────────────────────────────────
const moduleRoutes = [
  { path: "/users", route: UserRoutes },
  { path: "/vendors", route: VendorProfileRoutes },
  { path: "/produce", route: ProduceRoutes },
  { path: "/rental-spaces", route: RentalSpaceRoutes },
  { path: "/orders", route: OrderRoutes },
  { path: "/community", route: CommunityPostRoutes },
  { path: "/certifications", route: SustainabilityCertRoutes },
];

// Register all routes dynamically
moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;
