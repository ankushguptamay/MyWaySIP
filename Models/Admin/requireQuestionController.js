module.exports = (sequelize, DataTypes) => {
    const RequiredQuestion = sequelize.define("requiredQuestions", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        questionTitle: {
            type: DataTypes.STRING
        },
        question: {
            type: DataTypes.STRING
        },
        options: {
            type: DataTypes.JSON
        },
        points: {
            type: DataTypes.JSON
        }
    })
    return RequiredQuestion;
}

// points:{
//     pointA:1,
//     pointB:1,
//     pointC:1
// }