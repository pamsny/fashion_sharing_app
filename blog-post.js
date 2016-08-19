var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BlogPostSchema = new Schema({
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    author: { type: String, required: true, trim: true },
    published: { type: Boolean, required: true, default: false },
    createdAt: { type: Number },
    updatedAt: {type: Number },
});

// update timestamps on save
BlogPostSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    if (this.isNew) this.createdAt = this.updatedAt;
    next();
});

// create and export our model
module.exports = mongoose.model('BlogPost', BlogPostSchema);
