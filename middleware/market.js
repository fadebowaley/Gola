const Courses = require("../models/course");
const Order = require("../models/order");
const User = require("../models/user");

// Function to add courses to the cart
async function addItemToCart(cart, course, courseData, courseId) {
  const { quantity } = courseData;
  const courseTitle = course.title;
  const price = course.price || courseData.price;
  //const courseId = course._id;

  // Course-specific properties for the cart item
  const cartItem = {
    courseTitle,
    price,
    quantity: parseInt(quantity) || 1,
    courseId,
    priceTotal: calculateItemTotalCost(price, quantity),
  };

  // Push the constructed cart item to the cart
  cart.items.push(cartItem);

  // Update total cost
  cart.totalCost = calculateTotalCost(cart.items);

  // Save the cart
  await cart.save();
}

// Function to calculate the total cost of an item
function calculateItemTotalCost(price, quantity) {
  return price * (parseInt(quantity) || 1);
}

// Function to calculate the total cost of all items in the cart
function calculateTotalCost(items) {
  return items.reduce((total, item) => total + item.priceTotal, 0);
}

// Middleware function to process order and store it
async function processOrder(userId, paymentId, paymentMode, cart, statusCode) {
  // Create a new order instance for courses
  const order = new Order({
    user: userId,
    paymentId,
    paymentMode,
    delivered: statusCode,
    totalQty: cart.totalQty,
    totalCost: cart.totalCost + calculateVat(cart.totalCost),
    items: cart.items.map((item) => ({
      courseTitle: item.courseTitle,
      courseId: item.courseId,
      quantity: item.quantity,
      price: item.price,
      priceTotal: item.priceTotal,
    })),
    createdAt: new Date(),
    delivered: statusCode,
    trackingId: generateTrackingID(),
  });

  // Save the order
  await order.save();

  // Clear the cart after order is processed
  cart.items = [];
  cart.totalQty = 0;
  cart.totalCost = 0;
  await cart.save();
  return order;
}

// Function to calculate VAT at 7.5%
function calculateVat(totalCost) {
  return totalCost * 0.075;
}

// Function to retrieve course details
async function getCourseDetails(courseId) {
  const course = await Courses.findById(courseId);
  if (!course) {
    throw new Error("Course not found.");
  }
  return course;
}

function generateTrackingID() {
  const prefix = "ORD";
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${randomString}`;
}

module.exports = {
  addItemToCart,
  getCourseDetails,
  processOrder,
  generateTrackingID,
};
