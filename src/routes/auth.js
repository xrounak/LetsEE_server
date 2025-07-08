import express from "express";
import {
  register,
  login,
  logout,
  refresh,
  profile
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get('/profile',authenticate, profile);

export default router;

