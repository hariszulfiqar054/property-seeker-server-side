const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const user_route = require("./src/controller/user.controller");
const property_route = require("./src/controller/property.controller");
const routes = require("./src/routes/routes");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("uploads/"));
app.use(cors());
app.use(morgan("tiny"));
app.use(routes.user, user_route);
app.use(routes.property, property_route);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((response) => console.log("DB connected successfully"))
  .catch((err) => console.log(err));

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
