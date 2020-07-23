const express = require("express");
const route = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const user_model = require("../models/user.model");
const auth = require("../middleware/auth");
const saltRounds = 10;

route.use(express.json());

//Signing up user
route.post("/signup", async (req, res) => {
  const { name, email, contact, password } = req.body;
  try {
    const hashPassword = await bcrypt.hash(password, saltRounds);
    const user = new user_model({
      name,
      email,
      contact,
      password: hashPassword,
      user_type: "normal",
    });
    const response = await user.save();
    if (user) {
      res.status(201).json({
        data: response,
        message: "User Registered",
        success: true,
      });
    }
  } catch (error) {
    res.status(501).json({
      data: "Server Timeout",
      success: false,
    });
  }
});

//Signing in user
route.post("/login", async (req, res) => {
  const { email, password } = req.body;

  //Login with email
  try {
    if (email && email.includes("@")) {
      const response = await user_model.find({ email });
      if (response?.length === 0) {
        res.status(404).json({
          data: "User not found",
          success: false,
        });
      } else {
        const compare_password = await bcrypt.compare(
          password,
          response[0]?.password
        );
        if (compare_password) {
          const token = jwt.sign(
            {
              _id: response[0]?._id,
              user_type: response[0]?.user_type,
            },
            process.env.SECRET_KEY
          );
          res.status(200).json({
            data: {
              id: response[0]?._id,
              name: response[0]?.name,
              email: response[0]?.email,
              contact: response[0]?.contact,
              user_type: response[0]?.user_type,
              access_token: token,
              success: true,
            },
          });
        } else {
          res.status(401).json({
            data: "Invalid email or phone",
            success: false,
          });
        }
      }
    }
    //Login with phone number
    else {
      const response = await user_model.find({ contact: email });
      if (response?.length === 0) {
        res.status(404).json({
          data: "User not found",
          success: false,
        });
      } else {
        const compare_password = await bcrypt.compare(
          password,
          response[0]?.password
        );
        if (compare_password) {
          const token = jwt.sign(
            {
              _id: response[0]?._id,
              user_type: response[0]?.user_type,
            },
            process.env.SECRET_KEY
          );
          res.status(200).json({
            data: {
              id: response[0]?._id,
              name: response[0]?.name,
              email: response[0]?.email,
              contact: response[0]?.contact,
              user_type: response[0]?.user_type,
              access_token: token,
              success: true,
            },
          });
        } else {
          res.status(401).json({
            data: "Invalid email or phone",
            success: false,
          });
        }
      }
    }
  } catch (error) {
    res.status(500).json({
      data: "Internal Server Error",
      success: false,
    });
  }
});

//only admin can delete the user
route.delete("/delete", auth, async (req, res) => {
  const { id } = req.body;
  try {
    if (req?.user?.user_type?.toLowerCase() === "admin") {
      const response = await user_model.deleteOne({ _id: id });
      if (response) {
        res.status(200).json({
          data: response,
          message: "User Delete Successfully",
          success: true,
        });
      }
    } else {
      res.status(401).json({
        data: "You are not eligible for this action",
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      data: "Internal Server Error",
    });
  }
});
module.exports = route;
