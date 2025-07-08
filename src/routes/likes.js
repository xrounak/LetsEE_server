import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import getUserFromToken from '../utils/getUserFromToken.js';
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();



router.post("/", authenticate, async (req, res) => {
  const user = getUserFromToken(req);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { postId = null, answerId = null, commentId = null } = req.query;
  const userId = user.id;

  // Ensure only one target is passed
  const ids = [postId, answerId, commentId].filter(Boolean);
  if (ids.length !== 1) {
    return res.status(400).json({ message: "Provide exactly one of postId, answerId, or commentId" });
  }

  try {
    // Check if like exists
    const existingLike = await prisma.like.findFirst({
      where: {
        userId,
        postId,
        answerId,
        commentId,
      },
    });

    if (existingLike) { 
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      console.log("unliked")
       
      return res.status(200).json({ message: "Unliked" });
    } else {
      // Like
      const newLike = await prisma.like.create({
        data: {
          userId,
          postId,
          answerId,
          commentId,
        },
      });
      
      console.log("unliked")

      return res.status(201).json({ message: "Liked", like: newLike });
    }
  } catch (err) {
    console.error("Error toggling like:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
