const express = require("express");
const router = express.Router();
const ScrollController = require("../Controllers/scroll");
const Auth = require("../Middlewares/Auth");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/scrolls/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploads = multer({ storage: storage });

router.get("/prueba", ScrollController.pruebaScroll);
router.post("/save", Auth.auth, ScrollController.save);
router.get("/detail/:id", Auth.auth, ScrollController.detail);
router.delete("/remove/:id", Auth.auth, ScrollController.remove);
router.get("/scrolls/:id", Auth.auth, ScrollController.scrolls);
router.post(
  "/upload/:id",
  [Auth.auth, uploads.single("file")],
  ScrollController.uploadScroll
);
router.get("/media/:file", ScrollController.media);
router.get("/feed/:page", Auth.auth, ScrollController.feed);
router.get("/all/:page", Auth.auth, ScrollController.all);
router.get("/all", Auth.auth, ScrollController.all);

module.exports = router;
