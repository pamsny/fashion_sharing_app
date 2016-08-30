
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
// the userupload will be a collections inside the main fashion blog database

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

// var myfeed = [
//     {name : "outfit 1", image: "https://farm6.staticflickr.com/5003/5347012547_617da5c271.jpg"},
//     {name : "outfit 2", image: "https://farm3.staticflickr.com/2814/12365873205_3207e1e8dd.jpg"},
//     {name : "outfit 3", image: "https://farm6.staticflickr.com/5687/20885624345_41c1e53ae3.jpg"}
// ];

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
  // res.render("myfeed", {myfeed:myfeed});
});


app.post("/myfeed", function(req,res){
  var name = req.body.name;
  var image = req.body.image
  var newMyfeed = {name:name, image:image}
  myfeed.push(newMyfeed);
  //how to pick data in forma and add to posts array
  //then go back to regular list of array
  res.redirect("/myfeed");
  // **here the default is to redirect to myfeed as a GET REQUEST
});

app.get("/myfeed/new", function(req,res){
  res.render("new.ejs");
});


app.listen(3000, function(){
  console.log("this app has started!");
});
