const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: false
  },
  surname: {
    type: String,
    required: false
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  role: {
    type: String,
    default: 'regular'
  },
  imageUrl: String,
  country: String,
  city: String,
  dob: { type: String, required: false },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Pro'], // Add other possible values
    required: false
  },
  equipment: Boolean,
  favourites: [{ type: Schema.Types.ObjectId, ref: 'Crags' }]
});
const User = model('User', userSchema);

module.exports = User;
