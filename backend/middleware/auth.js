import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "SECRET";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      id: decoded.id,
      correu: decoded.correu || decoded.email,
    };

    next();
  } catch (error) {
    console.error("Error authMiddleware:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "TOKEN_EXPIRED" });
    }

    return res.status(401).json({ message: "Token invàlid" });
  }
};

export default authMiddleware;