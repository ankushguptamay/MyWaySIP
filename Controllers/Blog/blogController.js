const { Op } = require("sequelize");
const {
  blogValidation,
  slugValidation,
  publishBlogValidation,
  addTagToBlogValidation,
  addCategoryToBlogValidation,
} = require("../../Middlewares/Validation/blogValidation");
const db = require("../../Models");
const Blog = db.blog;
const BlogImage = db.blogImages;
const BlogTag = db.blogTags;
const BlogCategories = db.blogCategory;
const BlogCategoryAssociaction = db.blogCategoryAssociation;
const BlogTagAssociation = db.blogTagAssociation;
const { deleteSingleFile } = require("../../Util/deleteFile");
const { uploadFileToBunny, deleteFileToBunny } = require("../../Util/bunny");
const bunnyFolderName = "blog-file";
const fs = require("fs");

exports.createBlog = async (req, res) => {
  try {
    // Body Validation
    const { error } = blogValidation(req.body);
    if (error) {
      if (req.files) {
        if (req.files.FeaturedPic) {
          deleteSingleFile(req.files.FeaturedPic[0].path);
        }
        if (req.files.AdditionalPic) {
          for (let i = 0; i < req.files.AdditionalPic.length; i++) {
            deleteSingleFile(req.files.AdditionalPic[i].path);
          }
        }
      }
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const {
      slug,
      categorys,
      tags,
      title,
      content,
      readTime,
      publishDate,
      status,
      metaTag,
      description,
      authorName,
    } = req.body;

    const isBlog = await Blog.findOne({ where: { slug: slug } });
    if (isBlog) {
      if (req.files) {
        if (req.files.FeaturedPic) {
          deleteSingleFile(req.files.FeaturedPic[0].path);
        }
        if (req.files.AdditionalPic) {
          for (let i = 0; i < req.files.AdditionalPic.length; i++) {
            deleteSingleFile(req.files.AdditionalPic[i].path);
          }
        }
      }
      return res.status(400).json({
        success: false,
        message: `Slug should be unique!`,
      });
    }

    const data = {
      slug,
      title,
      content,
      readTime,
      publishDate,
      status,
      metaTag,
      description,
      authorName,
    };
    // Create this if not exist
    const blog = await Blog.create(data);

    //Add category association
    if (categorys) {
      for (let i = 0; i < categorys.length; i++) {
        const [record, isCreated] = await BlogCategoryAssociaction.findOrCreate(
          {
            where: { blogId: blog.id, blogCategoryId: categorys[i].id }, // Condition to check if the record exists
            defaults: {
              blogId: blog.id,
              blogCategoryId: categorys[i].id,
              categorySlug: categorys[i].slug,
            },
          }
        );
      }
    }
    //Add tag association
    if (tags) {
      for (let i = 0; i < tags.length; i++) {
        const [record, isCreated] = await BlogTagAssociation.findOrCreate({
          where: { blogId: blog.id, blogTagId: tags[i].id }, // Condition to check if the record exists
          defaults: {
            blogId: blog.id,
            blogTagId: tags[i].id,
            tagSlug: tags[i].slug,
          },
        });
      }
    }

    // Upload Images
    if (req.files) {
      if (req.files.FeaturedPic) {
        //Upload file to bunny
        const fileStream = fs.createReadStream(req.files.FeaturedPic[0].path);
        await uploadFileToBunny(
          bunnyFolderName,
          fileStream,
          req.files.FeaturedPic[0].filename
        );
        deleteSingleFile(req.files.FeaturedPic[0].path);
        // Store in data
        await BlogImage.create({
          fieldName: req.files.FeaturedPic[0].fieldname,
          mimeType: req.files.FeaturedPic[0].mimetype,
          fileName: req.files.FeaturedPic[0].filename,
          url: `${process.env.SHOW_BUNNY_FILE_HOSTNAME}/${bunnyFolderName}/${req.files.FeaturedPic[0].filename}`,
          blogId: blog.id,
        });
      }

      const additionalPic = [];
      if (req.files.AdditionalPic) {
        for (let i = 0; i < req.files.AdditionalPic.length; i++) {
          //Upload file to bunny
          const fileStream = fs.createReadStream(
            req.files.AdditionalPic[i].path
          );
          await uploadFileToBunny(
            bunnyFolderName,
            fileStream,
            req.files.AdditionalPic[i].filename
          );
          deleteSingleFile(req.files.AdditionalPic[i].path);
          additionalPic.push({
            fieldName: req.files.AdditionalPic[i].fieldname,
            mimeType: req.files.AdditionalPic[i].mimetype,
            fileName: req.files.AdditionalPic[i].filename,
            url: `${process.env.SHOW_BUNNY_FILE_HOSTNAME}/${bunnyFolderName}/${req.files.AdditionalPic[i].filename}`,
            blogId: blog.id,
          });
        }
        // Store in data
        await BlogImage.bulkCreate(additionalPic, { returning: true });
      }
    }
    res.status(200).json({
      success: true,
      message: "Blog created successfully!",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err,
    });
  }
};

exports.addUpdateFeaturedPic = async (req, res) => {
  try {
    // File should be exist
    if (!req.file) {
      return res.status(400).send({
        success: false,
        message: "Please..upload a profile image!",
      });
    }

    //Upload file to bunny
    const fileStream = fs.createReadStream(req.file.path);
    await uploadFileToBunny(bunnyFolderName, fileStream, req.file.filename);
    deleteSingleFile(req.file.path);
    const featuredPic = {
      fileName: req.file.filename,
      url: `${process.env.SHOW_BUNNY_FILE_HOSTNAME}/${bunnyFolderName}/${req.file.filename}`,
      fieldName: req.file.fieldname,
      mimeType: req.file.mimetype,
      blogId: req.params.id,
    };

    const isPic = await BlogImage.findOne({
      where: { fieldName: "FeaturedPic", blogId: req.params.id },
    });
    let message = "Featured pic added successfully!";
    if (isPic) {
      if (isPic.fileName) {
        await deleteFileToBunny(bunnyFolderName, isPic.fileName);
        message = "Featured pic updated successfully!";
      }

      await isPic.update(featuredPic);
    } else {
      await BlogImage.create(featuredPic);
    }
    // Final response
    res.status(200).send({ success: true, message });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteBlogPic = async (req, res) => {
  try {
    const isPic = await BlogImage.findOne({ where: { id: req.params.id } });
    if (!isPic) {
      return res.status(400).json({
        success: false,
        message: `This image is not present!`,
      });
    }

    if (isPic.fileName) {
      await deleteFileToBunny(bunnyFolderName, isPic.fileName);
    }

    await isPic.destroy();
    // Final response
    res.status(200).send({
      success: true,
      message: `${isPic.fieldName} deleted successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.addAdditionalPic = async (req, res) => {
  try {
    // File should be exist
    if (!req.files) {
      return res.status(400).send({
        success: false,
        message: "Please..upload atleast an additional image!",
      });
    }

    const isBlog = await Blog.findOne({ where: { id: req.params.id } });
    if (!isBlog) {
      return res.status(400).json({
        success: false,
        message: `This blog is not present!`,
      });
    }
    const additionalPic = await BlogImage.findAll({
      where: { fieldName: "AdditionalPic", blogId: req.params.id },
    });
    const maxFileUpload = 20;
    const currentUploadedPics = additionalPic.length;
    const fileCanUpload = maxFileUpload - currentUploadedPics;
    let fileUploaded = 0;

    const data = [];
    //Upload file to bunny
    for (let i = 0; i < req.files.length; i++) {
      if (i < fileCanUpload) {
        //Upload file
        const fileStream = fs.createReadStream(req.files[i].path);
        await uploadFileToBunny(
          bunnyFolderName,
          fileStream,
          req.files[i].filename
        );
        data.push({
          url: `${process.env.SHOW_BUNNY_FILE_HOSTNAME}/${bunnyFolderName}/${req.files[i].filename}`,
          blogId: req.params.id,
          fileName: req.files[i].filename,
          mimeType: req.files[i].mimetype,
          fieldName: req.files[i].fieldname,
        });
        fileUploaded = fileUploaded + 1;
      }
      deleteSingleFile(req.files[i].path);
    }

    await BlogImage.bulkCreate(data, { returning: true });
    // Final response
    res.status(200).send({
      success: true,
      message: `${fileUploaded} additional pic added successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    // Body Validation
    const { error } = blogValidation(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const {
      slug,
      title,
      content,
      readTime,
      publishDate,
      status,
      metaTag,
      description,
    } = req.body;
    const isBlog = await Blog.findOne({ where: { id: req.params.id } });
    if (!isBlog) {
      return res.status(400).json({
        success: false,
        message: `This blog is not present!`,
      });
    }
    if (slug !== isBlog.slug) {
      const isSlug = await Blog.findOne({ where: { slug: slug } });
      if (isSlug) {
        return res.status(400).json({
          success: false,
          message: `Slug should be unique!`,
        });
      }
    }
    const data = {
      slug,
      title,
      content,
      readTime,
      publishDate,
      status,
      metaTag,
      description,
    };

    // update
    await isBlog.update(data);
    res.status(200).json({
      success: true,
      message: "Blog updated successfully!",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const isBlog = await Blog.findOne({ where: { id: req.params.id } });
    if (!isBlog) {
      return res.status(400).json({
        success: false,
        message: `This blog is not present!`,
      });
    }

    // Delete Association
    await BlogCategoryAssociaction.destroy({
      where: { blogId: req.params.id },
    });
    await BlogTagAssociation.destroy({ where: { blogId: req.params.id } });

    // Delete Files
    const images = await BlogImage.findAll({
      where: { blogId: req.params.id },
    });
    for (let i = 0; i < images.length; i++) {
      if (images[i].fileName) {
        await deleteFileToBunny(bunnyFolderName, images[i].fileName);
      }
    }
    await BlogImage.destroy({ where: { blogId: req.params.id } });

    // delete
    await isBlog.destroy();
    res.status(200).json({
      success: true,
      message: "Blog deleted successfully!",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.blogSlug = async (req, res) => {
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
    const isBlog = await Blog.findOne({ where: { slug } });
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

exports.publishBlog = async (req, res) => {
  try {
    // Body Validation
    const { error } = publishBlogValidation(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const status = req.body.status;
    const isBlog = await Blog.findOne({ where: { id: req.params.id } });
    if (!isBlog) {
      return res.status(400).json({
        success: false,
        message: `This blog is not present`,
      });
    }

    await isBlog.update({ status });
    res.status(200).json({
      success: true,
      message: `Blog ${status} successfully!`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getBlogs = async (req, res) => {
  try {
    const { limit, page, search, categorySlug, tagSlug } = req.query;
    // Pagination
    const recordLimit = parseInt(limit) || 10;
    let offSet = 0;
    let currentPage = 1;
    if (page) {
      offSet = (parseInt(page) - 1) * recordLimit;
      currentPage = parseInt(page);
    }

    //Search
    const query = [];
    if (search) {
      query.push({
        [Op.or]: [
          { slug: { [Op.startsWith]: search } },
          { title: { [Op.startsWith]: search } },
        ],
      });
    }
    // Filter
    if (tagSlug && categorySlug) {
      // Get All blog related to category
      const tags = await BlogTagAssociation.findAll({
        where: { tagSlug },
      });
      const categorie = await BlogCategoryAssociaction.findAll({
        where: { categorySlug },
      });
      const blogIds = [];
      for (let i = 0; i < tags.length; i++) {
        blogIds.push(tags[i].blogId);
      }
      for (let i = 0; i < categorie.length; i++) {
        blogIds.push(categorie[i].blogId);
      }
      const uniqueArray = [...new Set(blogIds)];
      query.push({ id: uniqueArray });
    } else if (tagSlug) {
      const tags = await BlogTagAssociation.findAll({
        where: { tagSlug },
      });
      const blogIds = [];
      for (let i = 0; i < tags.length; i++) {
        blogIds.push(tags[i].blogId);
      }
      query.push({ id: blogIds });
    } else if (categorySlug) {
      const categorie = await BlogCategoryAssociaction.findAll({
        where: { categorySlug },
      });
      const blogIds = [];
      for (let i = 0; i < categorie.length; i++) {
        blogIds.push(categorie[i].blogId);
      }
      query.push({ id: blogIds });
    }

    const [blog, totalBlogs] = await Promise.all([
      Blog.findAll({
        limit: recordLimit,
        offset: offSet,
        where: { [Op.and]: query },
        include: [
          {
            model: BlogImage,
            as: "images",
            attributes: ["id", "url", "fieldName"],
          },
          {
            model: BlogCategoryAssociaction,
            as: "blogCategory_juction",
            attributes: ["id", "categorySlug", "blogCategoryId"],
          },
          {
            model: BlogTagAssociation,
            as: "blogTag_juction",
            attributes: ["id", "tagSlug", "blogTagId"],
          },
        ],
        order: [["createdAt", "DESC"]],
      }),
      Blog.count({ where: { [Op.and]: query } }),
    ]);

    const totalPages = Math.ceil(totalBlogs / recordLimit) || 0;

    res.status(200).json({
      success: true,
      message: "Blog fetched successfully!",
      data: blog,
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

exports.getBlogBySlug = async (req, res) => {
  try {
    const isBlog = await Blog.findOne({
      where: { slug: req.params.slug },
      include: [
        {
          model: BlogImage,
          as: "images",
          attributes: ["id", "url", "fieldName"],
        },
        {
          model: BlogCategoryAssociaction,
          as: "blogCategory_juction",
          attributes: ["id", "categorySlug", "blogCategoryId"],
        },
        {
          model: BlogTagAssociation,
          as: "blogTag_juction",
          attributes: ["id", "tagSlug", "blogTagId"],
        },
      ],
    });
    if (!isBlog) {
      return res.status(400).json({
        success: false,
        message: `This blog is not present!`,
      });
    }
    // tag
    const tagSlugs = [];
    for (let i = 0; i < isBlog.blogTag_juction.length; i++) {
      tagSlugs.push(isBlog.blogTag_juction[i].tagSlug);
    }
    const tags = await BlogTag.findAll({
      where: { slug: tagSlugs },
      attributes: ["id", "slug", "name", "description"],
    });
    // category
    const categorySlugs = [];
    for (let i = 0; i < isBlog.blogCategory_juction.length; i++) {
      categorySlugs.push(isBlog.blogCategory_juction[i].categorySlug);
    }
    const categories = await BlogCategories.findAll({
      where: { slug: categorySlugs },
      attributes: ["id", "slug", "name", "description", "url"],
    });
    res.status(200).json({
      success: true,
      message: "Blog fetched successfully!",
      data: {
        ...isBlog.dataValues,
        blogTag_juction: tags,
        blogCategory_juction: categories,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getBlogBySlugForUser = async (req, res) => {
  try {
    const today = new Date();
    today.setMinutes(today.getMinutes() + 330);
    const isBlog = await Blog.findOne({
      where: {
        slug: req.params.slug,
        publishDate: { [Op.lt]: today },
        status: "Published",
      },
      include: [
        {
          model: BlogImage,
          as: "images",
          attributes: ["id", "url", "fieldName"],
        },
        {
          model: BlogCategoryAssociaction,
          as: "blogCategory_juction",
          attributes: ["id", "categorySlug", "blogCategoryId"],
        },
        {
          model: BlogTagAssociation,
          as: "blogTag_juction",
          attributes: ["id", "tagSlug", "blogTagId"],
        },
      ],
    });
    if (!isBlog) {
      return res.status(400).json({
        success: false,
        message: `This blog is not present!`,
      });
    }
    // tag
    const tagSlugs = [];
    for (let i = 0; i < isBlog.blogTag_juction.length; i++) {
      tagSlugs.push(isBlog.blogTag_juction[i].tagSlug);
    }
    const tags = await BlogTag.findAll({
      where: { slug: tagSlugs },
      attributes: ["id", "slug", "name", "description"],
    });
    // category
    const categorySlugs = [];
    for (let i = 0; i < isBlog.blogCategory_juction.length; i++) {
      categorySlugs.push(isBlog.blogCategory_juction[i].categorySlug);
    }
    const categories = await BlogCategories.findAll({
      where: { slug: categorySlugs },
      attributes: ["id", "slug", "name", "description", "url"],
    });
    res.status(200).json({
      success: true,
      message: "Blog fetched successfully!",
      data: {
        ...isBlog.dataValues,
        blogTag_juction: tags,
        blogCategory_juction: categories,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getBlogsForUser = async (req, res) => {
  try {
    const today = new Date();
    today.setMinutes(today.getMinutes() + 330);
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
    const query = [
      { publishDate: { [Op.lt]: today } },
      { status: "Published" },
    ];
    if (search) {
      query.push({
        [Op.or]: [
          { slug: { [Op.startsWith]: search } },
          { title: { [Op.startsWith]: search } },
        ],
      });
    }
    const [blog, totalBlogs] = await Promise.all([
      Blog.findAll({
        limit: recordLimit,
        offset: offSet,
        where: { [Op.and]: query },
        include: [
          {
            model: BlogImage,
            as: "images",
            attributes: ["id", "url", "fieldName"],
          },
          {
            model: BlogCategoryAssociaction,
            as: "blogCategory_juction",
            attributes: ["id", "categorySlug", "blogCategoryId"],
          },
          {
            model: BlogTagAssociation,
            as: "blogTag_juction",
            attributes: ["id", "tagSlug", "blogTagId"],
          },
        ],
        order: [["createdAt", "DESC"]],
      }),
      Blog.count({ where: { [Op.and]: query } }),
    ]);

    const totalPages = Math.ceil(totalBlogs / recordLimit) || 0;
    const transform = [];
    for (let i = 0; i < blog.length; i++) {
      const blogCategory_juctions = blog[i].blogCategory_juction;
      const blogCategory_juction = [];
      for (let j = 0; j < blogCategory_juctions.length; j++) {
        const category = await BlogCategories.findOne({
          where: { id: blogCategory_juctions[j].blogCategoryId },
        });
        if (category) {
          blogCategory_juction.push({
            ...blogCategory_juctions[j].dataValues,
            categoryName: category.dataValues.name,
          });
        }
      }
      transform.push({ ...blog[i].dataValues, blogCategory_juction });
    }

    res.status(200).json({
      success: true,
      message: "Blog fetched successfully!",
      data: transform,
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

exports.deleteCategoryFromBlog = async (req, res) => {
  try {
    const blogId = req.body.blogId;
    if (!blogId) {
      return res.status(400).json({
        success: false,
        message: `Select a blog!`,
      });
    }
    const cSlug = req.params.cSlug;
    const isPresent = await BlogCategoryAssociaction.findOne({
      where: { blogId, categorySlug: cSlug },
    });
    if (!isPresent) {
      return res.status(400).json({
        success: false,
        message: `No present`,
      });
    }

    await isPresent.destroy();
    res
      .status(200)
      .json({ success: true, message: `Category removed successfully!` });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteTagFromBlog = async (req, res) => {
  try {
    const blogId = req.body.blogId;
    if (!blogId) {
      return res.status(400).json({
        success: false,
        message: `Select a blog!`,
      });
    }
    const tSlug = req.params.tSlug;
    const isPresent = await BlogTagAssociation.findOne({
      where: { blogId, tagSlug: tSlug },
    });
    if (!isPresent) {
      return res.status(400).json({
        success: false,
        message: `No present`,
      });
    }

    await isPresent.destroy();
    res
      .status(200)
      .json({ success: true, message: `Tag removed successfully!` });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.addCategoryToBlog = async (req, res) => {
  try {
    // Body Validation
    const { error } = addCategoryToBlogValidation(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { blogId, categorys } = req.body;
    const isPresent = await Blog.findOne({ where: { id: blogId } });
    if (!isPresent) {
      return res.status(400).json({
        success: false,
        message: `Blog is not present`,
      });
    }
    //Add category association
    if (categorys) {
      for (let i = 0; i < categorys.length; i++) {
        const [record, isCreated] = await BlogCategoryAssociaction.findOrCreate(
          {
            where: { blogId: blogId, blogCategoryId: categorys[i].id }, // Condition to check if the record exists
            defaults: {
              blogId: blogId,
              blogCategoryId: categorys[i].id,
              categorySlug: categorys[i].slug,
            },
          }
        );
      }
    }
    res
      .status(200)
      .json({ success: true, message: `Categories added successfully!` });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.addTagToBlog = async (req, res) => {
  try {
    // Body Validation
    const { error } = addTagToBlogValidation(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { blogId, tags } = req.body;
    const isPresent = await Blog.findOne({ where: { id: blogId } });
    if (!isPresent) {
      return res.status(400).json({
        success: false,
        message: `Blog is not present`,
      });
    }
    //Add tag association
    if (tags) {
      for (let i = 0; i < tags.length; i++) {
        const [record, isCreated] = await BlogTagAssociation.findOrCreate({
          where: { blogId: blogId, blogTagId: tags[i].id }, // Condition to check if the record exists
          defaults: {
            blogId: blogId,
            blogTagId: tags[i].id,
            tagSlug: tags[i].slug,
          },
        });
      }
    }
    res
      .status(200)
      .json({ success: true, message: `Tags added successfully!` });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
