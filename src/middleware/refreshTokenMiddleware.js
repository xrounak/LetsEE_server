import jwt from 'jsonwebtoken';

/**
 * Middleware to verify refresh token and issue a new access token
 * This is usually used at route: POST /auth/refresh
 */
export const refreshTokenMiddleware = (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  // 🔒 If no token, user is not logged in
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not found' });
  }

  try {
    // ✅ Verify refresh token using secret
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    // 👤 Generate a new access token using decoded user ID and role
    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role || 'user' },
      process.env.ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    // 🍪 Set new access token as HttpOnly cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      sameSite: 'None',
      secure: false, // true if using HTTPS
    });

    res.status(200).json({ message: 'Access token refreshed' });
  } catch (err) {
    console.error('Invalid refresh token', err);
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};
