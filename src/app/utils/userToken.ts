import type { Prisma } from "@prisma/client";
import { envVars } from "../config/env";

import { generateToken } from "./jwt";

export const createUserToken = (user: Partial<Prisma.UserCreateInput>) => {
  const jwtPayLoad = {
    id: user.id,
    email: user.email,
    role: user.role,
  };


  const accessToken = generateToken(
    jwtPayLoad,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES,
  );
  
  return {
    accessToken,
  };
};
