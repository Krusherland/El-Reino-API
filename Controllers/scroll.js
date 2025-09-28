const Scroll = require("../Models/scroll");
const fs = require("fs");
const path = require("path");
const followService = require("../Services/followService");

const pruebaScroll = (req, res) => {
  return res.status(200).send({
    message: "Scroll endpoint working",
  });
};

const save = async (req, res) => {
  const params = req.body;
  if (!params.text) {
    return res.status(400).send({
      message: "You must send the text of the scroll",
    });
  }

  try {
    let scroll = new Scroll(params);
    scroll.user = req.user.id;
    const scrollStored = await scroll.save();
    
    return res.status(200).send({
      status: "success",
      message: "Scroll saved successfully",
      scroll: scrollStored,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error saving scroll",
    });
  }
};

const detail = async (req, res) => {
  const scrollId = req.params.id;
  
  try {
    const scroll = await Scroll.findById(scrollId);
    
    if (!scroll) {
      return res.status(404).send({
        status: "error",
        message: "Scroll not found",
      });
    }
    
    return res.status(200).send({
      status: "success",
      message: "Detail of scroll",
      scroll,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error fetching scroll",
    });
  }
};

const remove = async (req, res) => {
  const scrollId = req.params.id;

  try {
    const scrollRemoved = await Scroll.findOneAndDelete({ 
      user: req.user.id, 
      _id: scrollId 
    });
    
    if (!scrollRemoved) {
      return res.status(404).send({
        status: "error",
        message: "Scroll not found or you don't have permission to delete it",
      });
    }
    
    return res.status(200).send({
      status: "success",
      message: "Scroll removed successfully",
      scroll: scrollRemoved,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error deleting scroll",
    });
  }
};

const scrolls = async (req, res) => {
  const userId = req.params.id;
  let page = 1;
  let itemsPerPage = 5;
  if (req.params.page) {
    page = parseInt(req.params.page);
  }

  try {
    const skip = (page - 1) * itemsPerPage;
    
    const scrolls = await Scroll.find({ user: userId })
      .sort("-created_at")
      .populate("user", "-password -__v -role -email")
      .skip(skip)
      .limit(itemsPerPage);

    const total = await Scroll.countDocuments({ user: userId });

    if (!scrolls || scrolls.length === 0) {
      return res.status(404).send({
        status: "error",
        message: "No scrolls found",
      });
    }

    return res.status(200).send({
      status: "success",
      message: "List of scrolls",
      scrolls,
      page,
      total,
      pages: Math.ceil(total / itemsPerPage),
      itemsPerPage: itemsPerPage,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error fetching scrolls",
    });
  }
};

const uploadScroll = async (req, res) => {
  const scrollId = req.params.id;

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
    const scrollUpdated = await Scroll.findOneAndUpdate(
      { user: req.user.id, _id: scrollId },
      { file: req.file.filename },
      { new: true }
    );
    
    if (!scrollUpdated) {
      return res.status(404).send({
        status: "error",
        message: "Scroll not found or you don't have permission to update it",
      });
    }
    
    return res.status(200).send({
      status: "success",
      scroll: scrollUpdated,
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
  const pathFile = "./uploads/scrolls/" + file;

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

    const scrolls = await Scroll.find({
      user: { $in: myFeed.following },
    })
      .sort("-created_at")
      .populate("user", "-password -role -__v -email")
      .skip(skip)
      .limit(itemsPerPage);

    const total = await Scroll.countDocuments({
      user: { $in: myFeed.following },
    });

    if (!scrolls || scrolls.length === 0) {
      return res.status(404).send({
        status: "error",
        message: "No scrolls found in feed",
      });
    }

    return res.status(200).send({
      status: "success",
      message: "List of scrolls",
      following: myFeed.following,
      scrolls,
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

const all = async (req, res) => {
  let page = 1;
  let itemsPerPage = 10;

  if (req.params.page) {
    page = parseInt(req.params.page);
  } else if (req.query.page) {
    page = parseInt(req.query.page);
  }

  try {
    const skip = (page - 1) * itemsPerPage;

    // Get ALL scrolls from ALL users (for Dungeons main page)
    const scrolls = await Scroll.find({})
      .sort("-created_at")
      .populate("user", "-password -role -__v -email")
      .skip(skip)
      .limit(itemsPerPage);

    const total = await Scroll.countDocuments({});

    if (!scrolls || scrolls.length === 0) {
      return res.status(404).send({
        status: "error",
        message: "No scrolls found",
      });
    }

    return res.status(200).send({
      status: "success",
      message: "All scrolls from the kingdom",
      scrolls,
      page,
      total,
      pages: Math.ceil(total / itemsPerPage),
      itemsPerPage: itemsPerPage,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error fetching all scrolls",
    });
  }
};

module.exports = {
  pruebaScroll,
  save,
  detail,
  remove,
  scrolls,
  uploadScroll,
  media,
  feed,
  all,
};
