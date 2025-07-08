import express from "express";
import {
  createPost,
  getAllPosts,
  deletePost,
  getPostById,
} from "../controllers/postController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a post
router.post("/", authenticate, createPost);

// Get all posts
router.get("/", authenticate, getAllPosts);

// Get a single post by ID
router.get("/:id", authenticate, getPostById);

// Delete a post by ID
router.delete("/:id", authenticate, deletePost);

export default router;
