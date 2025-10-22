// middleware/requireAdmin.js
import { verifyToken } from "@clerk/backend";
import _default from "validator";

export  const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Check for Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Missing Authorization header" });
    }

    // 2️⃣ Extract token
    const token = authHeader.split(" ")[1];

    // 3️⃣ Verify token using Clerk secret key
    const result = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      issuer: process.env.CLERK_ISSUER_URL,
    });

    // verifyToken returns the payload directly, not wrapped in an object
    const payload = result;
    
    console.log("🧩 Clerk token payload:", payload);

    // 4️⃣ Role check - Check multiple possible locations for the role
    const userRole = payload?.role || payload?.metadata?.role || payload?.publicMetadata?.role;
    
    if (!userRole || userRole !== "admin") {
      console.log("❌ Role check failed. Found role:", userRole);
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: Not an admin" });
    }

    console.log("✅ Admin verified. Role:", userRole);

    // 5️⃣ Attach payload to request for downstream use
    req.user = payload;

    // ✅ Success
    next();
  } catch (error) {
    console.error("requireAdmin Error:", error);
    return res
      .status(403)
      .json({ 
        success: false, 
        message: "Invalid or unverified token",
        error: error.message 
      });
  }
};

export default requireAdmin