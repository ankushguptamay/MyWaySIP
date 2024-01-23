module.exports = (sequelize, DataTypes) => {
    const RequiredQuestionResult = sequelize.define("requiredQuestionResults", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        result: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['Aggresive', 'Conservative', 'Balanced']]
            },
            allowNull: false
        },
        obtainPoints: {
            type: DataTypes.STRING
        }
    })
    return RequiredQuestionResult;
}

// userId