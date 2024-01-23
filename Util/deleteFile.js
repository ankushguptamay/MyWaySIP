const fs = require('fs');

const deleteSingleFile = (filePath) => {
    if (filePath) {
        fs.unlink(filePath, (err) => {
            if (err) {
                throw (err);
            }
        })
    }
}

const deleteMultiFile = (filePath) => {
    filePath.map(path => {
        if (path) {
            fs.unlink(path, (err) => {
                if (err) {
                    throw (err);
                }
            })
        }
    })
}

module.exports = {
    deleteSingleFile: deleteSingleFile,
    deleteMultiFile: deleteMultiFile
};