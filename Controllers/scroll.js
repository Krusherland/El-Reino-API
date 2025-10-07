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
  
  if (!params.text || params.text.trim().length === 0) {
    return res.status(400).send({
      status: "error",
      message: "El texto del pergamino es requerido",
    });
  }

  if (params.text.length > 500) {
    return res.status(400).send({
      status: "error",
      message: "El texto no puede exceder 500 caracteres",
    });
  }

  try {
    let scroll = new Scroll({
      user: req.user.id,
      text: params.text.trim()
    });
    
    const scrollStored = await scroll.save();
    const scrollPopulated = await Scroll.findById(scrollStored._id)
      .populate('user', '-password -role -__v -email');
    
    return res.status(200).send({
      status: "success",
      message: "Pergamino creado exitosamente",
      scroll: scrollPopulated,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al guardar el pergamino",
    });
  }
};

// New method: Upload scroll with image
const uploadWithImage = async (req, res) => {
  try {
    console.log('=== Upload With Image Request ===');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    console.log('User:', req.user);

    const { text } = req.body;
    const userId = req.user.id;
    const file = req.file;

    // Validate text
    if (!text || text.trim().length === 0) {
      console.log('Validation failed: Text is required');
      // Delete uploaded file if text validation fails
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({
        status: 'error',
        message: 'El texto del pergamino es requerido'
      });
    }

    if (text.length > 500) {
      console.log('Validation failed: Text too long');
      // Delete uploaded file if text validation fails
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({
        status: 'error',
        message: 'El texto no puede exceder 500 caracteres'
      });
    }

    // Create scroll with optional image
    const newScroll = new Scroll({
      user: userId,
      text: text.trim(),
      file: file ? file.filename : null
    });

    console.log('Saving scroll:', newScroll);
    const scrollSaved = await newScroll.save();
    const scrollPopulated = await Scroll.findById(scrollSaved._id)
      .populate('user', '-password -role -__v -email');

    console.log('Scroll saved successfully:', scrollPopulated);
    return res.status(200).json({
      status: 'success',
      message: 'Pergamino creado exitosamente',
      scroll: scrollPopulated
    });

  } catch (error) {
    console.error('Error in uploadWithImage:', error);
    // Delete uploaded file if database save fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      status: 'error',
      message: 'Error al guardar el pergamino con imagen',
      error: error.message
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
    // First find the scroll to check ownership and get file info
    const scroll = await Scroll.findById(scrollId);

    if (!scroll) {
      return res.status(404).send({
        status: "error",
        message: "Pergamino no encontrado",
      });
    }

    // Check ownership
    if (scroll.user.toString() !== req.user.id) {
      return res.status(403).send({
        status: "error",
        message: "No tienes permiso para eliminar este pergamino",
      });
    }

    // Delete image file if exists
    if (scroll.file) {
      const filePath = path.join(__dirname, '../uploads/scrolls/', scroll.file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete scroll from database
    await Scroll.findByIdAndDelete(scrollId);
    
    return res.status(200).send({
      status: "success",
      message: "Pergamino eliminado exitosamente",
      scroll: scroll,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al eliminar el pergamino",
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
  try {
    const { file } = req.params;
    const filePath = path.join(__dirname, '../uploads/scrolls/', file);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 'error',
        message: 'Imagen no encontrada'
      });
    }

    // Send file
    return res.sendFile(path.resolve(filePath));

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error al cargar la imagen'
    });
  }
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
  uploadWithImage,  // New method for creating scrolls with images
  detail,
  remove,
  scrolls,
  uploadScroll,     // Keep old method for backward compatibility
  media,
  feed,
  all,
};
