module.exports = (sequelize, DataTypes) => {
    const AnalysisReport = sequelize.define("analysisReports", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        report_FileName: {
            type: DataTypes.STRING(1234)
        },
        report_OriginalName: {
            type: DataTypes.STRING
        },
        reportt_Path: {
            type: DataTypes.STRING(1234)
        },
        report_MimeType: {
            type: DataTypes.STRING
        },
        serviceId: {
            type: DataTypes.STRING
        },
        userId: {
            type: DataTypes.STRING
        },
        uploadDate:{
            type: DataTypes.DATE
        }
    })
    return AnalysisReport;
}