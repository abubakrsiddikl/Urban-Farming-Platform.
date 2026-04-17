import { prisma } from "../../utils/prisma";
import { paginationHelper, type IOptions } from "../../helper/paginationHelper";

import httpStatus from "http-status-codes";
import AppError from "../../errorHelper/AppError";

// ─── Create Vendor Profile ────────────────────────────────────
const createVendorProfile = async (userId: string, data: any) => {
  // Check if vendor profile already exists for this user
  const existingProfile = await prisma.vendorProfile.findUnique({
    where: { userId },
  });

  if (existingProfile) {
    throw new AppError(httpStatus.CONFLICT, "Vendor profile already exists for this user");
  }

  // Create vendor profile linked to the authenticated user
  const vendorProfile = await prisma.vendorProfile.create({
    data: {
      ...data,
      userId,
      certificationStatus: "PENDING", // Default status before admin approval
    },
    include: {
      user: { omit: { password: true } },
    },
  });

  return vendorProfile;
};

// ─── Get All Vendor Profiles ──────────────────────────────────
const getAllVendorProfiles = async (filters: any, options: IOptions) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, ...filterData } = filters;

  const andConditions: any[] = [];

  
  // Search by farmName or farmLocation
  if (searchTerm) {
    andConditions.push({
      OR: ["farmName", "farmLocation"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // Filter by certificationStatus, farmLocation etc.
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: (filterData as any)[key] },
      })),
    });
  }

  const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};

  // Fetch vendor profiles with related user info
  const vendorProfiles = await prisma.vendorProfile.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { [sortBy || "farmName"]: sortOrder || "asc" },
    include: {
      user: { omit: { password: true } },
    },
  });
  // console.log(vendorProfiles)

  const total = await prisma.vendorProfile.count({ where: whereConditions });
 
  return {
    meta: { total, page, limit },
    data: vendorProfiles,
  };
};

// ─── Get Single Vendor Profile by ID ──────────────────────────
const getVendorProfileById = async (id: string) => {
  const vendorProfile = await prisma.vendorProfile.findUniqueOrThrow({
    where: { id },
    include: {
      user: { omit: { password: true } },
      produces: true,
      rentalSpaces: true,
      certs: true,
    },
  });

  return vendorProfile;
};

// ─── Get My Vendor Profile (by userId) ───────────────────────
const getMyVendorProfile = async (userId: string) => {
  const vendorProfile = await prisma.vendorProfile.findFirstOrThrow({
    where: { userId },
    include: {
      user: { omit: { password: true } },
      produces: true,
      rentalSpaces: true,
      certs: true,
    },
  });

  return vendorProfile;
};

// ─── Update Vendor Profile ────────────────────────────────────
const updateVendorProfile = async (
  id: string,
  data: any,
  requestingUserId: string,
  role: string
) => {
  // Find the vendor profile first to verify ownership
  const vendorProfile = await prisma.vendorProfile.findUniqueOrThrow({
    where: { id },
  });

  // Only admin or the profile owner can update
  if (role !== "ADMIN" && vendorProfile.userId !== requestingUserId) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update this profile");
  }

  // Prevent non-admin from changing certificationStatus directly
  if (role !== "ADMIN") {
    delete data.certificationStatus;
  }

  const updated = await prisma.vendorProfile.update({
    where: { id },
    data,
    include: { user: { omit: { password: true } } },
  });

  return updated;
};

// ─── Delete Vendor Profile ────────────────────────────────────
const deleteVendorProfile = async (id: string) => {
  // Ensure the profile exists before deleting
  await prisma.vendorProfile.findUniqueOrThrow({ where: { id } });

  const deleted = await prisma.vendorProfile.delete({ where: { id } });

  return deleted;
};

// ─── Approve Vendor (Admin sets certificationStatus = APPROVED) ──
const approveVendor = async (id: string) => {
  await prisma.vendorProfile.findUniqueOrThrow({ where: { id } });

  const approved = await prisma.vendorProfile.update({
    where: { id },
    data: { certificationStatus: "APPROVED" },
    include: { user: { omit: { password: true } } },
  });

  return approved;
};

export const VendorProfileServices = {
  createVendorProfile,
  getAllVendorProfiles,
  getVendorProfileById,
  getMyVendorProfile,
  updateVendorProfile,
  deleteVendorProfile,
  approveVendor,
};
