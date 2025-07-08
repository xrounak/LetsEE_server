// ✅ Core Imports
import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';

// ✅ Route Imports
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import commentRoutes from './routes/comments.js';
import likeRoutes from './routes/likes.js';
// import answer from './routes/answer.js';

// ✅ Load environment variables from .env
dotenv.config();

// ✅ Initialize Express App
const app = express();

// ✅ Enable CORS for frontend (React)
app.use(cors({
  origin: 'http://localhost:5173', //  5173
  credentials: true //  using cookies/auth
}));
// ✅ Built-in middlewares
app.use(express.json());             // Parse JSON body
app.use(cookieParser());             // Parse cookies from request headers

// ✅ Mount API routes
app.use('/auth', authRoutes);    // Auth routes: login, register, etc.
app.use('/posts', postRoutes);       // Post CRUD routes
app.use('/comment', commentRoutes); // Comment CRUD routes
app.use('/like', likeRoutes);       // Like/dislike routes

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
