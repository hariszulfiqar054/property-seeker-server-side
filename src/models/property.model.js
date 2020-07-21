const mongoose = require("mongoose");

const property = new mongoose.Schema({
  area: {
    type: String,
    required: true,
  },
  isHot: {
    type: Boolean,
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
  starting_bid: {
    type: Number,
    required: true,
  },
});

module.exports={}