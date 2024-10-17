module.exports = (sequelize, DataTypes) => {
  const BlogCategoryAssociaction = sequelize.define(
    "blogCategoryAssociactions",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      categorySlug: {
        type: DataTypes.STRING,
      },
    }
  );
  return BlogCategoryAssociaction;
};
