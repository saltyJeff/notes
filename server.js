const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var notes = [];

fs.readFile('notes.txt', function(err, data){
  if(data){
    let parsedData = JSON.parse(data);
    if(typeof parsedData == "object"){
      notes = parsedData;
    }
  }
});

app.use('/', express.static(__dirname + "/public/"));

app.post('/addNotes', function(req, res){
  notes.push(req.body);
  fs.writeFile('notes.txt', JSON.stringify(notes), function(err){
    if(err) throw err;
  })
  res.send(notes);
});

app.get('/fetchNotes', function(req, res){
  res.send(notes);
});

app.listen(4000, function(){
  console.log("Server started at port 4000");
});
