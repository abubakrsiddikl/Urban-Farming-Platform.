import { prisma } from "../../utils/prisma";
import { paginationHelper, type IOptions } from "../../helper/paginationHelper";

import httpStatus from "http-status-codes";
import AppError from "../../errorHelper/AppError";

// ─── Order Status Constants ───────────────────────────────────
const ORDER_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

// ─── Create Order ─────────────────────────────────────────────
const createOrder = async (userId: string, data: { produceId: string; quantity?: number }) => {
  const { produceId, quantity = 1 } = data;

  // Check if produce exists and has enough stock
  const produce = await prisma.produce.findUniqueOrThrow({ where: { id: produceId } });

  if (produce.availableQuantity < quantity) {
    throw new AppError(httpStatus.BAD_REQUEST, "Insufficient stock for the requested quantity");
  }

  // Use a transaction to create order and decrement stock atomically
  const order = await prisma.$transaction(async (tx) => {
    // Decrement stock
    await tx.produce.update({
      where: { id: produceId },
      data: { availableQuantity: { decrement: quantity } },
    });

    // Create the order
    const newOrder = await tx.order.create({
      data: {
        userId,
        produceId,
        vendorId: produce.vendorId,
        status: ORDER_STATUS.PENDING,
      },
      include: {
        produce: { select: { name: true, price: true } },
        vendor: { select: { farmName: true } },
        user: { omit: { password: true } },
      },
    });

    return newOrder;
  });

  return order;
};

// ─── Get All Orders (Admin) ───────────────────────────────────
const getAllOrders = async (filters: any, options: IOptions) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { status, userId, vendorId } = filters;

  const andConditions: any[] = [];

  // Filter by status
  if (status) andConditions.push({ status: { equals: status } });

  // Filter by specific user
  if (userId) andConditions.push({ userId: { equals: userId } });

  // Filter by specific vendor
  if (vendorId) andConditions.push({ vendorId: { equals: vendorId } });

  const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};

  const orders = await prisma.order.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { [sortBy || "orderDate"]: sortOrder || "desc" },
    include: {
      user: { omit: { password: true } },
      produce: { select: { name: true, price: true, category: true } },
      vendor: { select: { farmName: true } },
    },
  });

  const total = await prisma.order.count({ where: whereConditions });

  return {
    meta: { total, page, limit },
    data: orders,
  };
};

// ─── Get My Orders (Customer) ─────────────────────────────────
const getMyOrders = async (userId: string, filters: any, options: IOptions) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const whereConditions: any = { userId };

  // Optionally filter by status
  if (filters.status) whereConditions.status = filters.status;

  const orders = await prisma.order.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { [sortBy || "orderDate"]: sortOrder || "desc" },
    include: {
      produce: { select: { name: true, price: true, category: true } },
      vendor: { select: { farmName: true, farmLocation: true } },
    },
  });

  const total = await prisma.order.count({ where: whereConditions });

  return {
    meta: { total, page, limit },
    data: orders,
  };
};

// ─── Get Vendor Orders ────────────────────────────────────────
const getVendorOrders = async (userId: string, filters: any, options: IOptions) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  // Find vendor profile by userId
  const vendorProfile = await prisma.vendorProfile.findFirst({ where: { userId } });

  if (!vendorProfile) {
    throw new AppError(httpStatus.NOT_FOUND, "Vendor profile not found");
  }

  const whereConditions: any = { vendorId: vendorProfile.id };

  // Optionally filter by status
  if (filters.status) whereConditions.status = filters.status;

  const orders = await prisma.order.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { [sortBy || "orderDate"]: sortOrder || "desc" },
    include: {
      user: { omit: { password: true } },
      produce: { select: { name: true, price: true } },
    },
  });

  const total = await prisma.order.count({ where: whereConditions });

  return {
    meta: { total, page, limit },
    data: orders,
  };
};

// ─── Get Single Order by ID ───────────────────────────────────
const getOrderById = async (id: string, userId: string, role: string) => {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id },
    include: {
      user: { omit: { password: true } },
      produce: true,
      vendor: true,
    },
  });

  // Admin can see any order; customer can see only their own; vendor can see their orders
  if (role === "CUSTOMER" && order.userId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to view this order");
  }

  if (role === "VENDOR") {
    const vendorProfile = await prisma.vendorProfile.findFirst({ where: { userId } });

    if (!vendorProfile || vendorProfile.id !== order.vendorId) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to view this order");
    }
  }

  return order;
};

// ─── Update Order Status ──────────────────────────────────────
const updateOrderStatus = async (
  id: string,
  status: string,
  userId: string,
  role: string
) => {
  const order = await prisma.order.findUniqueOrThrow({ where: { id } });

  // Vendor can only update their own orders
  if (role === "VENDOR") {
    const vendorProfile = await prisma.vendorProfile.findFirst({ where: { userId } });

    if (!vendorProfile || vendorProfile.id !== order.vendorId) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update this order");
    }

    // Vendors cannot set status back to PENDING or cancel orders
    const allowedVendorStatuses = ["PROCESSING", "SHIPPED", "DELIVERED"];
    if (!allowedVendorStatuses.includes(status)) {
      throw new AppError(httpStatus.BAD_REQUEST, "Vendors can only set status to PROCESSING, SHIPPED, or DELIVERED");
    }
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      produce: { select: { name: true } },
      vendor: { select: { farmName: true } },
    },
  });

  return updated;
};

// ─── Cancel Order (Customer) ──────────────────────────────────
const cancelOrder = async (id: string, userId: string) => {
  const order = await prisma.order.findUniqueOrThrow({ where: { id } });

  // Only the customer who placed the order can cancel it
  if (order.userId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to cancel this order");
  }

  // Cannot cancel an already delivered or shipped order
  if (["DELIVERED", "SHIPPED"].includes(order.status)) {
    throw new AppError(httpStatus.BAD_REQUEST, `Cannot cancel an order with status: ${order.status}`);
  }

  // Restore produce stock on cancellation
  const cancelled = await prisma.$transaction(async (tx) => {
    await tx.produce.update({
      where: { id: order.produceId },
      data: { availableQuantity: { increment: 1 } },
    });

    return tx.order.update({
      where: { id },
      data: { status: ORDER_STATUS.CANCELLED },
    });
  });

  return cancelled;
};

export const OrderServices = {
  createOrder,
  getAllOrders,
  getMyOrders,
  getVendorOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
