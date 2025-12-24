import jwt from "jsonwebtoken";

// user authentication middleware
const authUser = async (req, res, next) => {
  try {
    // Step 1: Get token from Authorization header
    const authHeader = req.headers.authorization;

    // Step 2: Validate header Format.
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized" });
    }

    // Step 3: Extract token
    const userToken = authHeader.split(" ")[1];

    if (process.env.NODE_ENV === "development") {
      console.log("Auth Header:", req.headers.authorization);
    }

    // Step 4: Verify token.
    const decoded = jwt.verify(userToken, process.env.JWT_SECRET);

    // Step 5: Attach userId to request.
    req.userId = decoded.id;

    // Step 6: Proceed (Continue request Flow)
    next();

  } catch (error) {
    console.error(error);
    return res.status(401).json({ success: false, message: "Invalid or Expired Token" });
  }
};

export default authUser;
