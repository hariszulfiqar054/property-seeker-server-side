const express = require("express");
const route = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const user_model = require("../models/user.model");
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
    });
    const response = await user.save();
    if (user) {
      res.status(201).send({
        data: response,
        message: "User Registered",
        success: true,
      });
    }
  } catch (error) {
    res.status(501).send({
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
      if (response && response.length === 0) {
        res.status(404).send({
          data: "User not found",
          success: false,
        });
      } else {
        const compare_password = await bcrypt.compare(
          password,
          response[0] && response[0].password
        );
        if (compare_password) {
          const token = jwt.sign(
            { _id: response && response._id },
            process.env.SECRET_KEY
          );
          res.status(200).send({
            data: {
              id: response && response[0] && response[0]._id,
              name: response && response[0] && response[0].name,
              email: response && response[0] && response[0].email,
              contact: response && response[0] && response[0].contact,
              access_token: token,
              success: true,
            },
          });
        } else {
          res.status(401).send({
            data: "Invalid email or phone",
            success: false,
          });
        }
      }
    }
    //Login with phone number
    else {
      const response = await user_model.find({ contact: email });
      if (response && response.length === 0) {
        res.status(404).send({
          data: "User not found",
          success: false,
        });
      } else {
        const compare_password = await bcrypt.compare(
          password,
          response[0] && response[0].password
        );
        if (compare_password) {
          const token = jwt.sign(
            { _id: response && response._id },
            process.env.SECRET_KEY
          );
          res.status(200).send({
            data: {
              id: response && response[0] && response[0]._id,
              name: response && response[0] && response[0].name,
              email: response && response[0] && response[0].email,
              contact: response && response[0] && response[0].contact,
              access_token: token,
              success: true,
            },
          });
        } else {
          res.status(401).send({
            data: "Invalid email or phone",
            success: false,
          });
        }
      }
    }
  } catch (error) {
    res.status(500).send({
      data: "Internal Server Error",
      success: false,
    });
  }
});
module.exports = route;
