
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Myfeed = require("./models/myfeed");
var Comment = require("./models/comment");
infoDB = require("./info");

infoDB();
mongoose.connect("mongodb://localhost/fashionblog");
// mongoose.connect("mongodb://lola:lola1@ds019906.mlab.com:19906/fashionblog");


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
// app.use(express.static("public"));

//
app.get("/", function(req,res){
  res.render("homefeed");
});

//this is the index route!!!!!!!!!!!!!!!!!!!!!!! get a list of all the feeds.
app.get("/myfeed", function(req,res){

  Myfeed.find({}, function(err, allmyfeeds){
    if(err){
      console.log(err);
    } else {
      res.render("myfeed/index", {myfeed: allmyfeeds});
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
  res.render("myfeed/new.ejs");
});


// SHOW SHOWS MORE INFO ABOUT A PARTICUALR THING!!!!
app.get("/myfeed/:id", function(req, res) {
  //find the campground with provided ID
  //this is a function that mongo give us:
  Myfeed.findById(req.params.id).populate("comments").exec(function(err, foundfeed){
    if(err){
      console.log(err);
    } else {
      console.log(foundfeed)
        //render/show template with that campground
        res.render("myfeed/details", {Myfeed: foundfeed});
        }
      });
  });

// auth routes
//COMMENTS routes
app.get("/myfeed/:id/comments/new", function(req,res){
  //find by id
  Myfeed.findById(req.params.id, function(err, myfeed){
    if(err){
      console.log(err);
    } else {
      res.render("comments/new", {myfeed: myfeed});
    }
  })
});

app.post("/myfeed/:id/comments", function(req,res){
  Myfeed.findById(req.params.id, function(err, myfeed){
    if(err){
      console.log(err);
      res.redirect("/myfeed");
    } else {
      Comment.create(req.body.comment, function(err, comment){
        if(err){
          console.log(err);
        } else {
          myfeed.comments.push(comment);
          myfeed.save();
          res.redirect("/myfeed/" + myfeed._id);
        }
        });
      }
  });
});




// app.listen(3000, function(){
//   console.log("this app has started!");
// });


app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
