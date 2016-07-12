//*************************************************************************
//                              REQUIREMENTS
//*************************************************************************

var express = require('express');
var mongoose = require('mongoose');
var http = require('http');
var bodyParser = require('body-parser');
var colors = require('./colors.js');
var Promise = require('bluebird');
var async = require('async');


//*************************************************************************
//                              SERVER
//*************************************************************************

var app = express();

app.use(bodyParser.json());

app.use(express.static(__dirname + '/client'));

var port = process.env.PORT || 3000;

if (process.env.PORT){
  mongoose.connect('mongodb://efhjones:'+ process.env.MONGO_PASS + '@ds031328.mlab.com:31328/heroku_0p4lrbhq');
} else {
  mongoose.connect('mongodb://localhost/MVP');
  }

app.listen(port);
console.log("Server is listening on " + port);


var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected!')
});

//*************************************************************************
//                            SCHEMAS
//*************************************************************************

var traits = new mongoose.Schema({
  trait: String,
  colors: Array
});

var schemes = new mongoose.Schema({
  colors: Array,
  created_at: Date
});

//*************************************************************************
//                            MODELS
//*************************************************************************

var Trait = mongoose.model('Trait', traits);

var Scheme = mongoose.model('Scheme', schemes);


//*************************************************************************
//                       GENERATE COLOR DB
//*************************************************************************

async.eachOf(colors, function(colorArray, color){

  Trait.findOne({ trait: color}, function(err, found){
    if (err){
      console.log("on color", color);
      console.log("Bummer, error line 66 ", err);
    }
    if (!found){
      console.log("I did not find " + color + " so I'mma create it");
      Trait.create({trait: color, colors: colorArray}, function(err, item){
        if (err){
          console.log("Bummer, error line 71 ", err);
        } else {
          console.log("item created ", item);
        }
      });
    }
  });
});

//*************************************************************************
//                        RANDOM INDEX GENERATOR
//*************************************************************************
var randomIndex = function(array){
  return Math.floor(Math.random() * array.length);
}


var returnColors = [];

//*************************************************************************
//                            GET REQUESTS
//*************************************************************************

//RENDERS INDEX
app.get('/', function(req, res) {
  res.render("./index");
  res.send("Hello, world!");
});


//GRABS NEWEST SCHEMA
app.get('/scheme', function(req, res){
  Scheme.find().sort('-created_at').exec(function(err, result){
    res.send(result[0]);
  })
});

//*************************************************************************
//      POST REQUEST --> CHOOSES COLORS, CREATES SCHEMA MODEL
//*************************************************************************

app.post('/', function(req, res){
  console.log("Server heard post");
  var colorArray = req.body;
  res.sendStatus(201);

  async.each(colorArray, function(color){
    Trait.findOne({ trait: color}, function(err, found){
      if (err){
        console.log("Err", err);
      }
      if (found){
        var index = randomIndex(found.colors);
        returnColors.push(found.colors[index]);
      }
    });
  });

  returnColors = [];

  Scheme.findOne({ colors: returnColors }, function(err, found){
    if (err){
      console.log("Err", err);
    }
    if (!found){
      Scheme.create({ colors: returnColors, created_at : new Date() }, function(err, scheme){
        if (!err){
          console.log("Scheme created! ", scheme);
        }
      })
    }
  })
});

//*************************************************************************
//                              EXPORTS
//*************************************************************************

module.exports = app;
