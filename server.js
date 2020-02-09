const notifier = require('node-notifier');
var path = require('path');
var TwitterPackage = require('twitter');
var cron = require('node-cron');
var express = require('express'),
	app = express();

var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed



cron.schedule('* * * * *', function() {
	console.log('Updated Score at ::: ' + new Date().toString().substr(0, 24));
	cricNotifier();
});

function cricNotifier() {
	var req = request('http://static.espncricinfo.com/rss/livescores.xml');
	var feedparser = new FeedParser();

	req.on('error', function (error) {
	  // handle any request errors
	});
	req.on('response', function (res) {
	  var stream = this; // `this` is `req`, which is a stream

	  if (res.statusCode !== 200) {
	    this.emit('error', new Error('Bad status code'));
	  }
	  else {
	    stream.pipe(feedparser);
	  }
	});

	feedparser.on('error', function (error) {
	  // always handle errors
	});

	feedparser.on('readable', function () {
	  // This is where the action is!
	  var stream = this; // `this` is `feedparser`, which is a stream
	  var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
	  var item;

	  while (item = stream.read()) {
	  	//console.log(item.title);
	  	if (item.title.indexOf('Ind') > -1) {
	  		console.log(JSON.stringify(item, null, 2));
	  		notifier.notify(
	  		  {
	  		    title: item.title,
	  		    subtitle: 'livescores',
	  		    message: item.description || 'Not yet started',
	  		    sound: 'Funk',
	  		    wait: true,
	  		    appIcon: path.join(__dirname, 'logo.JPG'),
	  		    contentImage: path.join(__dirname, 'logo.JPG'),
	  		    open: 'file://' + path.join(__dirname, 'logo.JPG')
	  		  },
	  		  function() {
	  		    //console.log(arguments);
	  		  }
	  		);
	  	}    
	  }
	});
}


app.listen(4002, function(){
    console.log('CricNotifier Server started @Port : ' + this.address().port);
    cricNotifier();
});