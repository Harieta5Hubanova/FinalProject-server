const { Schema, model } = require('mongoose');

const areaSchema = new Schema({
  name: String,
  country: String,
  imageUrl: String,
  description: String
});

const areaModel = model('Area', areaSchema);

module.exports = areaModel;
