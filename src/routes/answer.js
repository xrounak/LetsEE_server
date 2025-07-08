// import express from "express";
// import { PrismaClient } from "@prisma/client";
// import getUserFromToken from "../utils/getUserFromToken.js";

// const prisma = new PrismaClient();
// const router = express.Router();


// // ✅ CREATE Answer
// router.post("/answer", async (req, res) => {
//   const user = getUserFromToken(req);
//   if (!user) return res.status(401).json({ message: "Unauthorized" });

//   const { postId } = req.query
//   const {content } = req.body;

//   if (!postId || !content) {
//     return res.status(400).json({ message: "postId and content are required" });
//   }

//   try {
//     const answer = await prisma.answer.create({
//       data: {
//         userId: user.id,
//         postId,
//         content,
//       },
//     });

//     res.status(201).json({ message: "Answer created", answer });
//   } catch (err) {
//     console.error("Error creating answer:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });


// // ✅ READ Answers for a Post
// router.get("/answer", async (req, res) => {
//   const { postId } = req.query;

//   if (!postId) {
//     return res.status(400).json({ message: "postId is required in query" });
//   }

//   try {
//     const answers = await prisma.answer.findMany({
//       where: { postId: parseInt(postId) },
//       include: {
//         user: { select: { id: true, name: true } },
//         comments: {
//           include: {
//             user: { select: { id: true, name: true } },
//           },
//         },
//         likes: true,
//       },
//       orderBy: { createdAt: "asc" },
//     });

//     res.status(200).json(answers);
//   } catch (err) {
//     console.error("Error fetching answers:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });


// // ✅ DELETE Answer
// router.delete("/answer/:id", async (req, res) => {
//   const user = getUserFromToken(req);
//   if (!user) return res.status(401).json({ message: "Unauthorized" });

//   const answerId = parseInt(req.params.id);

//   try {
//     const answer = await prisma.answer.findUnique({ where: { id: answerId } });

//     if (!answer || answer.userId !== user.id) {
//       return res.status(403).json({ message: "Not allowed to delete this answer" });
//     }

//     await prisma.answer.delete({ where: { id: answerId } });

//     res.status(200).json({ message: "Answer deleted" });
//   } catch (err) {
//     console.error("Error deleting answer:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// export default router;
