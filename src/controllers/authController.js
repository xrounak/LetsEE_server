import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";

const prisma = new PrismaClient();

export const register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: { email, password: hashed, name },
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("logging in  {");
    console.log("Email:", email);

    const user = await prisma.user.findUnique({ where: { email } });
    console.log("Finding user...");
    if (!user) return res.status(401).json({ message: "User not found" });

    console.log("User Found");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Incorrect Password" });

    console.log("Password Matched");
    console.log(user);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "None",
        secure: false,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "None",
        secure: false,
      })
      .json({
        message: "Logged in",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      });

    console.log(" Logged in }");
  } catch (err) {
    res.status(500).json({
      message: "Internal server ki mkc",
    });
  }
};

export const logout = (req, res) => {
  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json({ message: "Logged out" });
};

export const refresh = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const newAccessToken = generateAccessToken({
      id: decoded.id,
      role: "user",
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "None",
      secure: false,
    });

    res.json({ message: "Token refreshed" });
  } catch (err) {
    res.sendStatus(403);
  }
};

export const profile = async (req, res) => {
  try {
    console.log("Trying to check authentiaion")
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        posts: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    console.log(" authenticated")
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
