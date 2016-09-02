
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
  description: String,
  Age: String,
  image: String,
});

var Myfeed = mongoose.model("Myfeed", myfeedSchema);

// Myfeed.create(
//   {
//     name: "bethanny",
//     description: "This outfit is supper cute. you can literally wear anywhere!",
//     age: "25",
//     image: "https://farm6.staticflickr.com/5003/5347012547_617da5c271.jpg",
//
//   }, function(err, userUpload){
//     if(err){
//       console.log(err);
//     } else {
//         console.log("you made a new post");
//         console.log(userUpload);
//       }
//     });


app.get("/", function(req,res){
  res.render("homefeed");
});

//this is the index route!!!!!!!!!!!!!!!!!!!!!!! get a list of all the feeds.
app.get("/myfeed", function(req,res){

  Myfeed.find({}, function(err, allmyfeeds){
    if(err){
      console.log(err);
    } else {
      res.render("index", {myfeed: allmyfeeds});
    }
  });
});

//THIS IS THE CREATE ROUTEE!!!!!!!!
app.post("/myfeed", function(req,res){
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var newMyfeed = {name: name, image: image, description: desc }
  //to make a new post and add to the feed!!!
Myfeed.create(newMyfeed, function(err, newnewfeed){
  if(err){
    console.log(err);
  } else {
    res.redirect("/myfeed");
  }
    });
});


//this is the NEW ROUTE!!!!!!!!!!!!!
app.get("/myfeed/new", function(req, res){
  res.render("new.ejs");
});




// SHOW SHOWS MORE INFO ABOUT A PARTICUALR THING!!!!
app.get("/myfeed/:id", function(req, res) {
  //find the campground with provided ID
  //this is a function that mongo give us:
  Myfeed.findById(req.params.id, function(err, foundfeed){
    if(err){
      console.log(err);
    } else {
        //render/show template with that campground
        res.render("details", {Myfeed: foundfeed});
        }
      });
  })

//auth routes




app.listen(3000, function(){
  console.log("this app has started!");
});
