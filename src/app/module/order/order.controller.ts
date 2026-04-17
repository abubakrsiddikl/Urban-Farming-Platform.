import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { OrderServices } from "./order.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import pick from "../../utils/pick";

// ─── Create Order ─────────────────────────────────────────────
const createOrder = catchAsync(async (req: Request, res: Response) => {
  // Customer places an order for a produce item
  const result = await OrderServices.createOrder(req.user?.id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order placed successfully",
    data: result,
  });
});

// ─── Get All Orders (Admin) ───────────────────────────────────
const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  // Admin can filter by status, userId, vendorId
  const filters = pick(req.query, ["searchTerm", "status", "userId", "vendorId"]);

  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await OrderServices.getAllOrders(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders fetched successfully",
    data: result,
  });
});

// ─── Get My Orders (Customer) ─────────────────────────────────
const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["status"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await OrderServices.getMyOrders(
    req.user?.id as string,
    filters,
    options
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My orders fetched successfully",
    data: result,
  });
});

// ─── Get Vendor Orders (for vendor to see their incoming orders) ──
const getVendorOrders = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["status"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await OrderServices.getVendorOrders(
    req.user?.id as string,
    filters,
    options
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Vendor orders fetched successfully",
    data: result,
  });
});

// ─── Get Single Order ─────────────────────────────────────────
const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderServices.getOrderById(
    req.params.id as string,
    req.user?.id as string,
    req.user?.role as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order fetched successfully",
    data: result,
  });
});

// ─── Update Order Status ──────────────────────────────────────
const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  // Vendor updates status (e.g., PROCESSING, SHIPPED); Admin can update any status
  const result = await OrderServices.updateOrderStatus(
    req.params.id as string,
    req.body.status,
    req.user?.id as string,
    req.user?.role as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order status updated successfully",
    data: result,
  });
});

// ─── Cancel Order (Customer) ──────────────────────────────────
const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderServices.cancelOrder(
    req.params.id as string,
    req.user?.id as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order cancelled successfully",
    data: result,
  });
});

export const OrderControllers = {
  createOrder,
  getAllOrders,
  getMyOrders,
  getVendorOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
