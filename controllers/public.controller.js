const Message = require("../models/message");
const Parser = require("rss-parser");
const { sendContacFormInBackground } = require("../worker/workers");

const parser = new Parser();

const renderHome = async (_req, res) => {
  return res.render("pages/index");
};

const renderAbout = async (_req, res) => {
  return res.render("pages/about");
};

const renderAsk = async (_req, res) => {
  return res.render("pages/ask");
};

const submitContactMessage = async (req, res) => {
  const { fullName, email, phone, subject, subjectSpec, message } = req.body;

  if (!fullName || !email || !subject || !subjectSpec || !message) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const newMessage = new Message({
      fullName,
      email,
      phone,
      subject,
      subjectSpec,
      message,
    });

    await newMessage.save();

    // Fire and forget; do not block API response on outbound mail latency.
    sendContacFormInBackground(
      fullName,
      email,
      phone,
      subject,
      subjectSpec,
      message
    ).catch((error) => {
      console.error("[contact] failed to queue outbound email", error);
    });

    return res.status(200).json({ message: "Message received successfully." });
  } catch (error) {
    console.error("[contact] failed to save message", error);
    return res.status(500).json({ error: "Failed to save message." });
  }
};

const getBlogs = async (_req, res) => {
  try {
    const feed = await parser.parseURL("https://medium.com/feed/@fadebowaley");
    const articles = feed.items.slice(0, 4).map((item) => ({
      title: item.title,
      author: item.creator || item.author,
      date: item.pubDate,
      excerpt: item.contentSnippet,
      link: item.link,
    }));

    return res.json(articles);
  } catch (error) {
    console.error("[blogs] failed to fetch Medium feed", error);
    return res.status(500).json({ message: "Error fetching Medium feed." });
  }
};

module.exports = {
  renderHome,
  renderAbout,
  renderAsk,
  submitContactMessage,
  getBlogs,
};
