// routes/index.js
const express = require("express");
const router = express.Router();
const Message = require("../models/message");
let Parser = require("rss-parser");
let parser = new Parser();
const ngZipCode = require("ngzipcode");




const {
  sendPasswordResetEmailInBackground,
  sendVerificationEmailInBackground,
  sendContacFormInBackground,
} = require("../worker/workers");


// Home route for getting the index pages
router.get("/", async (req, res) => {
  try {
    res.render("pages/index");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});



// POST route to handle form submissions
router.post("/send-message", async (req, res, next) => {
  const { fullName, email, phone, subject, subjectSpec, message } = req.body;

  console.log("checking the body", req.body);
  // Create a new message entry in MongoDB
  const newMessage = new Message({
    fullName: fullName,
    email: email,
    phone: phone,
    subject: subject,
    subjectSpec: subjectSpec,
    message: message,
  });
  try {
    // Save the message in MongoDB
    await newMessage.save();
    console.log("this message has been recieved into my email");

    // Pass the email sending to async middleware
    const sendForm = sendContacFormInBackground(
      fullName,
      email,
      phone,
      subject,
      subjectSpec,
      message
    );

    res.status(200).json("messasge successfully recived with thanks");
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Failed to save message." });
  }
});

// Endpoint to fetch latest Medium articles for my medium article
router.get('/api/blogs', async (req, res) => {
  try {
    const feed = await parser.parseURL('https://medium.com/feed/@fadebowaley');
    const articles = feed.items.slice(0, 4).map(item => ({
      title: item.title,
      author: item.creator || item.author, 
      date: item.pubDate,
      excerpt: item.contentSnippet,
      link: item.link
    }));

    res.json(articles);
  } catch (error) {
    console.error('Error fetching Medium feed:', error);
    res.status(500).json({ message: 'Error fetching Medium feed' });
  }
});


// Endpoint to render photo endpointss
router.get('/photos', async (req, res) => {
  try {
    res.render("pages/photo");
  } catch (error) {
    console.error('Error fetching Medium feed:', error);
    res.status(500).json({ message: 'Error fetching Medium feed' });
  }
});


// Endpoint to render speakings  endpointss
router.get('/speaking', async (req, res) => {
  try {
    res.render("pages/speaking");
  } catch (error) {
    console.error('Error fetching Medium feed:', error);
    res.status(500).json({ message: 'Error fetching Medium feed' });
  }
});

// Endpoint to render speakings  endpointss
router.get("/bio", async (req, res) => {
  try {
    res.render("pages/bio");
  } catch (error) {
    console.error("Error fetching Medium feed:", error);
    res.status(500).json({ message: "Error fetching Medium feed" });
  }
});

// Endpoint to render speakings  endpointss
router.get('/publications', async (req, res) => {
  try {
    res.render("pages/publications");
  } catch (error) {
    console.error('Error fetching Medium feed:', error);
    res.status(500).json({ message: 'Error fetching Medium feed' });
  }
});






module.exports = router;
