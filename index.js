const {connection} = require("./DBModel/dbmodel");
const express = require("express");
const cors = require("cors");

connection();  

const app = express();
const port = 3100;

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const UserRouter = require("./Routes/userR");

const ScrollRouter = require("./Routes/scrollR");

const FollowRouter = require("./Routes/followR");

app.use("/net/user", UserRouter);
app.use("/net/scroll", ScrollRouter);
app.use("/net/follow", FollowRouter);

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "This is where it all begins"
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});