import { prisma } from "../../utils/prisma";
import { paginationHelper, type IOptions } from "../../helper/paginationHelper";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelper/AppError";

// ─── Submit Certification ─────────────────────────────────────
const createCert = async (
  userId: string,
  data: { certifyingAgency: string; certificationDate: string }
) => {
  // Find vendor profile by userId
  const vendorProfile = await prisma.vendorProfile.findFirst({ where: { userId } });

  if (!vendorProfile) {
    throw new AppError(httpStatus.NOT_FOUND, "Vendor profile not found. Please create a vendor profile first.");
  }

  const cert = await prisma.sustainabilityCert.create({
    data: {
      certifyingAgency: data.certifyingAgency,
      certificationDate: new Date(data.certificationDate),
      vendorId: vendorProfile.id,
    },
    include: {
      vendor: { select: { farmName: true, certificationStatus: true } },
    },
  });

  return cert;
};

// ─── Get All Certifications (Admin) ───────────────────────────
const getAllCerts = async (filters: any, options: IOptions) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, vendorId, ...filterData } = filters;

  const andConditions: any[] = [];

  // Search by certifying agency name
  if (searchTerm) {
    andConditions.push({
      certifyingAgency: {
        contains: searchTerm,
        mode: "insensitive",
      },
    });
  }

  // Filter by specific vendor
  if (vendorId) andConditions.push({ vendorId: { equals: vendorId } });

  // Other exact filters (certifyingAgency exact match)
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: (filterData as any)[key] },
      })),
    });
  }

  const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};

  const certs = await prisma.sustainabilityCert.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { [sortBy || "certificationDate"]: sortOrder || "desc" },
    include: {
      vendor: { select: { farmName: true, farmLocation: true, certificationStatus: true } },
    },
  });

  const total = await prisma.sustainabilityCert.count({ where: whereConditions });

  return {
    meta: { total, page, limit },
    data: certs,
  };
};

// ─── Get Single Certification ──────────────────────────────────
const getCertById = async (id: string) => {
  const cert = await prisma.sustainabilityCert.findUniqueOrThrow({
    where: { id },
    include: {
      vendor: { select: { farmName: true, farmLocation: true } },
    },
  });

  return cert;
};

// ─── Get My Certifications (by Vendor) ───────────────────────
const getMyCerts = async (userId: string, options: IOptions) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const vendorProfile = await prisma.vendorProfile.findFirst({ where: { userId } });

  if (!vendorProfile) {
    throw new AppError(httpStatus.NOT_FOUND, "Vendor profile not found");
  }

  const certs = await prisma.sustainabilityCert.findMany({
    where: { vendorId: vendorProfile.id },
    skip,
    take: limit,
    orderBy: { [sortBy || "certificationDate"]: sortOrder || "desc" },
  });

  const total = await prisma.sustainabilityCert.count({
    where: { vendorId: vendorProfile.id },
  });

  return {
    meta: { total, page, limit },
    data: certs,
  };
};

// ─── Update Certification ─────────────────────────────────────
const updateCert = async (
  id: string,
  data: any,
  userId: string,
  role: string
) => {
  const cert = await prisma.sustainabilityCert.findUniqueOrThrow({ where: { id } });

  // Only admin or the owning vendor can update
  if (role !== "ADMIN") {
    const vendorProfile = await prisma.vendorProfile.findFirst({ where: { userId } });

    if (!vendorProfile || vendorProfile.id !== cert.vendorId) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update this certification");
    }
  }

  // Convert date string to Date object if provided
  if (data.certificationDate) {
    data.certificationDate = new Date(data.certificationDate);
  }

  const updated = await prisma.sustainabilityCert.update({
    where: { id },
    data,
    include: {
      vendor: { select: { farmName: true } },
    },
  });

  return updated;
};

// ─── Delete Certification ─────────────────────────────────────
const deleteCert = async (id: string, userId: string, role: string) => {
  const cert = await prisma.sustainabilityCert.findUniqueOrThrow({ where: { id } });

  // Only admin or the owning vendor can delete
  if (role !== "ADMIN") {
    const vendorProfile = await prisma.vendorProfile.findFirst({ where: { userId } });

    if (!vendorProfile || vendorProfile.id !== cert.vendorId) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to delete this certification");
    }
  }

  const deleted = await prisma.sustainabilityCert.delete({ where: { id } });

  return deleted;
};

export const SustainabilityCertServices = {
  createCert,
  getAllCerts,
  getCertById,
  getMyCerts,
  updateCert,
  deleteCert,
};
