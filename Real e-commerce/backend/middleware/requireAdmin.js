// backend/middleware/requireAdmin.js

import { clerkClient } from "@clerk/clerk-sdk-node";

const adminAuth = async (req, res, next) => {
  try {
    console.log("🔐 Admin auth middleware triggered");
    
    // Get token from header
    const authHeader = req.headers.authorization;
    console.log("📝 Auth header:", authHeader ? "Present" : "Missing");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("❌ No valid authorization header");
      return res.status(401).json({ 
        success: false, 
        message: "Not authorized - No token provided" 
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("🔑 Token received (first 30 chars):", token.substring(0, 30) + "...");

    try {
      // Verify token with Clerk using environment variables
      const payload = await clerkClient.verifyToken(token, {
        jwtKey: process.env.CLERK_SECRET_KEY,
      });

      console.log("✅ Token verified. User ID:", payload.sub);
      req.userId = payload.sub;
      next();
    } catch (verifyError) {
      console.error("❌ Token verification failed:", verifyError.message);
      return res.status(403).json({ 
        success: false, 
        message: "Invalid or expired token",
        error: verifyError.message 
      });
    }
  } catch (error) {
    console.error("❌ Admin auth error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Authentication error",
      error: error.message 
    });
  }
};

export default adminAuth;