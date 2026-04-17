import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { ProduceServices } from "./produce.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import pick from "../../utils/pick";

// ─── Create Produce ───────────────────────────────────────────
const createProduce = catchAsync(async (req: Request, res: Response) => {
  // Vendor creates produce linked to their own vendor profile
  const result = await ProduceServices.createProduce(req.user?.id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Produce created successfully",
    data: result,
  });
});

// ─── Get All Produce ──────────────────────────────────────────
const getAllProduce = catchAsync(async (req: Request, res: Response) => {
  // Filter by name, category, certificationStatus
  const filters = pick(req.query, ["searchTerm", "category", "certificationStatus"]);

  // Pagination and sorting options
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await ProduceServices.getAllProduce(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Produce fetched successfully",
    data: result,
  });
});

// ─── Get Single Produce ───────────────────────────────────────
const getProduceById = catchAsync(async (req: Request, res: Response) => {
  const result = await ProduceServices.getProduceById(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Produce fetched successfully",
    data: result,
  });
});

// ─── Get My Produce (vendor's own listings) ───────────────────
const getMyProduce = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await ProduceServices.getMyProduce(req.user?.id as string, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My produce fetched successfully",
    data: result,
  });
});

// ─── Update Produce ───────────────────────────────────────────
const updateProduce = catchAsync(async (req: Request, res: Response) => {
  const result = await ProduceServices.updateProduce(
    req.params.id as string,
    req.body,
    req.user?.id as string,
    req.user?.role as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Produce updated successfully",
    data: result,
  });
});

// ─── Delete Produce ───────────────────────────────────────────
const deleteProduce = catchAsync(async (req: Request, res: Response) => {
  const result = await ProduceServices.deleteProduce(
    req.params.id as string,
    req.user?.id as string,
    req.user?.role as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Produce deleted successfully",
    data: result,
  });
});

export const ProduceControllers = {
  createProduce,
  getAllProduce,
  getProduceById,
  getMyProduce,
  updateProduce,
  deleteProduce,
};
