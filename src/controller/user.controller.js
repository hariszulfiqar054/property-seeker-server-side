const express = require("express");
const route = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const user_model = require("../models/user.model");
const saltRounds = 10;

route.use(express.json());

//Signing up user
route.get("get", (req, res) => {
  res.render("HI");
});

route.post("signup", async (req, res) => {
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

module.exports = route;
