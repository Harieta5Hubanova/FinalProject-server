const router = require('express').Router();
const Crags = require('../models/Crags.model');
const Area = require('../models/Area.model');
const User = require('../models/User.model');
const mongoose = require('mongoose');
const fileUploader = require('../config/cloudinary.config');
const { isAuthenticated } = require('../middleware/jwt.middleware');
const Comment = require('../models/Comment.model');

// Create a new

router.post('/add-crag', async (req, res, next) => {
  const { name, imageUrl, coordinates, country, area, grade } = req.body;

  console.log('AREA: ', area);
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

//Retrieves all Crags that have been approved by admin
router.get('/crags', async (req, res, next) => {
  try {
    //we need to populate the tasks to get all the info
    const allCrags = await Crags.find({ published: true }).populate('area');
    res.json(allCrags);
  } catch (error) {
    console.log('An error occurred getting all routes', error);
    next(error);
  }
});
// Retrieves all Crags that are published by regular users
router.get('/unpublished-crags', async (req, res, next) => {
  try {
    //we need to populate the tasks to get all the info
    const allCrags = await Crags.find({ published: false }).populate('area');
    res.json(allCrags);
  } catch (error) {
    console.log('An error occurred getting all routes', error);
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
    const crag = await Crags.findById(id).populate(['area', 'comment']);

    if (!crag) {
      return res
        .status(404)
        .json({ message: 'No climbing route found with this id' });
    }
    res.json(crag);
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

//Comments
router.post('/crags/:id/comments', async (req, res, next) => {
  const { id } = req.params;
  const { author, comment } = req.body;
  try {
    //check if provided id is a valid mongoose id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Spedified id is not valid' });
    }
    const newComment = await Comment.create({
      author: author,
      comment
    });
    const updatedCrag = await Crags.findByIdAndUpdate(
      id,
      {
        $push: {
          comment: newComment._id
        }
      },
      { new: true } //we need to pass this to receive the updated value
    ).populate('comment');
    if (!updatedCrag) {
      return res
        .status(404)
        .json({ message: 'No climbing route found with specific id' });
    }

    res.json(updatedCrag);
  } catch (error) {
    console.log('An error occurred while adding the comment', error);
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
    res.json({ imageUrl: req.file.path });
  } catch (error) {
    res.status(500).json({ message: 'An error occured uploading the image' });
    next(error);
  }
});

//Retrieves Area
router.get('/area', async (req, res, next) => {
  try {
    const allAreas = await Area.find();
    res.json(allAreas);
  } catch (error) {
    console.log('An error occurred getting all areas', error);
    next(error);
  }
});

//Favourites

router.put('/crags/favourites/:id', isAuthenticated, async (req, res, next) => {
  const { id } = req.params;
  const { _id } = req.payload;
  try {
    // Check if provided id is a valid mongoose id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Specified id is not valid' });
    }
    const crag = await Crags.findById(id);
    const user = await User.findById(_id);
    if (!crag) {
      return res.status(404).json({ message: 'Crag not found' });
    }
    // Check if the user has already liked the crag

    if (user.favourites.includes(crag._id)) {
      return;
    }

    await User.findByIdAndUpdate(_id, {
      $push: {
        favourites: crag._id
      }
    });

    const previousCount = crag.likeCount;

    await Crags.findByIdAndUpdate(crag._id, {
      likeCount: previousCount + 1
    });
  } catch (error) {
    console.log('An error occurred getting the favourites', error);
    next(error);
  }
});

//Publish routes as admin
router.put('/unpublished-crags/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Specified id is not valid' });
    }
    await Crags.findByIdAndUpdate(id, {
      published: true
    });

    res.status(201).end();
  } catch (error) {
    console.log('An error occured trying to publish the route', error);
    next(error);
  }
});

/* router.get('/crags/favourites/:id', async (req, res) => {
  const { id } = req.params;
  const { _id } = req.payload;

  try {
    // Check if provided id is a valid mongoose id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Specified id is not valid' });
    }

    const crag = await Crags.findById(id);
    const user = await User.findById(_id);
    if (!crag) {
      return res.status(404).json({ error: 'Crag not found' });
    }

    // Check if the user has already liked the crag
    const isLiked = user.favourites.includes(crag._id);

    if (isLiked) {
      // If the user already liked the crag, remove the like
      await User.findByIdAndUpdate(_id, {
        $pull: { favourites: crag._id }
      });

      // Decrease the crag's like count
      await Crags.findByIdAndUpdate(crag._id, {
        $inc: { likeCount: -1 }
      });
    } else {
      // If the user hasn't liked the crag, add the like
      await User.findByIdAndUpdate(_id, {
        $push: { favourites: crag._id }
      });

      // Increase the crag's like count
      await Crags.findByIdAndUpdate(crag._id, {
        $inc: { likeCount: 1 }
      });
    }

    // Send the updated like count back to the frontend
    const updatedCrag = await Crags.findById(id);
    res.status(200).json({ likesCount: updatedCrag.likeCount });
  } catch (error) {
    console.log('An error occurred while handling the like/unlike', error);
    res.status(500).json({
      error: 'An error occurred while handling the like/unlike operation'
    });
  }
}); */

module.exports = router;
