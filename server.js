var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");


var axios = require("axios");
var cheerio = require("cheerio");


var PORT =  process.env.PORT|| 3000;


var app = express();


var MONGODB_URI=process.env.MONGODB_URI||"mongodb://localhost/Headline";
var db = require("./models");
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));


mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes
var results = [];


app.get("/", function (req, res) {
    
    axios.get("https://www.wsj.com/").then(function (response) {
        
        var $ = cheerio.load(response.data);

        
        $("article").each(function (i, element) {
            console.log(results.length);
            if (results.length > 10) {
                return false;
            }
            
            var result = {};

            
            result.headline = $(element)
                .find("h3")
                .children("a")
                .text()
            result.summary = $(element)
                .find("p")
                .text()
            result.link = $(element)
                .find("h3")
                .children("h3 a")
                .attr("href");
                result.comment = [];
            results.push(result);
            db.Headline.updateOne({
                headline: $(element)
                .find("h3")
                .children("a")
                .text()
            }, result, { upsert: true })
                .then(function (dbHeadline) {
    
                    console.log(dbHeadline);


                })
                .catch(function (err) {=
                    console.log(err);
                })
            
        });

    ]

    });
    db.Headline.find({}).populate("comment")
        .then(function (dbHeadlines) {
            console.log("helloooooo");
            console.log(dbHeadlines);
            res.render("index", { allData: dbHeadlines });
        })
     .catch(function (err) {
         res.json(err);
     })
});
app.get("/article", function (req, res) {
    db.Headline.find({})
        .then(function (dbHeadline) {
            res.render("index", { allData: dbHeadline });
        })
        .catch(function (err) {
            res.json(err);
        })

});
app.post("/comments/:id", function(req, res) {
    console.log(req.body)
    db.Comment.create(req.body)
      .then(function(dbComment) {
          console.log(dbComment);
        
        return db.Headline.findOneAndUpdate({ _id: req.params.id }, {$push:{ comment: dbComment._id}}, { new: true });
      })
      .then(function(data) {
        
        console.log(data);
        db.Article.find({}).populate("comment").then(allData => {
            res.render( "index", {allData: allData} );;
            console.log(allData);
        })
        location.reload();
        
      })
      .catch(function(err) {
        res.json(err);
        
      });
  });




app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
