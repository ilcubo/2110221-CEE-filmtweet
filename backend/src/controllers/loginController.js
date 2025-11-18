import User from "../models/userModel.js";
import * as jose from "jose";
import { getSecretKey } from "../config/jwtConfig.js";

/** @type {import("express").RequestHandler} */
export const loginHandler = async (req, res) => {
  try {
    const { username, hashedPassword } = req.body;

    if (!username || !hashedPassword) {
      return res.status(400).json({ error: "username and hashedPassword are required" });
    }

    const user = await User.findOne({ username });
    if (user == null || user.hashedPassword !== hashedPassword) {
      return res.status(401).json({ error: "Incorrect username or password" });
    }

    const payload = {
      userId: user.id,
      username: user.username,
    };

    const secret = getSecretKey();
    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setSubject(user.id)
      .setIssuer("cee-filmtweet:api")
      .setExpirationTime("1h")
      .sign(secret);

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};