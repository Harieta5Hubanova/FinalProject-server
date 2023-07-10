const router = require('express').Router();

const mongoose = require('mongoose');
const fileUploader = require('../config/cloudinary.config');
const User = require('../models/User.model');

router.get('/climbers', async (req, res, next) => {
  try {
    const allClimbers = await User.find({}, 'name');
    res.json({ allClimbers });
  } catch (error) {
    console.log('An error occurred getting all climbers', error);
    next(error);
  }
});
router.post('/upload', fileUploader.single('file'), (req, res, next) => {
  try {
    res.json({ fileUrl: req.file.path });
  } catch (error) {
    res.status(500).json({ message: 'An error occured uploading the image' });
    next(error);
  }
});

module.exports = router;
