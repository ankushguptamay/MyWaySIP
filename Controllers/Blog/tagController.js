const { Op } = require("sequelize");
const {
  tagValidation,
  slugValidation,
} = require("../../Middlewares/Validation/blogValidation");
const db = require("../../Models");
const BlogTag = db.blogTags;

exports.addTag = async (req, res) => {
  try {
    // Body Validation
    const { error } = tagValidation(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { slug, description, name } = req.body;

    const tag = await BlogTag.findOne({
      where: { [Op.or]: [{ slug: slug }, { name: name }] },
    });
    if (tag) {
      return res.status(400).json({
        success: false,
        message: `Name and slug should be unique!`,
      });
    }
    // Create this if not exist
    await BlogTag.create({ name, slug, description });
    res.status(200).json({
      success: true,
      message: "Tag created successfully!",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getTag = async (req, res) => {
  try {
    const { limit, page, search } = req.query;
    // Pagination
    const recordLimit = parseInt(limit) || 10;
    let offSet = 0;
    let currentPage = 1;
    if (page) {
      offSet = (parseInt(page) - 1) * recordLimit;
      currentPage = parseInt(page);
    }

    //Search
    let query = {};
    if (search) {
      query = {
        [Op.or]: [
          { slug: { [Op.startsWith]: search } },
          { name: { [Op.startsWith]: search } },
        ],
      };
    }
    const [tags, totalTags] = await Promise.all([
      BlogTag.findAll({
        limit: recordLimit,
        offset: offSet,
        where: query,
        order: [["createdAt", "DESC"]],
      }),
      BlogTag.count({ where: query }),
    ]);

    const totalPages = Math.ceil(totalTags / recordLimit) || 0;

    res.status(200).json({
      success: true,
      message: "Tags fetched successfully!",
      data: tags,
      totalPages: totalPages,
      currentPage,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateTag = async (req, res) => {
  try {
    // Body Validation
    const { error } = tagValidation(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { slug, description, name } = req.body;
    const slugy = req.params.slug;

    const tag = await BlogTag.findOne({ where: { slug: slugy } });
    if (!tag) {
      return res.status(400).json({
        success: false,
        message: `This tag is not present!`,
      });
    }

    if (name !== tag.name) {
      const isName = await BlogTag.findOne({ where: { name } });
      if (isName) {
        return res.status(400).json({
          success: false,
          message: `This tag name is present!`,
        });
      }
    }

    if (slug !== tag.slug) {
      const isSlug = await BlogTag.findOne({ where: { slug } });
      if (isSlug) {
        return res.status(400).json({
          success: false,
          message: `This tag slug is present!`,
        });
      }
    }

    // Update
    await tag.update({ name, slug, description });
    res.status(200).json({
      success: true,
      message: "Tag updated successfully!",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    const slug = req.params.slug;

    const tag = await BlogTag.findOne({ where: { slug } });
    if (!tag) {
      return res.status(400).json({
        success: false,
        message: `This tag is not present!`,
      });
    }

    // Delete
    await tag.destroy();
    res.status(200).json({
      success: true,
      message: "Tag deleted successfully!",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.tagSlug = async (req, res) => {
  try {
    // Body Validation
    const { error } = slugValidation(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const slug = req.body.slug;
    const isBlog = await BlogTag.findOne({ where: { slug } });
    if (isBlog) {
      return res.status(400).json({
        success: false,
        message: `Present`,
      });
    }

    res.status(200).json({
      success: true,
      message: "NotPresent!",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.tagDetails = async (req, res) => {
  try {
    const slug = req.params.slug;
    const isBlog = await BlogTag.findOne({ where: { slug } });
    if (!isBlog) {
      return res.status(400).json({
        success: false,
        message: "NotPresent!",
      });
    }

    res.status(200).json({
      success: true,
      data: isBlog,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
