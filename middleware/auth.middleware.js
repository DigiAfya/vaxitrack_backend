const jwt = require("jsonwebtoken");
const sendResponse = require("../utilities/response.util");

exports.protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendResponse(res, {
      success: false,
      message: "No token provided",
      data: null,
      statusCode: 401,
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

  
    req.user = decoded; // contains user_id and role
    next();
  } catch (err) {
    return sendResponse(res, {
      success: false,
      message: "Token invalid",
      data: null,
      statusCode: 401,
    });
  }
};

