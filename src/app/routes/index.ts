import { Router } from "express";
import { UserRoutes } from "../module/user/user.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { VendorProfileRoutes } from "../module/venderProfile/vendorProfile.route";
import { ProduceRoutes } from "../module/produce/produce.route";
import { RentalSpaceRoutes } from "../module/rentalSpace/rentalSpace.route";
import { OrderRoutes } from "../module/order/order.route";
import { CommunityPostRoutes } from "../module/communityPost/communityPost.route";
import { SustainabilityCertRoutes } from "../module/sustainabilityCert/sustainabilityCert.route";

export const router: Router = Router();

interface IModuleRoute {
  path: string;
  route: Router;
}

const modulesRoutes: IModuleRoute[] = [
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  { path: "/vendors", route: VendorProfileRoutes },
  { path: "/produce", route: ProduceRoutes },
  { path: "/rental-spaces", route: RentalSpaceRoutes },
  { path: "/orders", route: OrderRoutes },
  { path: "/community", route: CommunityPostRoutes },
  { path: "/certifications", route: SustainabilityCertRoutes },
];

modulesRoutes.forEach((route) => router.use(route.path, route.route));
