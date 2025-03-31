const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");



const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

const documentReviewRoutes = require("./routes/documentReviewRoutes");
app.use("/api", documentReviewRoutes);

const predictOutcome = require("./routes/predictOutcome");
app.use("/api", predictOutcome);

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to the Legal Agent Backend!");
});

module.exports = app;
