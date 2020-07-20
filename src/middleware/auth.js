const jwt = require("middleware/node_modules/jsonwebtoken");
require("middleware/node_modules/dotenv").config();

module.exports = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token)
    return res.status(401).send({
      data: "No token provided",
      success: false,
    });
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).send({
      data: "Invalid Token",
      success: false,
    });
  }
};
