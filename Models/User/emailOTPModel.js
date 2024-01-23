module.exports = (sequelize, DataTypes) => {
    const UserEmailOTP = sequelize.define("userEmailOTPs", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        otp: {
            type: DataTypes.INTEGER,
        },
        vallidTill: {
            type: DataTypes.STRING
        },
        userId: {
            type: DataTypes.STRING
        }
    })
    return UserEmailOTP;
}

// userId