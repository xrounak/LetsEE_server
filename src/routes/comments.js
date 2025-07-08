import express from "express";
import { PrismaClient } from "@prisma/client";
import getUserFromToken from "../utils/getUserFromToken.js";

const prisma = new PrismaClient();
const router = express.Router();

// Add Comment
router.post("/", async (req, res) => {
  console.log("🔧 Adding comment...");

  const user = getUserFromToken(req);
  if (!user) {
    console.log("❌ Unauthorized user");
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Extract and convert IDs from query to integers
  const postId = req.query.postId ? parseInt(req.query.postId) : null;
  const answerId = req.query.answerId ? parseInt(req.query.answerId) : null;
  const parentCommentId = req.query.parentCommentId ? parseInt(req.query.parentCommentId) : null;

  const content = req.body.content;

  console.log("👤 User:", user.id);
  console.log("📝 Content:", content);
  console.log("🔍 Target IDs => postId:", postId, "answerId:", answerId, "parentCommentId:", parentCommentId);

  const targets = [postId, answerId, parentCommentId].filter(Boolean);

  if (targets.length !== 1 || !content) {
    console.log("⚠️ Invalid input: Provide content and exactly one target ID.");
    return res.status(400).json({
      message: "Provide content and exactly one of postId, answerId, or parentCommentId",
    });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        userId: user.id,
        content,
        postId,
        answerId,
        parentCommentId,
      },
    });

    console.log("✅ Comment created:", comment.id);
    res.status(201).json({ message: "Comment added", comment });

  } catch (err) {
    console.error("❌ Error creating comment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete Comment
router.delete("/:id", async (req, res) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const commentId = parseInt(req.params.id);

  try {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.userId !== user.id) {
      return res.status(403).json({ message: "Not allowed to delete this comment" });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Fetch Comments
router.get("/", async (req, res) => {
  console.log(req.url, req.query);
  const { postId, answerId, parentCommentId } = req.query;

  const filters = {
    ...(postId && { postId: parseInt(postId) }),
    ...(answerId && { answerId: parseInt(answerId) }),
    ...(parentCommentId && { parentCommentId: parseInt(parentCommentId) }),
  };

  if (Object.keys(filters).length !== 1) {
    return res.status(400).json({
      message: "Provide exactly one of postId, answerId, or parentCommentId in query",
    });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: filters,
      include: {
        user: { select: { id: true, name: true } },
        replies: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json(comments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
