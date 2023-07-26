const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fileUploader = require('../config/cloudinary.config');

// ℹ️ Handles password encryption
const bcrypt = require('bcrypt');

// ℹ️ Handles password encryption
const jwt = require('jsonwebtoken');

// Require the User model in order to interact with the database
const User = require('../models/User.model');

// Require necessary (isAuthenticated) middleware in order to control access to specific routes
const { isAuthenticated } = require('../middleware/jwt.middleware.js');

// How many rounds should bcrypt run the salt (default - 10 rounds)
const saltRounds = 10;

// POST /auth/signup  - Creates a new user in the database
router.post('/signup', (req, res, next) => {
  const { email, password } = req.body;

  // Check if email or password o are provided as empty strings
  if (email === '' || password === '') {
    res.status(400).json({ message: 'Provide email and password' });
    return;
  }

  // This regular expression check that the email is of a valid format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: 'Provide a valid email address.' });
    return;
  }

  // This regular expression checks password for special characters and minimum length
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.'
    });
    return;
  }

  // Check the users collection if a user with the same email already exists
  User.findOne({ email })
    .then(foundUser => {
      // If the user with the same email already exists, send an error response
      if (foundUser) {
        res.status(400).json({ message: 'User already exists.' });
        return;
      }

      // If email is unique, proceed to hash the password
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // Create the new user in the database
      // We return a pending promise, which allows us to chain another `then`
      return User.create({ email, password: hashedPassword });
    })
    .then(createdUser => {
      // Deconstruct the newly created user object to omit the password
      // We should never expose passwords publicly
      const { email, _id } = createdUser;

      // Create a new object that doesn't expose the password
      const user = { email, _id };

      // Create an object that will be set as the token payload
      const payload = { _id, email };

      // Create a JSON Web Token and sign it
      const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
        algorithm: 'HS256',
        expiresIn: '6h'
      });

      // Send a json response containing the user object
      res.status(201).json({ user: user, authToken });
    })
    .catch(err => next(err)); // In this case, we send error handling to the error handling middleware.
});

// POST  /auth/login - Verifies email and password and returns a JWT
router.post('/login', (req, res, next) => {
  const { email, password } = req.body;

  // Check if email or password are provided as empty string
  if (email === '' || password === '') {
    res.status(400).json({ message: 'Provide email and password.' });
    return;
  }

  // Check the users collection if a user with the same email exists
  User.findOne({ email })
    .then(foundUser => {
      if (!foundUser) {
        // If the user is not found, send an error response
        res.status(401).json({ message: 'User not found.' });
        return;
      }

      // Compare the provided password with the one saved in the database
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        // Deconstruct the user object to omit the password
        const { _id, email, name, imageUrl, role, favourites } = foundUser;

        // Create an object that will be set as the token payload

        const payload = { _id, email, name, imageUrl, role, favourites };

        // Create a JSON Web Token and sign it
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: 'HS256',
          expiresIn: '6h'
        });

        // Send the token as the response
        res.status(200).json({ authToken: authToken, ...payload });
      } else {
        res.status(401).json({ message: 'Unable to authenticate the user' });
      }
    })
    .catch(err => next(err)); // In this case, we send error handling to the error handling middleware.
});

// GET  /auth/verify  -  Used to verify JWT stored on the client
router.get('/verify', isAuthenticated, (req, res, next) => {
  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and is made available on `req.payload`
  console.log(`req.payload`, req.payload);

  // Send back the token payload object containing the user data
  res.status(200).json(req.payload);
});

router.put('/profile', isAuthenticated, async (req, res, next) => {
  try {
    const { _id } = req.payload;
    const { name, surname, imageUrl, country, city, dob, level, equipment } =
      req.body;

    console.log(equipment);

    // Check if the provided id is a valid mongoose id
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(404).json({ message: 'Specified id is not valid' });
    }

    const defaultImage = `https://ui-avatars.com/api/?name=${name[0]}${surname[0]}`;

    let image;

    if (imageUrl) {
      image = imageUrl;
    } else {
      image = defaultImage;
    }

    const updatedProfile = await User.findByIdAndUpdate(
      _id,
      { name, surname, imageUrl: image, country, city, dob, level, equipment },
      { new: true } // We need to pass this to receive the updated value
    );

    if (!updatedProfile) {
      return res
        .status(404)
        .json({ message: 'No profile found with specific id' });
    }

    res.json(updatedProfile);
  } catch (error) {
    console.log('An error occurred updating the profile', error);
    // next(error);
  }
});

module.exports = router;
