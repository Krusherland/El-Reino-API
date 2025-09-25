const express = require("express");
const router = express.Router();
const FollowController = require("../Controllers/follow");
const Auth = require("../Middlewares/Auth");

router.get("/prueba", FollowController.pruebaFollow);
router.post("/save", Auth.auth, FollowController.save);
router.delete("/unfollow/:id", Auth.auth, FollowController.unfollow);
router.get("/following/:id/:page", Auth.auth, FollowController.following);
router.get("/followers/:id/:page", Auth.auth, FollowController.followers);

module.exports = router;
