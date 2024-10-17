const express = require("express");
const router = express.Router();

const {
  getBlogBySlugForUser,
  getBlogsForUser,
} = require("../../Controllers/Blog/blogController");

router.get("/blog", getBlogsForUser);
router.get("/blog/:slug", getBlogBySlugForUser);

module.exports = router;
