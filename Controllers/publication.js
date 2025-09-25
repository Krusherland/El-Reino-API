const Publication = require("../Models/publication");
const fs = require("fs");
const path = require("path");
const followService = require("../Services/followService");

const pruebaPublication = (req, res) => {
  return res.status(200).send({
    message: "Publication endpoint working",
  });
};

const save = async (req, res) => {
  const params = req.body;
  if (!params.text) {
    return res.status(400).send({
      message: "You must send the text of the publication",
    });
  }

  try {
    let publication = new Publication(params);
    publication.user = req.user.id;
    const publicationStored = await publication.save();
    
    return res.status(200).send({
      status: "success",
      message: "Publication saved successfully",
      publication: publicationStored,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error saving publication",
    });
  }
};

const detail = async (req, res) => {
  const publicationId = req.params.id;
  
  try {
    const publication = await Publication.findById(publicationId);
    
    if (!publication) {
      return res.status(404).send({
        status: "error",
        message: "Publication not found",
      });
    }
    
    return res.status(200).send({
      status: "success",
      message: "Detail of publication",
      publication,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error fetching publication",
    });
  }
};

const remove = async (req, res) => {
  const publicationId = req.params.id;

  try {
    const publicationRemoved = await Publication.findOneAndDelete({ 
      user: req.user.id, 
      _id: publicationId 
    });
    
    if (!publicationRemoved) {
      return res.status(404).send({
        status: "error",
        message: "Publication not found or you don't have permission to delete it",
      });
    }
    
    return res.status(200).send({
      status: "success",
      message: "Publication removed successfully",
      publication: publicationRemoved,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error deleting publication",
    });
  }
};

const publications = async (req, res) => {
  const userId = req.params.id;
  let page = 1;
  let itemsPerPage = 5;
  if (req.params.page) {
    page = parseInt(req.params.page);
  }

  try {
    const skip = (page - 1) * itemsPerPage;
    
    const publications = await Publication.find({ user: userId })
      .sort("-created_at")
      .populate("user", "-password -__v -role -email")
      .skip(skip)
      .limit(itemsPerPage);

    const total = await Publication.countDocuments({ user: userId });

    if (!publications || publications.length === 0) {
      return res.status(404).send({
        status: "error",
        message: "No publications found",
      });
    }

    return res.status(200).send({
      status: "success",
      message: "List of publications",
      publications,
      page,
      total,
      pages: Math.ceil(total / itemsPerPage),
      itemsPerPage: itemsPerPage,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error fetching publications",
    });
  }
};

const uploadPublication = async (req, res) => {
  const publicationId = req.params.id;

  if (!req.file) {
    return res.status(400).send({
      status: "error",
      message: "No file uploaded",
    });
  }

  let image = req.file.filename;
  let imageSplit = image.split(".");
  let ext = imageSplit[1];

  if (ext !== "png" && ext !== "jpg" && ext !== "jpeg" && ext !== "gif") {
    const file = req.file.path;
    fs.unlink(file, (err) => {
      console.log("Invalid file deleted");
    });
    return res.status(400).send({
      status: "error",
      message: "Invalid file extension",
    });
  }

  try {
    const publicationUpdated = await Publication.findOneAndUpdate(
      { user: req.user.id, _id: publicationId },
      { file: req.file.filename },
      { new: true }
    );
    
    if (!publicationUpdated) {
      return res.status(404).send({
        status: "error",
        message: "Publication not found or you don't have permission to update it",
      });
    }
    
    return res.status(200).send({
      status: "success",
      publication: publicationUpdated,
      file: req.file,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "There was an unexpected error",
    });
  }
};

const media = (req, res) => {
  const file = req.params.file;
  const pathFile = "./uploads/publications/" + file;

  fs.stat(pathFile, (error, exists) => {
    if (!exists) {
      return res.status(404).send({
        status: "error",
        message: "File not found",
      });
    }
    return res.sendFile(path.resolve(pathFile));
  });
};

const feed = async (req, res) => {
  let page = 1;
  let itemsPerPage = 5;

  if (req.params.page) {
    page = parseInt(req.params.page);
  }

  try {
    const myFeed = await followService.followUserId(req.user.id);
    const skip = (page - 1) * itemsPerPage;

    const publications = await Publication.find({
      user: { $in: myFeed.following },
    })
      .sort("-created_at")
      .populate("user", "-password -role -__v -email")
      .skip(skip)
      .limit(itemsPerPage);

    const total = await Publication.countDocuments({
      user: { $in: myFeed.following },
    });

    if (!publications || publications.length === 0) {
      return res.status(404).send({
        status: "error",
        message: "No publications found in feed",
      });
    }

    return res.status(200).send({
      status: "success",
      message: "List of publications",
      following: myFeed.following,
      publications,
      page,
      total,
      pages: Math.ceil(total / itemsPerPage),
      itemsPerPage: itemsPerPage,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error fetching feed",
    });
  }
};

module.exports = {
  pruebaPublication,
  save,
  detail,
  remove,
  publications,
  uploadPublication,
  media,
  feed,
};
