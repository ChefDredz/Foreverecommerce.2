// backend/middleware/verifyClerkToken.js
import { verifyToken } from "@clerk/backend";

export const verifyClerkToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false, 
        message: "Missing or invalid Authorization header" 
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token with Clerk
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    if (!payload) {
      return res.status(403).json({ 
        success: false, 
        message: "Invalid or expired token"
      });
    }

    console.log("✅ Token verified. User ID:", payload.sub);

    // Attach full payload
    req.user = payload;
    req.userId = payload.sub;

    // CRITICAL: Extract role from the correct location
    // Clerk puts custom claims at the root level when using JWT templates
    req.userRole = payload.role || payload.publicMetadata?.role || payload.metadata?.role;

    console.log("🔑 User role:", req.userRole);

    next();
  } catch (error) {
    console.error("❌ Token verification error:", error.message);
    return res.status(403).json({ 
      success: false, 
      message: "Invalid or expired token"
    });
  }
};