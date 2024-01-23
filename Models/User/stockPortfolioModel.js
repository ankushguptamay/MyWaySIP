module.exports = (sequelize, DataTypes) => {
    const StockPortfolio = sequelize.define("stockPortfolios", {
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
        exitDate: {
            type: DataTypes.DATEONLY
        }
    }, {
        paranoid: true
    })
    return StockPortfolio;
}