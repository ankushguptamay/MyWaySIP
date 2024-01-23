module.exports = (sequelize, DataTypes) => {
    const AdminNotification = sequelize.define("adminNotification", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        message: {
            type: DataTypes.STRING
        },
        userId: {
            type: DataTypes.STRING
        },
        seenByAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    })
    return AdminNotification;
}