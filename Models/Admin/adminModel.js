module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define("admin", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        mobileNumber: {
            type: DataTypes.STRING,
            unique: true
        },
        password:{
            type:DataTypes.STRING
        }
    })
    return Admin;
}