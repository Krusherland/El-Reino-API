const express = require("express");
const router = express.Router();
const ScrollController = require("../Controllers/scroll");
const Auth = require("../Middlewares/Auth");
const { uploadScroll } = require("../Middlewares/upload");

// Test endpoint
router.get("/prueba", ScrollController.pruebaScroll);

// Test upload endpoint (to verify multer is working)
router.post("/upload-test", (req, res) => {
  return res.status(200).json({
    status: "success",
    message: "Upload endpoint is reachable",
    headers: req.headers,
    hasAuth: !!req.headers.authorization
  });
});

// Create scroll (text only)
router.post("/save", Auth.auth, ScrollController.save);

// Create scroll with optional image (NEW - recommended endpoint)
router.post("/upload", Auth.auth, uploadScroll.single("file"), ScrollController.uploadWithImage);

// Get scroll details
router.get("/detail/:id", Auth.auth, ScrollController.detail);

// Delete scroll
router.delete("/remove/:id", Auth.auth, ScrollController.remove);

// Get user's scrolls
router.get("/scrolls/:id", Auth.auth, ScrollController.scrolls);

// Legacy: Update existing scroll with image (kept for backward compatibility)
router.post(
  "/upload/:id",
  Auth.auth,
  uploadScroll.single("file"),
  ScrollController.uploadScroll
);

// Serve scroll images
router.get("/media/:file", ScrollController.media);

// Get feed scrolls (from followed users)
router.get("/feed/:page", Auth.auth, ScrollController.feed);

// Get all scrolls from all users
router.get("/all/:page", Auth.auth, ScrollController.all);
router.get("/all", Auth.auth, ScrollController.all);

module.exports = router;
