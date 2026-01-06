
import express from "express";

const router = express.Router();

router.post("/login", (req, res) => {
    // Simple auth check for Admin System
    // In a real system, checking password etc.
    // Here we can check if the x-admin-secret matches (if passed in header) 
    // OR just return success if the frontend sends the secret in headers (which it does via service.js interceptor if configured, but Login request might not have it set up yet in context).
    // Let's assume the user enters the Secret as a "Password" or we just return success for this artifact if the request is allowed.
    // Middleware `adminAuth` is NOT checking this route currently unless I mount it under adminAuth.
    // I will NOT mount it under adminAuth so it's public.
    
    // Check body or header.
    // "Security: x-admin-secret header". 
    // If the user uses the frontend, they need to "Login" to set the Context state.
    
    const { password } = req.body; // Can treat password as the secret
    
    if (password === process.env.ADMIN_SECRET) {
        return res.status(200).json({
            status: 200,
            message: "Login successful",
            token: "admin-session-token", // Dummy token
            user: {
                id: "admin",
                name: "Admin User",
                role: "admin"
            }
        });
    }
    
    res.status(401).json({ status: 401, message: "Invalid credentials" });
});

export default router;
