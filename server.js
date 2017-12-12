const express = require('express');
const fs = require('fs');
const mkdirp = require('mkdirp');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Create database directory on local if not existing
mkdirp("db", function (err){
    if (err) return cb(err);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var notes = [];

// read database file from local to create initial data
fs.readFile('db/notes.json', function(err, data){
  if(data){
    let parsedData = JSON.parse(data);
    if(typeof parsedData == "object"){
      notes = parsedData;
    }
  }
});

// serve static content from under /public/ dir
app.use('/', express.static(__dirname + "/public/"));

app.post('/notes', function(req, res){
  notes.push(req.body);
  fs.writeFile('db/notes.json', JSON.stringify(notes), { flag: 'w' }, function(err){
    if(err) throw err;
  })
  res.send(notes);
});

app.get('/notes', function(req, res){
  res.send(notes);
});

app.listen(4000, function(){
  console.log("Server started at port 4000");
});
