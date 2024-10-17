const express = require("express");
const router = express.Router();

const {
  addCategories,
  getCategories,
  updateCategories,
  deleteCategories,
  categoryDetails,
  categorySlug,
} = require("../../Controllers/Blog/blogCategoryCont");
const {
  addTag,
  getTag,
  deleteTag,
  updateTag,
  tagDetails,
  tagSlug,
} = require("../../Controllers/Blog/tagController");
const {
  addAdditionalPic,
  addCategoryToBlog,
  addTagToBlog,
  addUpdateFeaturedPic,
  createBlog,
  deleteBlog,
  updateBlog,
  deleteBlogPic,
  getBlogBySlug,
  getBlogs,
  deleteCategoryFromBlog,
  deleteTagFromBlog,
  blogSlug,
  publishBlog,
} = require("../../Controllers/Blog/blogController");

//middleware
const { verifyAdminToken } = require("../../Middlewares/verifyJWT");
const uploadImage = require("../../Middlewares/uploadImages");
const { isAdminPresent } = require("../../Middlewares/isPresent");

router.use(verifyAdminToken);
router.use(isAdminPresent);

// Categories
router.post("/categories", uploadImage.single("CategoryPic"), addCategories);
router.get("/categories", getCategories);
router.get("/categories/:slug", categoryDetails);
router.put("/categories/:slug",  uploadImage.single("CategoryPic"), updateCategories);
router.delete("/categories/:slug", deleteCategories);
router.put("/categorySlug", categorySlug);
// Tag
router.post("/tag", addTag);
router.get("/tag", getTag);
router.get("/tag/:slug", tagDetails);
router.put("/tag/:slug", updateTag);
router.delete("/tag/:slug", deleteTag);
router.put("/tagSlug", tagSlug);
// Blog
router.post(
  "/blog",
  uploadImage.fields([
    { name: "FeaturedPic", maxCount: 1 },
    { name: "AdditionalPic", maxCount: 20 },
  ]),
  createBlog
);
router.get("/blog", getBlogs);
router.get("/blog/:slug", getBlogBySlug);
router.put("/blog/:id", updateBlog);
router.delete("/blog/:id", deleteBlog);

router.put(
  "/featuredPic/:id",
  uploadImage.single("FeaturedPic"),
  addUpdateFeaturedPic
); // id = blog id
router.delete("/blogPic/:id", deleteBlogPic); // Pic id
router.put(
  "/additionalPic/:id",
  uploadImage.array("AdditionalPic", 20),
  addAdditionalPic
); // id = blog id

router.put("/blogSlug", blogSlug);
router.put("/publish/:id", publishBlog);

router.put("/deleteCategoryFromBlog/:cSlug", deleteCategoryFromBlog);
router.put("/deleteTagFromBlog/:tSlug", deleteTagFromBlog);
router.put("/addCategoryToBlog", addCategoryToBlog);
router.put("/addTagToBlog", addTagToBlog);

module.exports = router;
