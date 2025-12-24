const express = require("express");
const router = express.Router();

// test api
router.get("/", (req, res) => {
  res.json({
    status: true,
    message: "API Working"
  });
});

module.exports = router;
