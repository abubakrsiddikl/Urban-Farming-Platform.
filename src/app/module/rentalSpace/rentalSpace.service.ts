import { prisma } from "../../utils/prisma";
import { paginationHelper, type IOptions } from "../../helper/paginationHelper";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelper/AppError";

// ─── Create Rental Space ──────────────────────────────────────
const createRentalSpace = async (userId: string, data: any) => {
  // Resolve the vendor profile from the logged-in user
  const vendorProfile = await prisma.vendorProfile.findFirst({ where: { userId } });

  if (!vendorProfile) {
    throw new AppError(httpStatus.NOT_FOUND, "Vendor profile not found. Please create a vendor profile first.");
  }

  if (vendorProfile.certificationStatus !== "APPROVED") {
    throw new AppError(httpStatus.FORBIDDEN, "Your vendor profile must be approved to list rental spaces.");
  }

  const rentalSpace = await prisma.rentalSpace.create({
    data: {
      ...data,
      vendorId: vendorProfile.id,
      availability: true, // Default to available when first created
    },
    include: {
      vendor: { select: { farmName: true, farmLocation: true } },
    },
  });

  return rentalSpace;
};

// ─── Get All Rental Spaces ────────────────────────────────────
const getAllRentalSpaces = async (filters: any, options: IOptions) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, availability, ...filterData } = filters;

  const andConditions: any[] = [];

  // Search by location or size
  if (searchTerm) {
    andConditions.push({
      OR: ["location", "size"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // Filter by availability (boolean field — convert string to boolean)
  if (availability !== undefined) {
    andConditions.push({
      availability: availability === "true",
    });
  }

  // Filter by size, location (exact match)
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: (filterData as any)[key] },
      })),
    });
  }

  const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};

  const rentalSpaces = await prisma.rentalSpace.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { [sortBy || "location"]: sortOrder || "asc" },
    include: {
      vendor: { select: { farmName: true, farmLocation: true } },
    },
  });

  const total = await prisma.rentalSpace.count({ where: whereConditions });

  return {
    meta: { total, page, limit },
    data: rentalSpaces,
  };
};

// ─── Get Single Rental Space ──────────────────────────────────
const getRentalSpaceById = async (id: string) => {
  const rentalSpace = await prisma.rentalSpace.findUniqueOrThrow({
    where: { id },
    include: {
      vendor: { select: { farmName: true, farmLocation: true, certificationStatus: true } },
    },
  });

  return rentalSpace;
};

// ─── Get My Rental Spaces ─────────────────────────────────────
const getMyRentalSpaces = async (userId: string, options: IOptions) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const vendorProfile = await prisma.vendorProfile.findFirst({ where: { userId } });

  if (!vendorProfile) {
    throw new AppError(httpStatus.NOT_FOUND, "Vendor profile not found");
  }

  const rentalSpaces = await prisma.rentalSpace.findMany({
    where: { vendorId: vendorProfile.id },
    skip,
    take: limit,
    orderBy: { [sortBy || "location"]: sortOrder || "asc" },
  });

  const total = await prisma.rentalSpace.count({ where: { vendorId: vendorProfile.id } });

  return {
    meta: { total, page, limit },
    data: rentalSpaces,
  };
};

// ─── Update Rental Space ──────────────────────────────────────
const updateRentalSpace = async (
  id: string,
  data: any,
  userId: string,
  role: string
) => {
  const rentalSpace = await prisma.rentalSpace.findUniqueOrThrow({ where: { id } });

  // Verify ownership if not admin
  if (role !== "ADMIN") {
    const vendorProfile = await prisma.vendorProfile.findFirst({ where: { userId } });

    if (!vendorProfile || vendorProfile.id !== rentalSpace.vendorId) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update this rental space");
    }
  }

  const updated = await prisma.rentalSpace.update({
    where: { id },
    data,
    include: {
      vendor: { select: { farmName: true } },
    },
  });

  return updated;
};

// ─── Delete Rental Space ──────────────────────────────────────
const deleteRentalSpace = async (id: string, userId: string, role: string) => {
  const rentalSpace = await prisma.rentalSpace.findUniqueOrThrow({ where: { id } });

  // Verify ownership if not admin
  if (role !== "ADMIN") {
    const vendorProfile = await prisma.vendorProfile.findFirst({ where: { userId } });

    if (!vendorProfile || vendorProfile.id !== rentalSpace.vendorId) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to delete this rental space");
    }
  }

  const deleted = await prisma.rentalSpace.delete({ where: { id } });

  return deleted;
};

export const RentalSpaceServices = {
  createRentalSpace,
  getAllRentalSpaces,
  getRentalSpaceById,
  getMyRentalSpaces,
  updateRentalSpace,
  deleteRentalSpace,
};
