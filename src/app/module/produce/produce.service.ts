import { prisma } from "../../utils/prisma";
import { paginationHelper, type IOptions } from "../../helper/paginationHelper";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelper/AppError";

// ─── Create Produce ───────────────────────────────────────────
const createProduce = async (userId: string, data: any) => {
  // Find vendor profile by userId to get vendorId
  const vendorProfile = await prisma.vendorProfile.findFirst({
    where: { userId },
  });

  if (!vendorProfile) {
    throw new AppError(httpStatus.NOT_FOUND, "Vendor profile not found. Please create a vendor profile first.");
  }

  // Only approved vendors can list produce
  if (vendorProfile.certificationStatus !== "APPROVED") {
    throw new AppError(httpStatus.FORBIDDEN, "Your vendor profile must be approved before listing produce.");
  }

  const produce = await prisma.produce.create({
    data: {
      ...data,
      vendorId: vendorProfile.id,
    },
    include: { vendor: true },
  });

  return produce;
};

// ─── Get All Produce ──────────────────────────────────────────
const getAllProduce = async (filters: any, options: IOptions) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, ...filterData } = filters;

  const andConditions: any[] = [];

  // Search by produce name or description
  if (searchTerm) {
    andConditions.push({
      OR: ["name", "description", "category"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // Filter by category, certificationStatus
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: (filterData as any)[key] },
      })),
    });
  }

  // Show only produce with stock available by default
  andConditions.push({ availableQuantity: { gt: 0 } });

  const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};

  const produceList = await prisma.produce.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { [sortBy || "name"]: sortOrder || "asc" },
    include: {
      vendor: {
        select: { farmName: true, farmLocation: true, certificationStatus: true },
      },
    },
  });

  const total = await prisma.produce.count({ where: whereConditions });

  return {
    meta: { total, page, limit },
    data: produceList,
  };
};

// ─── Get Single Produce by ID ──────────────────────────────────
const getProduceById = async (id: string) => {
  const produce = await prisma.produce.findUniqueOrThrow({
    where: { id },
    include: {
      vendor: {
        select: { farmName: true, farmLocation: true, certificationStatus: true },
      },
    },
  });

  return produce;
};

// ─── Get My Produce (vendor's own listings) ───────────────────
const getMyProduce = async (userId: string, options: IOptions) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  // Find vendor profile by userId
  const vendorProfile = await prisma.vendorProfile.findFirst({ where: { userId } });

  if (!vendorProfile) {
    throw new AppError(httpStatus.NOT_FOUND, "Vendor profile not found");
  }

  const produceList = await prisma.produce.findMany({
    where: { vendorId: vendorProfile.id },
    skip,
    take: limit,
    orderBy: { [sortBy || "name"]: sortOrder || "asc" },
  });

  const total = await prisma.produce.count({ where: { vendorId: vendorProfile.id } });

  return {
    meta: { total, page, limit },
    data: produceList,
  };
};

// ─── Update Produce ───────────────────────────────────────────
const updateProduce = async (
  id: string,
  data: any,
  userId: string,
  role: string
) => {
  const produce = await prisma.produce.findUniqueOrThrow({ where: { id } });

  // Only admin or the vendor who owns this produce can update
  if (role !== "ADMIN") {
    const vendorProfile = await prisma.vendorProfile.findFirst({ where: { userId } });

    if (!vendorProfile || vendorProfile.id !== produce.vendorId) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update this produce");
    }
  }

  const updated = await prisma.produce.update({
    where: { id },
    data,
    include: { vendor: true },
  });

  return updated;
};

// ─── Delete Produce ───────────────────────────────────────────
const deleteProduce = async (id: string, userId: string, role: string) => {
  const produce = await prisma.produce.findUniqueOrThrow({ where: { id } });

  // Only admin or the owning vendor can delete
  if (role !== "ADMIN") {
    const vendorProfile = await prisma.vendorProfile.findFirst({ where: { userId } });

    if (!vendorProfile || vendorProfile.id !== produce.vendorId) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to delete this produce");
    }
  }

  const deleted = await prisma.produce.delete({ where: { id } });

  return deleted;
};

export const ProduceServices = {
  createProduce,
  getAllProduce,
  getProduceById,
  getMyProduce,
  updateProduce,
  deleteProduce,
};
