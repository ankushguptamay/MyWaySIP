const db = require('../../../Models');
const User = db.user;
const ProfileImage = db.profileImage;
const { deleteSingleFile } = require("../../../Util/deleteFile");
const { s3UploadObject, s3DeleteObject } = require("../../../Util/fileToS3");
const fs = require('fs');

exports.addUpdateProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Select an image!"
            })
        }
        const isProfileImage = await ProfileImage.findOne({
            where: {
                userId: req.user.id
            }
        });
        // Uploading S3
        const imagePath = `./Resources/${(req.file.filename)}`
        const fileContent = fs.readFileSync(imagePath);
        const response = await s3UploadObject(req.file.filename, fileContent);
        deleteSingleFile(req.file.path);
        const fileAWSPath = response.Location;
        // Response msg
        let message = "Profile image updated successfully!";
        if (!isProfileImage) {
            // Add profile image
            await ProfileImage.create({
                image_FileName: req.file.filename,
                image_OriginalName: req.file.originalname,
                image_Path: fileAWSPath,
                userId: req.user.id
            });
            message = "Profile image added successfully!";
        } else {
            // Update profile image
            await s3DeleteObject(isProfileImage.image_FileName);
            await isProfileImage.update({
                ...isProfileImage,
                image_FileName: req.file.filename,
                image_OriginalName: req.file.originalname,
                image_Path: fileAWSPath
            });
        }
        res.status(200).send({
            success: true,
            message: message
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            err: err.message
        });
    }
};