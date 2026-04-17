import type { Prisma } from "@prisma/client";
import { prisma } from "../../utils/prisma";
import bcrypt from "bcrypt";
import { paginationHelper, type IOptions } from "../../helper/paginationHelper";

//  Create User

const createUser = async (userData: Prisma.UserCreateInput) => {
  
  const hashPassword = await bcrypt.hash(userData.password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { ...userData, password: hashPassword },
    });

    return newUser;
  });

  return user;
};

//  Get All Users
const getAllUsers = async (
  filters: any,
  options: IOptions
) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, ...filterData } = filters;

  const andConditions: any[] = [];

  // 🔍 Search (name, email)
  if (searchTerm) {
    andConditions.push({
      OR: ["name", "email"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // 🎯 Filtering (role, status etc.)
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  // 🧠 Final where condition
  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // 🚀 Query
  const users = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    omit: { password: true },
  });

  // 📊 Total count
  const total = await prisma.user.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: users,
  };
};

//  Get Me
const getMyProfile = async (id: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    omit: { password: true },
  });

  return user;
};

//  Update User

const updateUser = async (
  id: string,
  userData: Prisma.UserUpdateInput,
  requestedByRole: string,
) => {
  if (userData.role && requestedByRole !== "ADMIN") {
    throw new Error("Only Admin can update user role");
  }

  //  if password sent in update request, then hash the password before updating
  if (userData.password && typeof userData.password === "string") {
    userData.password = await bcrypt.hash(userData.password, 10);
  }

  const user = await prisma.user.update({
    where: { id },
    data: userData,
    omit: { password: true },
  });

  return user;
};

//  Delete User future work

const deleteUser = async (id: string) => {
  const user = await prisma.user.delete({
    where: { id },
  });

  return user;
};

export const UserServices = {
  createUser,
  getAllUsers,
  getMyProfile,
  updateUser,
  deleteUser,
};
