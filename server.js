const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;

const app = express();
const url = 'mongodb://localhost:27017';
const dbName = 'notes';

let noteCollection = null;
let notes = [];

// Connect to DB and set up initial data
MongoClient.connect(url, function(err, client) {
  if(err) {
    throw new Error("DB connection failed");
  }
  console.log("Connected successfully to database");
  const db = client.db(dbName);
  noteCollection = db.collection('notes');
  noteCollection.find({}).toArray(function(err, docs) {
    if(err) {
      throw err;
    }
    notes = docs;
  });
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// serve static content from under /public/ dir
app.use('/', express.static(__dirname + "/public/"));

let clients = []; //an array of all clients listening to the server

app.post('/notes', function(req, res) {
  if(!noteCollection) {
    res.status(500);
    res.send('Internal Server Error: DB collection not initialized');
    return;
  }
  notes.push(req.body);
  noteCollection.insertOne(req.body, function(err, result) {
    if(err) {
      res.status(500);
      res.send('Internal Server Error: DB did not accept adding the note');
      return;
    }
    for(let client of clients) {
      client.write(makeNoteSSE(req.body));
    }
    res.sendStatus(200);
  });
});

app.get('/notes', function(req, res) {
  if(!noteCollection) {
    res.status(500);
    res.send("Internal Server Error: DB collection not initialized");
    return;
  }
  req.socket.setTimeout(Number.MAX_VALUE);
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  for(let note of notes) {
    res.write(makeNoteSSE(note));
  }
  clients.push(res);
});
function makeNoteSSE(data) {
  return "data: "+JSON.stringify(data)+"\n\n";
}
app.listen(4000, function(){
  console.log("Server started at port 4000");
});
