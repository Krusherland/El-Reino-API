const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/user");
const Auth = require("../Middlewares/Auth");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/avatars/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploads = multer({ storage: storage });

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/prueba", Auth.auth, UserController.pruebaUser);
router.get("/profile/:id", Auth.auth, UserController.profile);
router.get("/list/:page", Auth.auth, UserController.list);
router.put("/update", Auth.auth, UserController.update);
router.post(
  "/upload",
  [Auth.auth, uploads.single("avatar")],
  UserController.uploadAvatar
);
router.get("/avatar/:file", UserController.avatar);
router.get("/counters/:id", Auth.auth, UserController.counter);

module.exports = router;
