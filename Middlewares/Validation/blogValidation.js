const joi = require("joi");

const schemaTags = joi.object({
  id: joi.string().required(),
  slug: joi.string().required(),
});
const schemaCategorys = joi.object({
  id: joi.string().required(),
  slug: joi.string().required(),
});

exports.categoriesValidation = (data) => {
  const schema = joi.object().keys({
    name: joi.string().min(3).required(),
    slug: joi.string().min(3).required(),
    sort_order: joi.number().optional(),
    description: joi.string().min(20).optional(),
  });
  return schema.validate(data);
};

exports.tagValidation = (data) => {
  const schema = joi.object().keys({
    name: joi.string().min(3).required(),
    slug: joi.string().min(3).required(),
    description: joi.string().min(20).optional(),
  });
  return schema.validate(data);
};

exports.blogValidation = (data) => {
  const schema = joi.object().keys({
    slug: joi.string().min(3).required(),
    categorys: joi.array().items(schemaCategorys).optional(),
    tags: joi.array().items(schemaTags).optional(),
    title: joi.string().min(3).required(),
    content: joi.string().required(),
    readTime: joi.string().required(),
    publishDate: joi.string().required(),
    status: joi.string().valid("Draft", "Published").required(),
    metaTag: joi.string().min(20).optional(),
    description: joi.string().min(20).optional(),
    authorName: joi.string().min(3).required(),
  });
  return schema.validate(data);
};

exports.deleteAdditionalPicValidation = (data) => {
  const schema = joi.object().keys({
    additionalPicId: joi.string().required(),
  });
  return schema.validate(data);
};

exports.slugValidation = (data) => {
  const schema = joi.object().keys({
    slug: joi.string().min(3).required(),
  });
  return schema.validate(data);
};

exports.publishBlogValidation = (data) => {
  const schema = joi.object().keys({
    status: joi.string().valid("Draft", "Published", "Unpublish").required(),
  });
  return schema.validate(data);
};

exports.addCategoryToBlogValidation = (data) => {
  const schema = joi.object().keys({
    blogId: joi.string().required(),
    categorys: joi.array().items(schemaCategorys).min(1).optional(),
  });
  return schema.validate(data);
};

exports.addTagToBlogValidation = (data) => {
  const schema = joi.object().keys({
    blogId: joi.string().required(),
    tags: joi.array().items(schemaTags).min(1).optional(),
  });
  return schema.validate(data);
};
