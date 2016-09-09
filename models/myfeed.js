var mongoose = require("mongoose");
var myfeedSchema = new mongoose.Schema({
  name: String,
  description: String,
  Age: String,
  image: String,
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }

  ]
});

module.exports = mongoose.model("Myfeed", myfeedSchema);
