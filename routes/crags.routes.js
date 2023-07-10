const router = require('express').Router();
const Crags = require('../models/Crags.model');
const mongoose = require('mongoose');
const fileUploader = require('../config/cloudinary.config');

// Create a new

router.post('/add-crag', async (req, res, next) => {
  const { name, imageUrl, coordinates, country, area, grade } = req.body;

  try {
    const newCrag = await Crags.create({
      name,
      country,
      area,
      imageUrl,
      coordinates,
      grade
    });

    res.json(newCrag);
  } catch (error) {
    console.log('An error occurred creating a new crag', error);
    next(error);
  }
});

//Retrieves all Crags
router.get('/crags', async (req, res, next) => {
  try {
    //we need to populate the tasks to get all the info
    const allCrags = await Crags.find().populate('area');
    res.json(allCrags);
  } catch (error) {
    console.log('An error occurred getting all projects', error);
    next(error);
  }
});

//Retrieves a specific crag by id
router.get('/crags/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    //check if id is valid mongoose id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Specified  id is is not valid' });
    }
    const crag = await Crag.findById(id).populate('area');
    if (!crag) {
      return res
        .status(404)
        .json({ message: 'No climbing route found with this id' });
    }
    res.json(project);
  } catch (error) {
    console.log('An error occured creating the climbing route', error);
    next(error);
  }
});

//Updates a specific route by id
router.put('/crags/:id', async (req, res, next) => {
  const { id } = req.params;
  const { name, area, country, imageUrl, grade } = req.body;
  try {
    //check if provided id is a valid mongoose id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Spedified id is not valid' });
    }
    const updatedCrag = await Crags.findByIdAndUpdate(
      id,
      { name, area, country, imageUrl, grade },
      { new: true } //we need to pass this to receive the updated value
    ).populate('area');
    if (!updatedCrag) {
      return res
        .status(404)
        .json({ message: 'No climbing route found with specific id' });
    }

    res.json(updatedCrag);
  } catch (error) {
    console.log('An error occurred updating the climbing route', error);
    next(error);
  }
});

// deletes the specified crag by id
router.delete('/crags/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    //check valid mongoose id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Specified id is not valid' });
    }
    await Crags.findByIdAndDelete(id);
    res.json({ message: `Route with id ${id} was deleted succcessfully` });
  } catch (error) {
    console.log('An error occurred deleting the route', error);
    next(error);
  }
});

// route that receives the image, sends it to Cloudinary and returns teh imageUrl
router.post('/upload', fileUploader.single('file'), (req, res, next) => {
  try {
    res.json({ fileUrl: req.file.path });
  } catch (error) {
    res.status(500).json({ message: 'An error occured uploading the image' });
    next(error);
  }
});

module.exports = router;
