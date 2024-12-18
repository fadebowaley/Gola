const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { conn } = require("../config/db"); 

const cartSchema = Schema({
  items: [
    {
      roomTypeId: {
        type: Schema.Types.ObjectId,
        ref: "RoomType",
      },
     noRooms: {
        type: Number,
        default: 0,
      },
     days: {
        type: Number,
        default: 0,
      },
    
      num_guests: {
        type: String,
        required: true,
     },
     checkIn: {
        type: Date,       
      },
     checkOut: {
        type: Date,        
      },
      price: {
        type: Number,
        default: 0,
      },
      priceTotal: {
        type: Number,
        default: 0,
      },
      name: {
        type: String,
      },
      hotel: {
        type: String,
      },
      roomCode: {
        type: String,
      },
    },
  ],
  totalRoom: {
    type: Number,
    default: 0,
    required: true,
  },
  totalCost: {
    type: Number,
    default: 0,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = conn.model("Cart", cartSchema);


