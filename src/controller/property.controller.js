const express = require("express");
const route = express.Router();
const fs = require("fs");
const auth = require("../middleware/auth");
const property_model = require("../models/property.model");
const { json } = require("express");

//Posting the property
route.post("/addproperty", auth, async (req, res) => {
  const current_user_id = req?.user?._id;
  const { img } = req.body;
  let base64Image = img.split(";base64,").pop();
  const path = "uploads/" + Date.now() + ".png";
  fs.writeFile(path, base64Image, { encoding: "base64" }, (err, data) => {});

  const {
    area,
    bathroom,
    bedroom,
    description,
    starting_bid,
    property_type,
    city,
  } = req.body;

  try {
    const new_property = new property_model({
      area,
      bathroom,
      bedroom,
      description,
      starting_bid,
      img: path,
      posted_by: current_user_id,
      property_type,
      city: city,
    });
    const response = await new_property.save();
    res.status(201).json({
      data: response,
      success: true,
      message: "Property Successfully Posted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      data: "Internal Server Error",
      success: false,
    });
  }
});

//Get all the properties
route.get("/getproperties", auth, async (req, res) => {
  try {
    const response = await property_model.find({});
    res
      .status(200)
      .json({ data: response, success: true, message: "All Properties" });
  } catch (error) {
    res.status(500).json({
      data: "Internal Server Error",
      success: false,
    });
  }
});

//Only user or admin can delete property
route.delete("/deleteproperty", auth, async (req, res) => {
  const current_user_id = req?.user?._id;
  const role = req?.user?.user_type?.toLowerCase();
  const { id } = req.body;

  try {
    const user = await property_model.findOne({ _id: id });
    if (user?.posted_by == current_user_id || role == "admin") {
      const response = await property_model.deleteOne({ _id: id });
      res.status(200).json({
        data: response,
        message: "Property Successfully Deleted",
        success: true,
      });
    }
  } catch (error) {
    res.status(500).json({
      data: "Internal Server Error",
      success: false,
    });
  }
});

//Filter
route.post("/searchproperty", auth, async (req, res) => {
  const current_user_id = req?.user?._id;
  const { bedroom, bathroom, property_type, area, city } = req.body;

  let query = {};
  if (bedroom) query.bedroom = { $lte: bedroom };
  if (bathroom) query.bathroom = { $lte: bathroom };
  if (property_type) query.property_type = property_type;
  if (area) {
    let data = area?.split("-");
    let range1 = parseInt(data[0]);
    let range2 = parseInt(data[1]);

    query.area = { $gte: range1, $lte: range2 };
  }
  query.isHot = false;
  query.isSold = false;
  if (city) query.city = city;
  try {
    const response = await property_model.find(query);

    const filterResult = response?.filter(
      (data) => data?.posted_by?.toString() !== current_user_id?.toString()
    );
    res.status(200).json({
      data: filterResult,
      success: true,
      message: "Filtered Data",
    });
  } catch (error) {
    res.status(500).json({
      data: "Server Timeout",
      success: false,
    });
  }
});

//Get the hot properties
route.get("/hotProperties", auth, async (req, res) => {
  const current_user_id = req?.user?._id;
  try {
    const response = await property_model.find({ isHot: true, isSold: false });
    const filterResult = response?.filter(
      (data) => data?.posted_by?.toString() !== current_user_id?.toString()
    );
    res.status(200).json({
      data: filterResult,
      message: "Hot properties",
      success: true,
    });
  } catch (error) {
    res.status(500),
      json({
        data: "Internal Server Error",
        success: false,
      });
  }
});

//Add properties to hot
route.post("/addHot", auth, async (req, res) => {
  const { property_id } = req.body;
  try {
    const response = await property_model.update(
      { _id: property_id },
      { $set: { isHot: true } }
    );
    res.status(200).json({
      data: response,
      success: true,
      message: "Successfully added to hot categoires",
    });
  } catch (error) {
    res.status(500).json({
      data: "Server Timeout",
      success: false,
    });
  }
});

//Remove from Hot
route.post("/delHot", auth, async (req, res) => {
  const { property_id } = req.body;

  try {
    const response = await property_model.update(
      { _id: property_id },
      { $set: { isHot: false } }
    );
    res.status(200).json({
      data: response,
      success: true,
      message: "Successfully removed from hot categories",
    });
  } catch (error) {
    res.status(500).json({
      data: "Server Timeout",
      success: false,
    });
  }
});

//Home Data
route.get("/home/:type", auth, async (req, res) => {
  const { type } = req.params;
  const current_user_id = req?.user?._id;

  try {
    const response = await property_model.find({
      property_type: type,
      isHot: false,
      isSold: false,
    });
    const filterResult = response?.filter(
      (data) => data?.posted_by?.toString() !== current_user_id?.toString()
    );

    res.status(200).json({
      data: filterResult,
      success: true,
      message: "Successfully get home data",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      data: "Server Timeout",
      success: false,
    });
  }
});

// Get Posted properties
route.get("/posted", auth, async (req, res) => {
  const current_user = req?.user?._id;

  try {
    const response = await property_model.find({
      posted_by: current_user,
      isSold: false,
    });

    res.status(200).json({
      data: response,
      success: true,
      message: "Successfully get home data",
    });
  } catch (error) {
    res.status(500).json({
      data: "Server Timeout",
      success: false,
    });
  }
});

//Place Bid
route.post("/placebid", auth, async (req, res) => {
  const { new_bid } = req?.body;
  const { property_id } = req?.body;
  const current_user = req?.user?._id;
  try {
    const response = await property_model.update(
      { _id: property_id },
      { $set: { new_bid: new_bid, bid_by: current_user } }
    );
    res.status(200).json({
      data: response,
      success: true,
      message: "Successfully Place Bid",
    });
  } catch (error) {
    res.status(500).json({
      data: "Server Timeout",
      success: false,
    });
  }
});

//Get Purchased Property
route.get("/getpurchased", auth, async (req, res) => {
  const current_user = req?.user?._id;

  try {
    const response = await property_model.find({
      posted_by: current_user,
      bid_by: current_user,
      isSold: true,
    });

    res.status(200).json({
      data: response,
      success: true,
      message: "Successfully Get pruchased Property",
    });
  } catch (error) {
    res.status(500).json({
      data: "Server Timeout",
      success: false,
    });
  }
});

//Approve the Bid
route.put("/approveBid", auth, async (req, res) => {
  const { property_id } = req.body;
  try {
    const get_bid_id = await property_model.find({ _id: property_id });
    const id = get_bid_id[0]?.bid_by;
    const newPrice = get_bid_id[0]?.new_bid;

    const update_data = await property_model.update(
      { _id: property_id },
      { $set: { posted_by: id, isSold: true, starting_bid: newPrice } }
    );
    res.status(200).json({
      data: update_data,
      success: true,
      message: "Successfully Approved Bid",
    });
  } catch (error) {
    res.status(500).json({
      data: "Server Timeout",
      success: false,
    });
  }
});

//Delete Bid
route.put("/deleteBid", auth, async (req, res) => {
  const { property_id } = req.body;
  try {
    const response = await property_model.update(
      { _id: property_id },
      { $set: { bid_by: null, new_bid: null } }
    );
    res.status(200).json({
      data: response,
      success: true,
      message: "Successfully Delete Bid",
    });
  } catch (error) {
    res.status(500).json({
      data: "Server Timeout",
      success: false,
    });
  }
});

route.get("/admin/:type", auth, async (req, res) => {
  const { type } = req.params;
  const role = req?.user?.user_type?.toLowerCase();
  if (role == "admin") {
    try {
      const response = await property_model.find({
        property_type: type,
        isSold: false,
      });
      res.status(200).json({
        data: response,
        success: true,
        message: "Successfully Get Data",
      });
    } catch (error) {
      res.status(500).json({
        data: "Server Timeout",
        success: false,
      });
    }
  } else {
    res.status(401).json({
      data: "You are unauthorized for this action",
      success: false,
    });
  }
});

module.exports = route;
