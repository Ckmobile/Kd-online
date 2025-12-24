const express = require("express");
const cors = require("cors");
const path = require("path");

const api = require("./api");

const app = express();

app.use(cors());
app.use(express.json());
app.set("json spaces", 2);

// static html folder
app.use(express.static(path.join(__dirname, "html")));

// api routes
app.use("/api", api);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ Server running on port " + PORT);
});

module.exports = app;
