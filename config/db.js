const mongoose = require("mongoose");

// Use a single mongoose connection throughout the app.
const conn = mongoose.connection;

conn.on("connected", () => {
  console.log(`MongoDB :: connected ${conn.name || "default"}`);
});

conn.on("error", (error) => {
  console.error(`MongoDB :: connection error ${JSON.stringify(error)}`);
});

conn.on("disconnected", () => {
  console.warn(`MongoDB :: disconnected ${conn.name || "default"}`);
});

module.exports = { conn };
