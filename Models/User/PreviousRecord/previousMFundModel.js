module.exports = (sequelize, DataTypes) => {
    const PreviousMutualFund = sequelize.define("previousMutualFunds", {
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
        exitDate: {
            type: DataTypes.DATEONLY
        },
        lastAnalysisDate: {
            type: DataTypes.DATE
        },
        pdf_originalName: {
            type: DataTypes.STRING
        },
        pdf_fileName: {
            type: DataTypes.STRING
        },
        pdf_path: {
            type: DataTypes.STRING(1234)
        }
    })
    return PreviousMutualFund;
}

// userId
// mFundId