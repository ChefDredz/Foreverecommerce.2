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

    // Verify the token using Clerk
    const verificationResult = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Handle different Clerk SDK versions
    const payload = verificationResult || verificationResult?.data || verificationResult?.payload;

    if (!payload) {
      console.error("❌ Token verification failed");
      return res.status(403).json({ 
        success: false, 
        message: "Invalid or expired token"
      });
    }

    console.log("✅ Clerk Token Verified. User ID:", payload.sub);
    console.log("🔍 Full payload:", JSON.stringify(payload, null, 2));

    // Attach payload to request
    req.user = payload;
    req.userId = payload.sub;

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