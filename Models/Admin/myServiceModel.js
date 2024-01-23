module.exports = (sequelize, DataTypes) => {
    const Service = sequelize.define("services", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        serviceName: {
            type: DataTypes.STRING
        },
        price: {
            type: DataTypes.STRING
        }
    })
    return Service;
}