module.exports = function (noteCollection) {
	var notes = []; //cached notes
	var clients = []; //array of all clients currently watching
	var toReturn = {};

	//populate notes
	noteCollection.find({}).toArray(function(err, docs) {
    if(err) {
      throw err;
    }
    notes = docs;
	});
	//post handler
	toReturn.postHandler = function (req, res) {
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
	};
	//get handler
	toReturn.getHandler = function (req, res) {
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
	};
	return toReturn;
};
function makeNoteSSE(data) {
	return "data: "+JSON.stringify(data)+"\n\n";
}