import * as jose from "jose";
import { getSecretKey } from "../config/jwtConfig.js";

/**
 * Auth middleware to verify JWT tokens.
 * Extracts the token from the Authorization header (Bearer scheme),
 * verifies it, and attaches the decoded payload to req.user.
 * @type {import("express").RequestHandler}
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix

    const secret = getSecretKey();
    const verified = await jose.jwtVerify(token, secret, {
      issuer: "cee-filmtweet:api",
    });

    // Attach user info to request for use in route handlers
    req.user = verified.payload;
    next();
  } catch (error) {
    if (error.code === "ERR_JWT_EXPIRED") {
      return res.status(401).json({ error: "Token expired" });
    }
    if (error.code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED") {
      return res.status(401).json({ error: "Invalid token signature" });
    }
    res.status(401).json({ error: "Invalid token" });
  }
};
