module.exports = (sequelize, DataTypes) => {
    const PreviousStockPortfolio = sequelize.define("previousStockPortfolios", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        stockName: {
            type: DataTypes.STRING
        },
        buyingPrice: {
            type: DataTypes.STRING
        },
        investmentDate: {
            type: DataTypes.DATEONLY
        },
        currentMarketValue: {
            type: DataTypes.STRING
        },
        shareQuantity: {
            type: DataTypes.INTEGER
        },
        exitDate: {
            type: DataTypes.DATEONLY
        }
    })
    return PreviousStockPortfolio;
}

// userId
// stockId