module.exports = (sequelize, DataTypes) => {
  const BlogTag = sequelize.define(
    "blogTags",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.STRING(1234),
      }
    }
  );
  return BlogTag;
};
