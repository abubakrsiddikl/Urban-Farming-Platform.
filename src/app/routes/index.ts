import { Router } from "express";
import { UserRoutes } from "../module/user/user.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { VendorProfileRoutes } from "../module/venderProfile/vendorProfile.route";

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
];

modulesRoutes.forEach((route) => router.use(route.path, route.route));
