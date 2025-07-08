import jwt from "jsonwebtoken";

const getUserFromToken = (req) => {
  const token = req.cookies?.accessToken;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    return decoded; // typically includes user id, role, etc.
  } catch (err) {
    console.error("Invalid token:", err.message);
    return null;
  }
};


export default getUserFromToken;