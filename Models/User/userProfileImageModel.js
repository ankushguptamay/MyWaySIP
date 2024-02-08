module.exports = (sequelize, DataTypes) => {
    const ProfileImage = sequelize.define("userProfileImages", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        image_FileName: {
            type: DataTypes.STRING(1234)
        },
        image_OriginalName: {
            type: DataTypes.STRING
        },
        image_Path: {
            type: DataTypes.STRING(1234)
        }
    })
    return ProfileImage;
}

// userId