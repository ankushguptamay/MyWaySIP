module.exports = (sequelize, DataTypes) => {
    const MutualFund = sequelize.define("mutualFunds", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        mFSchemeName: {
            type: DataTypes.STRING
        },
        investedSIPAmount: {
            type: DataTypes.STRING
        },
        investedLumSumAmount: {
            type: DataTypes.STRING
        },
        investmentTypeSIP: {
            type: DataTypes.BOOLEAN
        },
        investmentTypeLumSum: {
            type: DataTypes.BOOLEAN
        },
        currentMarketValue: {
            type: DataTypes.STRING
        },
        currentMFundValue: {
            type: DataTypes.STRING
        },
        investmentDate: {
            type: DataTypes.DATEONLY
        },
        pdf_originalName: {
            type: DataTypes.STRING
        },
        pdf_fileName: {
            type: DataTypes.STRING
        },
        pdf_path: {
            type: DataTypes.STRING(1234)
        },
        byPDF: {
            type: DataTypes.BOOLEAN
        },
        byData: {
            type: DataTypes.BOOLEAN
        },
        serviceId: {
            type: DataTypes.STRING
        },
        isAnalysed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        paranoid: true
    })
    return MutualFund;
}