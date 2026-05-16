const multer = require("multer");
const AppError = require("../utils/AppError");
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Only images are allowed", 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter
});

module.exports = upload;