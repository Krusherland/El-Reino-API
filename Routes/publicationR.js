const express = require("express");
const router = express.Router();
const PublicationController = require("../Controllers/publication");
const Auth = require("../Middlewares/Auth");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/publications/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploads = multer({ storage: storage });

router.get("/prueba", PublicationController.pruebaPublication);
router.post("/save", Auth.auth, PublicationController.save);
router.get("/detail/:id", Auth.auth, PublicationController.detail);
router.delete("/remove/:id", Auth.auth, PublicationController.remove);
router.get("/publications/:id", Auth.auth, PublicationController.publications);
router.post(
  "/upload/:id",
  [Auth.auth, uploads.single("file")],
  PublicationController.uploadPublication
);
router.get("/media/:file", PublicationController.media);
router.get("/feed/:page", Auth.auth, PublicationController.feed);

module.exports = router;
