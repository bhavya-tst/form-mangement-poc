import multerS3 from "multer-s3";
import multer from "multer";
import path from "path";
import { s3 } from "../config/aws.js";

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.BUCKET,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueFileName =
        Date.now().toString() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueFileName + path.extname(file.originalname));
    },
    contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically detect content type based on file extension
  }),
});

const deleteFilesFromS3 = (urls) => {
  const keys = urls.map((url) => url.split(`${process.env.BUCKET_URL}/`)[1]);
  const payload = {
    Bucket: process.env.BUCKET,
    Delete: {
      Objects: keys.map((Key) => ({ Key })),
      Quiet: true,
    },
  };
  s3.deleteObjects(payload, (err, data) => {
    if (err) {
      console.error("Error deleting objects:", err);
    } else {
      console.log("Files deleted successfully", data.Deleted);
    }
  });
};

export { upload, deleteFilesFromS3 };
