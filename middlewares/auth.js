import { jwtDecoder } from "../utils/service.js";
import { UsersService } from "../modules/users/service.js";
import createHttpError from "http-errors";



const checkRole = (role, requiredRoles) => requiredRoles.includes(role);
export const protectRoute = (roles) => async (req, res, next) => {
  const { role } = req.requestor || {};

  // Check if the user has the necessary role
  if (!role || !checkRole(role, roles)) {
    return next(
      createHttpError(403, "Access denied: Insufficient permissions")
    );
  }

  next();
};

export const authMiddleware = async (req, res, next) => {
  try {
    const decoded = await jwtDecoder(req);

    if (!decoded || !decoded.id) {
      return next(createHttpError(401, "Authentication failed: Invalid token."));
    }
    
    const  requestor = await UsersService.findOne({where: { id: decoded.id }});
    
    if (requestor) {
      req.requestor = requestor.toJSON();
    } else {
      return next(
        createHttpError(401, "Authentication failed: User or Admin not found")
      );
    }
    next();
  } catch(error) {
    console.log("Authentication error:", error?.message);
    return res.status(401).json({ message: error?.message || "Authentication failed: Invalid token." });
  }
};
