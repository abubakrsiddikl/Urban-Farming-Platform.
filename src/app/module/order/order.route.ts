import { Router } from "express";
import { OrderControllers } from "./order.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRole } from "@prisma/client";

const router = Router();

// Admin: Get all orders with filters and pagination
router.get(
  "/",
  checkAuth(UserRole.ADMIN),
  OrderControllers.getAllOrders
);

// Customer: Get own orders
router.get(
  "/my/orders",
  checkAuth(UserRole.CUSTOMER),
  OrderControllers.getMyOrders
);

// Vendor: Get incoming orders for their produce
router.get(
  "/vendor/orders",
  checkAuth(UserRole.VENDOR),
  OrderControllers.getVendorOrders
);

// All roles: Get single order by ID (authorization checked in service)
router.get(
  "/:id",
  checkAuth(...Object.values(UserRole)),
  OrderControllers.getOrderById
);

// Customer: Place a new order
router.post(
  "/",
  checkAuth(UserRole.CUSTOMER),
  OrderControllers.createOrder
);

// Vendor / Admin: Update order status
router.patch(
  "/:id/status",
  checkAuth(UserRole.ADMIN, UserRole.VENDOR),
  OrderControllers.updateOrderStatus
);

// Customer: Cancel own order
router.patch(
  "/:id/cancel",
  checkAuth(UserRole.CUSTOMER),
  OrderControllers.cancelOrder
);

export const OrderRoutes: Router = router;
