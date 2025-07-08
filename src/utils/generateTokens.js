import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.ACCESS_SECRET,
    { expiresIn: "15m" }
  );
};

export const generateRefreshToken = async (user) => {
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // matches '7d'

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  return refreshToken;
};