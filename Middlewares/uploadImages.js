const multer = require("multer");
const path = require("path");

const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb("Please upload only images.", false);
    }
};

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(`${__dirname}/../Resources`));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
uploadImage = multer({ storage: imageStorage, fileFilter: imageFilter });

module.exports = uploadImage;