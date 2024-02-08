const fs = require('fs');

const deleteSingleFile = (filePath) => {
    if (filePath) {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    throw (err);
                }
            })
        }
    }
}

const deleteMultiFile = (filePath) => {
    filePath.map(path => {
        if (path) {
            if (fs.existsSync(path)) {
                fs.unlink(path, (err) => {
                    if (err) {
                        throw (err);
                    }
                });
            }
        }
    })
}

module.exports = {
    deleteSingleFile: deleteSingleFile,
    deleteMultiFile: deleteMultiFile
};