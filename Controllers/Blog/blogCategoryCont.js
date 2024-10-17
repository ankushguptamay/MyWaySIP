const db = require("../../Models");
const BlogCategories = db.blogCategory;
const { Op } = require("sequelize");
const { deleteSingleFile } = require("../../Util/deleteFile");
const {
  categoriesValidation,
  slugValidation,
} = require("../../Middlewares/Validation/blogValidation");

const { uploadFileToBunny, deleteFileToBunny } = require("../../Util/bunny");
const bunnyFolderName = "blog-file";
const fs = require("fs");

exports.addCategories = async (req, res) => {
  try {
    // Body Validation
    const { error } = categoriesValidation(req.body);
    if (error) {
      if (req.file) {
        deleteSingleFile(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { slug, description, sort_order, name } = req.body;

    const categorie = await BlogCategories.findOne({
      where: { [Op.or]: [{ slug: slug }, { name: name }] },
    });
    if (categorie) {
      if (req.file) {
        deleteSingleFile(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: `Name and slug should be unique!`,
      });
    }
    let fileName, url;
    if (req.file) {
      //Upload file to bunny
      const fileStream = fs.createReadStream(req.file.path);
      await uploadFileToBunny(bunnyFolderName, fileStream, req.file.filename);
      deleteSingleFile(req.file.path);
      fileName = req.file.filename;
      url = `${process.env.SHOW_BUNNY_FILE_HOSTNAME}/${bunnyFolderName}/${req.file.filename}`;
    }
    let data = {
      name,
      slug,
      description,
      sort_order,
      fileName,
      url,
    };
    // Create this if not exist
    await BlogCategories.create(data);
    res.status(200).json({
      success: true,
      message: "Categories added successfully!",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getCategories = async (req, res) => {
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
    const [categories, totalCategories] = await Promise.all([
      BlogCategories.findAll({
        limit: recordLimit,
        offset: offSet,
        where: query,
        order: [["createdAt", "DESC"]],
      }),
      BlogCategories.count({ where: query }),
    ]);

    const totalPages = Math.ceil(totalCategories / recordLimit) || 0;

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully!",
      data: categories,
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

exports.updateCategories = async (req, res) => {
  try {
    // Body Validation
    const { error } = categoriesValidation(req.body);
    if (error) {
      if (req.file) {
        deleteSingleFile(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { slug, description, sort_order, name } = req.body;
    const slugy = req.params.slug;

    const categorie = await BlogCategories.findOne({ where: { slug: slugy } });
    if (!categorie) {
      if (req.file) {
        deleteSingleFile(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: `This categories is not present!`,
      });
    }

    if (name !== categorie.name) {
      const isName = await BlogCategories.findOne({ where: { name } });
      if (isName) {
        if (req.file) {
          deleteSingleFile(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: `Name should be unique!`,
        });
      }
    }

    if (slug !== categorie.slug) {
      const isSlug = await BlogCategories.findOne({ where: { slug } });
      if (isSlug) {
        if (req.file) {
          deleteSingleFile(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: `Slug should be unique!`,
        });
      }
    }

    let fileName = categorie.fileName,
      url = categorie.url;
    if (req.file) {
      //Upload file to bunny
      const fileStream = fs.createReadStream(req.file.path);
      await uploadFileToBunny(bunnyFolderName, fileStream, req.file.filename);
      deleteSingleFile(req.file.path);
      fileName = req.file.filename;
      url = `${process.env.SHOW_BUNNY_FILE_HOSTNAME}/${bunnyFolderName}/${req.file.filename}`;
      // Delete file from bunny
      if (categorie.fileName) {
        await deleteFileToBunny(bunnyFolderName, categorie.fileName);
      }
    }
    let data = {
      name,
      slug,
      description,
      sort_order,
      fileName,
      url,
    };

    // update
    await categorie.update(data);
    res.status(200).json({
      success: true,
      message: "Categories updated successfully!",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteCategories = async (req, res) => {
  try {
    const slug = req.params.slug;

    const categorie = await BlogCategories.findOne({ where: { slug } });
    if (!categorie) {
      return res.status(400).json({
        success: false,
        message: `This categories is not present!`,
      });
    }

    // Delete file from bunny
    if (categorie.fileName) {
      await deleteFileToBunny(bunnyFolderName, categorie.fileName);
    }

    // update
    await categorie.destroy();
    res.status(200).json({
      success: true,
      message: "Categories deleted successfully!",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.categorySlug = async (req, res) => {
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
    const isBlog = await BlogCategories.findOne({ where: { slug } });
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

exports.categoryDetails = async (req, res) => {
  try {
    const slug = req.params.slug;
    const isBlog = await BlogCategories.findOne({
      where: { slug },
    });
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
