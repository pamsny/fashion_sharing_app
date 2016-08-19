var express = require("express");
var app = express();
var Feed = require('feed');


app.set("view engine", "ejs");
app.use(express.static("public"));


app.get("/", function(req,res){
  res.render("homefeed");
});




app.get("/myfeed", function(req,res){
  var myfeed = [
      {name : "outfit 1", image: "https://farm6.staticflickr.com/5003/5347012547_617da5c271.jpg"},
      {name : "outfit 2", image: "https://farm3.staticflickr.com/2814/12365873205_3207e1e8dd.jpg"},
      {name : "outfit 3", image: "https://farm6.staticflickr.com/5687/20885624345_41c1e53ae3.jpg"}
    ]
  res.render("myfeed", {myfeed:myfeed});
});








app.listen(3000, function(){
  console.log("this app has started!");
});
