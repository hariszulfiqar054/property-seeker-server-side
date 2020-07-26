const express = require("express");
const route = express.Router();
const multer = require("multer");
const auth = require("../middleware/auth");
const property_model = require("../models/property.model");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/JPG" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

//Posting the property
route.post(
  "/addproperty",
  auth,
  upload.array("photos", 6),
  async (req, res) => {
    const current_user_id = req?.user?._id;
    const images_path = req?.files?.map((data) => data?.path);
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
        img: images_path,
        posted_by: current_user_id,
        property_type,
        city,
      });
      const response = await new_property.save();
      res.status(201).send({
        data: response,
        success: true,
        message: "Property Successfully Posted",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        data: "Internal Server Error",
        success: false,
      });
    }
  }
);

//Get all the properties
route.get("/getproperties", auth, async (req, res) => {
  try {
    const response = await property_model.find({});
    res
      .status(200)
      .send({ data: response, success: true, message: "All Properties" });
  } catch (error) {
    res.status(500).send({
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
      res.status(200).send({
        data: response,
        message: "Property Successfully Deleted",
        success: true,
      });
    }
  } catch (error) {
    res.status(500).send({
      data: "Internal Server Error",
      success: false,
    });
  }
});

//Filter
route.post("/searchproperty", auth, async (req, res) => {
  const { bedroom, bathroom, property_type, area, city } = req.body;
});

module.exports = route;
