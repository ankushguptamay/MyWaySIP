const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_BUCKET_NAME } = process.env;
const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION,
});
const s3 = new AWS.S3();

exports.s3UploadObject = (filename, body) => {
    return new Promise((resolve, reject) => {
        const params = {
            Key: filename,
            Body: body,
            Bucket: AWS_BUCKET_NAME,
        };
        s3.upload(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

exports.s3DeleteObject = (filename) => {
    return new Promise((resolve, reject) => {
        const params = {
            Key: filename,
            Bucket: AWS_BUCKET_NAME,
        };

        s3.deleteObject(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};