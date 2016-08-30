
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/fashionblog");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
// app.use(express.static("public"));

var myfeedSchema = new mongoose.Schema({
  name: String,
  Age: Number,
  image: String,
});

var Myfeed = mongoose.model("Myfeed", myfeedSchema);

Myfeed.create(
  {
    name: "bethanny",
    age: 25 ,
    image: "https://farm6.staticflickr.com/5003/5347012547_617da5c271.jpg"

  }, function(err, userUpload){
    if(err){
      console.log(err);
    } else {
        console.log("you made a new post");
        console.log(userUpload);
      }
    });


app.get("/", function(req,res){
  res.render("homefeed");
});


app.get("/myfeed", function(req,res){

  Myfeed.find({}, function(err, allmyfeeds){
    if(err){
      console.log(err);
    } else {
      res.render("myfeed", {myfeed: allmyfeeds});
    }
  });
});


app.post("/myfeed", function(req,res){
  var name = req.body.name;
  var image = req.body.image;
  var newMyfeed = {name:name, image:image}
  //to make a new post and add to the feed!!!
Myfeed.create(newMyfeed, function(err, newnewfeed){
  if(err){
    console.log(err);
  } else {
    res.redirect("/myfeed");
  }
    });
});



app.get("/myfeed/new", function(req,res){
  res.render("new.ejs");
});


app.listen(3000, function(){
  console.log("this app has started!");
});
