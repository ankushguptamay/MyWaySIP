module.exports = (sequelize, DataTypes) => {
    const CommentOnService = sequelize.define("commentOnServices", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        comment: {
            type: DataTypes.STRING(1234)
        },
        serviceId: {
            type: DataTypes.STRING
        },
        userId: {
            type: DataTypes.STRING
        }
    }, {
        paranoid: true
    })
    return CommentOnService;
}