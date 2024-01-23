module.exports = (sequelize, DataTypes) => {
    const RequiredQuestionAnswer = sequelize.define("requiredQuestionAnswer", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        answer: {
            type: DataTypes.STRING,
            validate: {
                isIn: [['a', 'b', 'c']]
            },
            allowNull: false
        }
    })
    return RequiredQuestionAnswer;
}

// userId
// questionId