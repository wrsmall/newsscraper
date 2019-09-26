var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all model

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware
var MONGODB_URI=process.env.MONGODB_URI||"mongodb://localhost/Headline";
var db = require("./models");
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes
var results = [];

// A GET route for scraping the echoJS website
app.get("/", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.wsj.com/").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $("article").each(function (i, element) {
            console.log(results.length);
            if (results.length > 10) {
                return false;
            }
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
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
                    // View the added result in the console
                    console.log(dbHeadline);


                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                })
            // res.JSON("index", { Headline: result });
        });

        // Send a message to the client

    });
    db.Headline.find({}).populate("comment")
        .then(function (dbHeadlines) {
            console.log("helloooooo");
            console.log(dbHeadlines);
            res.render("index", { allData: dbHeadlines });
        })
    // .catch(function (err) {
    //     res.json(err);
    // })
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
    // Create a new note and pass the req.body to the entry
    console.log(req.body)
    db.Comment.create(req.body)
      .then(function(dbComment) {
          console.log(dbComment);
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Headline.findOneAndUpdate({ _id: req.params.id }, {$push:{ comment: dbComment._id}}, { new: true });
      })
      .then(function(data) {
        // If we were able to successfully update an Article, send it back to the client
        console.log(data);
        db.Article.find({}).populate("comment").then(allData => {
            res.render( "index", {allData: allData} );;
            console.log(allData);
        })
        
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });




app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
