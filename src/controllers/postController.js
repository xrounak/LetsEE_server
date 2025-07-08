import { PrismaClient, PostStatus } from "@prisma/client";
import getUserFromToken from "../utils/getUserFromToken.js";

const prisma = new PrismaClient();

// Create a new post
export const createPost = async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const { title, content, statusInput, tags = [] } = req.body;

  const validStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"];
  const status = validStatuses.includes(statusInput?.toUpperCase())
    ? statusInput.toUpperCase()
    : "DRAFT";

  try {
    // Step 1: Create post
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        status: PostStatus[status],
        userId: user.id,
      },
    });

    // Step 2: Attach tags
    for (const tagName of tags) {
      let tag = await prisma.tag.findUnique({ where: { name: tagName } });

      if (!tag) {
        tag = await prisma.tag.create({ data: { name: tagName } });
      }

      await prisma.postTag.create({
        data: {
          postId: newPost.id,
          tagId: tag.id,
        },
      });
    }

    // Step 3: Return full post with tags
    const fullPost = await prisma.post.findUnique({
      where: { id: newPost.id },
      include: {
        postTags: { include: { tag: true } },
      },
    });

    res.status(201).json({ post: fullPost });
  } catch (err) {
    console.error("Create Post Error:", err);
    res.status(500).json({ message: "Could not create post" });
  }
};

// Get all posts
export const getAllPosts = async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        postTags: { include: { tag: true } },
        likes: true,
      },
    });

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      status: post.status,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      user: post.user,
      postTags: post.postTags,
      likeCount: post.likes?.length || 0,
    }));

    res.json({ posts: formattedPosts });
  } catch (err) {
    console.error("Get All Posts Error:", err);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

// Get single post by ID
export const getPostById = async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const postId = parseInt(req.params.id);

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        postTags: { include: { tag: true } },
        likes: true,
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const formattedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      status: post.status,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      user: post.user,
      postTags: post.postTags,
      likeCount: post.likes?.length || 0,
    };

    res.json({ post: formattedPost });
  } catch (err) {
    console.error("Get Post By ID Error:", err);
    res.status(500).json({ message: "Failed to fetch post" });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const postId = parseInt(req.params.postId);

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId !== user.id) {
      return res.status(403).json({ message: "Forbidden: You do not own this post" });
    }

    await prisma.like.deleteMany({ where: { postId } });
    await prisma.post.delete({ where: { id: postId } });

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete Post Error:", err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};
