module.exports = (sequelize, DataTypes) => {
    const BlogTagAssociation = sequelize.define("blogTagAssociations", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      tagSlug: {
        type: DataTypes.STRING,
      }
    });
    return BlogTagAssociation;
  };
  