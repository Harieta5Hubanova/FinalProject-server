const { Schema, model } = require('mongoose');

const commentSchema = new Schema({
  author: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comment: String
});

const commentModel = model('Comment', commentSchema);

module.exports = commentModel;
