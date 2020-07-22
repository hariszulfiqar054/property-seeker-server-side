const mongoose = require("mongoose");
const { model } = require("./user.model");

const property = new mongoose.Schema({
  area: {
    type: Number,
    required: true,
  },
  isHot: {
    type: Boolean,
    default: false,
  },
  bathroom: {
    type: Number,
    required: true,
  },
  bedroom: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  property_type: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    default: "Pakistan",
  },
  starting_bid: {
    type: Number,
    required: true,
  },
  img: {
    type: [String],
    required: true,
  },
  new_bid: {
    type: Number,
  },
  posted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bid_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Property", property);
