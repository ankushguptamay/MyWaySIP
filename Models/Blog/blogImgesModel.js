module.exports = (sequelize, DataTypes) => {
  const BlogImage = sequelize.define("blogImages", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fieldName: {
      type: DataTypes.STRING,
    },
    mimeType: {
      type: DataTypes.STRING,
    },
    url: {
      type: DataTypes.STRING(1234),
    },
    fileName: {
      type: DataTypes.STRING(1234),
    },
  });
  return BlogImage;
};
