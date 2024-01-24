module.exports = (sequelize, DataTypes) => {
    const User_Service = sequelize.define("user_services", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        amount: {
            type: DataTypes.STRING
        },
        currency: {
            type: DataTypes.STRING
        },
        receipt: {
            type: DataTypes.STRING
        },
        razorpayOrderId: {
            type: DataTypes.STRING
        },
        razorpayPaymentId: {
            type: DataTypes.STRING
        },
        razorpayTime: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Created', 'Paid']]
            }
        },
        verify: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        serviceId: {
            type: DataTypes.STRING
        },
        userId: {
            type: DataTypes.STRING
        }
    }, {
        paranoid: true
    });
    return User_Service;
};