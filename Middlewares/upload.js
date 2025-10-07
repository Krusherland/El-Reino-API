const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const scrollUploadsDir = './uploads/scrolls';
if (!fs.existsSync(scrollUploadsDir)) {
  fs.mkdirSync(scrollUploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, scrollUploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random number
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'scroll-' + uniqueSuffix + ext);
  }
});

// File filter for image validation
const fileFilter = (req, file, cb) => {
  // Accept only image files
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPG, PNG, GIF, WEBP)'));
  }
};

// Configure multer with limits and filters
const uploadScroll = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = { uploadScroll };
