// backend/middleware/verifyClerkToken.js
import { verifyToken } from "@clerk/backend";

/**
 * Middleware to verify Clerk JWT token
 * Handles both regular users and admins
 */
export const verifyClerkToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check for Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false, 
        message: "Missing or invalid Authorization header" 
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify the token using Clerk
    const verificationResult = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      issuer: process.env.CLERK_ISSUER_URL,
    });

    // Handle the result based on @clerk/backend return format
    // The result could be { data, errors } or direct payload depending on version
    const payload = verificationResult.data || verificationResult;

    if (!payload || verificationResult.errors) {
      console.error("❌ Token verification failed:", verificationResult.errors);
      return res.status(403).json({ 
        success: false, 
        message: "Invalid or expired token",
        errors: verificationResult.errors 
      });
    }

    console.log("✅ Clerk Token Verified. User ID:", payload.sub);

    // Attach payload to request for downstream use
    req.user = payload;
    req.userId = payload.sub; // Clerk user ID

    // Success - proceed to next middleware/route handler
    next();
  } catch (error) {
    console.error("❌ verifyClerkToken Error:", error.message);
    return res.status(403).json({ 
      success: false, 
      message: "Invalid or expired token",
      error: error.message 
    });
  }
};