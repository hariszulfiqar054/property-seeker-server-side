const mongoose = require("mongoose");

const user = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  user_type: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("User", user);
