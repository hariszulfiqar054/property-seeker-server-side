const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const user_route = require("./src/controller/user.controller");
const routes = require("./src/routes/routes");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan("tiny"));
app.use(routes.user, user_route);

mongoose
  .connect("mongodb://localhost:27017/propertySeek")
  .then((response) => console.log("DB connected successfully"))
  .catch((err) => console.log(err));

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
