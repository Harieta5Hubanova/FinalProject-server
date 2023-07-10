const { Schema, model } = require('mongoose');
const cragsSchema = new Schema(
  {
    name: String,
    country: String,
    coordinates: { latitude: Number, longitude: Number },
    grade: Number,
    imageUrl: [String],
    description: String,
    area: { type: Schema.Types.ObjectId, ref: 'Area' },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
    published: Boolean
  },
  {
    timestamps: true
  }
);

const cragsModel = model('Crags', cragsSchema);

module.exports = cragsModel;
