const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { conn } = require("../config/db");

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User", 
  },
  cart: {
    totalQty: {
      type: Number,
      default: 0,
      required: true,
    },
    totalCost: {
      type: Number,
      default: 0,
      required: true,
    },
    items: [
      {
        courseId: {
          type: Schema.Types.ObjectId,
          ref: "Course", 
        },
        confirmed: {
          type: Boolean,
          default: false,
        },
        name: {
          type: String,
        },
        price: {
          type: Number,
          default: 0,
        },
        priceTotal: {
          type: Number,
          default: 0,
        },
        quantity: {
          type: Number,
          default: 1, 
        },
      },
    ],
  },
  paymentId: {
    type: String,
    required: true,
  },
  paymentMode: {
    type: String,
    required: true, // e.g., Credit Card, PayPal
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
});

module.exports = conn.model("Order", orderSchema);
