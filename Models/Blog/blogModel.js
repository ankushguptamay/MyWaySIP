module.exports = (sequelize, DataTypes) => {
  const Blog = sequelize.define("blogs", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    content: {
      type: DataTypes.TEXT,
    },
    description: {
      type: DataTypes.TEXT,
    },
    readTime: {
      type: DataTypes.STRING,
    },
    publishDate: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
    },
    metaTag: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.STRING,
      validate: {
        isIn: [["Draft", "Published", "Unpublish"]],
      },
      defaultValue: "Draft",
    },
    authorName: {
      type: DataTypes.STRING,
    },
  });
  return Blog;
};
