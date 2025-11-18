// utils/s3Utils.js
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const FOLDER_NAME = 'trytopapps'; // folder prefix

const getSitemap = async () => {
  try {
    const data = await s3
      .getObject({
        Bucket: BUCKET_NAME,
        Key: `${FOLDER_NAME}/sitemap.xml`,
      })
      .promise();

    return data.Body.toString();
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getSitemap,
};
