const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const handlerCreator = require('./handlers');

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
  var handlers = handlerCreator(noteCollection);

  //server setup
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  // serve static content from under /public/ dir
  app.use('/', express.static(__dirname + "/public/"));
    
  app.post('/notes', handlers.postHandler);
  app.get('/notes', handlers.getHandler);

  app.listen(4000, function(){
    console.log("Server started at port 4000");
  });
});

