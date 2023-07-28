const router = require('express').Router();

const mongoose = require('mongoose');
const fileUploader = require('../config/cloudinary.config');
const User = require('../models/User.model');
const nodemailer = require('nodemailer');

router.get('/climbers', async (req, res, next) => {
  try {
    const allClimbers = await User.find({});
    res.json({ allClimbers });
  } catch (error) {
    console.log('An error occurred getting all climbers', error);
    next(error);
  }
});

router.get('/climbers/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Specified  id is is not valid' });
    }
    const climber = await User.findById(id).populate('favourites');
    console.log(climber);
    if (!climber) {
      return res.status(404).json({ message: 'No user found with this id' });
    }

    res.json(climber);
  } catch (error) {
    console.log('An error occured fetching the profile', error);
    next(error);
  }
});
// user's ID available in req.user.id after authentication

router.post('/upload', fileUploader.single('file'), async (req, res, next) => {
  try {
    // Update the user's imageUrl field with the uploaded image URL
    const userId = req.user.id; // Assuming you have the user's ID available after authentication
    const imageUrl = req.file.path; // This should be the URL to access the uploaded image on the server

    // Update the user's record in the database with the new imageUrl
    // await User.findByIdAndUpdate(userId, { imageUrl });

    res.json({ imageUrl }); // Respond with the image URL
  } catch (error) {
    res.status(500).json({ message: 'An error occurred uploading the image' });
    next(error);
  }
});

const EMAIL_USER = 'ettygofretti@gmail.com';
const EMAIL_PASSWORD = '';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD
  }
});
router.post('/send-email', async (req, res) => {
  try {
    const { toEmail, subject, message } = req.body;

    const mailOptions = {
      from: EMAIL_USER,
      to: toEmail,
      subject: subject,
      text: message
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

module.exports = router;
