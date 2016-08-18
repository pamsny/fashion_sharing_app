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
      {name : "outfit 1", image:"https://stocksnap.io/photo/BD31KHIDA7"},
      {name : "outfit 2", image:"https://stocksnap.io/photo/B6CADUCNVG"},
      {name : "outfit 3", image:"https://unsplash.com/search/fashion?photo=6SB3h9eKZ04"}
    ]
  res.render("myfeed", {myfeed:myfeed});
});








app.listen(3000, function(){
  console.log("this app has started!");
});
