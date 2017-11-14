var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;
// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/mongonews", {
  useMongoClient: true
});

// Routes
// var routes = require("./routes/routes.js");
// app.use('/', routes)
//Check that browser is responding.
//TO-DO: Move routes to another folder.
app.get('/', function(req, res) {
  // grab all articles from bd and render to
  db.Article.find({})
    .then(function(dbArticle) {
      res.render('index', {
        article: dbArticle
      });

    })
});

//A GET route for scraping news website
// save these to db
app.get("/scrape", function(req, res) {
  request('https://www.reddit.com/r/webdev', function(err, response, html) {
    var $ = cheerio.load(html);
    var results = {}; //
    $("p.title").each(function(i, element) {
      // Save the text of the element in a "title" variable
      var title = $(element).text();
      // In the currently selected element, look at its child elements (i.e., its a-tags),
      // then save the values for any "href" attributes that the child elements may have
      var link = $(element).children().attr("href");

      if (link.startsWith('\/r')) {
        link = "https:///www.reddit.com"+link
      };
      // Save these results in an object that we'll push into the results array we defined earlier
      results.title = title;
      results.link = link;
      // results.push({
      //   title: title,
      //   link: link
      // });
      db.Article
        .create(results)
        .then(function(dbArticle) {
          console.log('New aritcle created: ' + dbArticle);
          //res.send("Scrape Complete");

        })
        .catch(function(err) {
          res.json(err)
        })


    });
    // Log the results once you've looped through each of the elements found with cheerio
    console.log(results);
    setTimeout( function(){
        res.redirect('/')
    }, 1000)

  })
})

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article
    .find({})
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

//Route for saving/updating an Article's associated Note (can't pass body and title via Postman or Curl)
app.post("/articles/:id", function(req, res) {
  console.log(req.body)
  db.Note
    .create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({
        _id: req.params.id
      }, {
        note: dbNote._id
      }, {
        new: true
      });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

//Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article
    .findOne({
      _id: req.params.id
    })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      // res.json(dbArticle);
      res.render('notes', {
        article: dbArticle
      })
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
