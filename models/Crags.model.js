const { Schema, model } = require('mongoose');
const cragsSchema = new Schema(
  {
    name: String,
    country: String,
    coordinates: { latitude: String, longitude: String },
    grade: String,

    imageUrl: String,
    description: String,
    area: { type: Schema.Types.ObjectId, ref: 'Area' },
    comment: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    published: { type: Boolean, default: false },
    likeCount: Number
  },
  {
    timestamps: true
  }
);

const cragsModel = model('Crags', cragsSchema);

module.exports = cragsModel;
