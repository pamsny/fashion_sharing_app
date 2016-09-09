var mongoose = require("mongoose");
var Myfeed = require("./models/myfeed");
var Comment = require("./models/comment");

var data = [
  {
    name: "Anne marie",
    image: "http://media3.onsugar.com/files/2014/04/15/954/n/4981322/af4fbfb059f53118_Untitled-1.xxxlarge/i/Sydney-Fashion-Blogger-Interview.jpg",
    description: "this outfit is ...."
  },
  {
    name: "Megan",
    image: "http://3m1yvb3ekpj045f9t02a2ryq.wpengine.netdna-cdn.com/wp-content/uploads/2014/09/peaceloveshea-682x1024.jpg",
    desccription: "this outfit is"
  },
  {
    name: "Letty",
    image: "http://media3.popsugar-assets.com/files/2015/07/24/870/n/1922398/2eacc4532e3346c0_Screen_Shot_2015-07-24_at_3.52.35_PMJOoSDO.xxxlarge/i/How-Dress-Like-Fashion-Blogger.jpg",
    desccription: "this outfit is..."
  }

]



function infoDB(){
  //we used this to remove all user posts!
  Myfeed.remove({}, function(err){
    if(err){
      console.log(err);
    }
    console.log("removed a post!");
//to add some new posts
        data.forEach(function(info){
          Myfeed.create(info, function(err, myfeed){
            if(err){
              console.log(err)
            } else {
              console.log("added a new post");
              //create comments for each one
              Comment.create(
                {
                  text: "this is a really cute outfit",
                  author: "delilah"
                }, function(err, comment){
                  if(err){
                    console.log(err);
                  } else {
                    myfeed.comments.push(comment);
                    myfeed.save();
                    console.log("made new comment");
                  }

                });
              }
          });
        });
      });
//to add some comments

}
module.exports = infoDB;
