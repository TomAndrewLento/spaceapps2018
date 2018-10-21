const net = require('net');
const http = require('http');
const util = require('util');
const express = require('express');

const bodyParser = require('body-parser');
const app = express();

const server = http.createServer(app);

//My interface to speech recognition, change hostname appropriately
const hostname = '0.0.0.0';//'127.0.0.1';
//const port = 8080;
const port = process.env.PORT || 8080;

//app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.all("*", (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

//parameters at startup
var current_scale = 1;
var current_asset = '';
var current_speed = 1;

//assets to control
var current_asset_base = 'Scene.Mars';
var current_asset_scale = current_asset_base + '.Scale.Scale';

//var time_control_property = 'openspace.time.DeltaTime';
var asset_property = 'NavigationHandler.Origin';

//Open Space connectivity details
//const open_space_ip = '10.10.0.122';
const open_space_ip = '10.10.0.63';
const open_space_port = 8000;


const connection = {
    connect: (onConnected) => {
        this._client = net.createConnection({ host: open_space_ip, port: open_space_port }, () => {
            console.log('Connected to OpenSpace backend');
            onConnected();
        });

        this._client.on('data', (data) => {
            const messageObject = JSON.parse(data.toString());
            if (messageObject.topic !== undefined) {
                this._callbacks[messageObject.topic](messageObject.payload);
            }
        });

        this._client.on('end', () => {
          console.log('Disconnected from OpenSpace');
        });

        this._callbacks = {};
        this._nextTopicId = 0;
    },

    disconnect: () => {
        this._client.end();
    },

    startTopic: (type, payload, callback) => {
        const topic = this._nextTopicId++;
        const messageObject = {
            topic: topic,
            type: type,
            payload: payload
        };
        this._callbacks[topic] = callback || function() {};
        this._client.write(JSON.stringify(messageObject) + "\n");
        return topic;
    },

    talk: (topic, payload) => {
        const messageObject = {
            topic: topic,
            payload: payload
        };
        this._client.write(JSON.stringify(messageObject) + "\n");
    }
}

//Uncomment this to introduce an aritficial delay if OpenSpace is not running, and you just want to test the HTTP requests
//setTimeout(() => {}, 10000);

connection.connect(() => {
    //connection.startTopic('set', {property: 'Scene.Mars.Scale.Scale', value: "3"});
    //console.log("Set value of Mars Scale to 3");

    // Get scale first
    setTimeout(() => {
        connection.startTopic('get', {property: current_asset_base + '.Scale.Scale'}, (response) => {
            console.log("Got value of " + current_asset_base + " Scale ", response.Value)
            current_scale = response.Value;
        });
    }, 100)

    //setTimeout(() => {
        //connection.startTopic('get', {property: time_control_property}, (response) => {
        //    console.log("Got value of " + time_control_property + " ", response.Value)
            //current_speed = response.Value;
    //    });
    //}, 100)

    let subscriptionTopic = -1;
    // Subscribe to Mars scale
    setTimeout(() => {
        subscriptionTopic = connection.startTopic(
            'subscribe',
            {event: 'start_subscription', property: current_asset_base + '.Scale.Scale'},
            (response) => {
                console.log("Got new value of " + current_asset_base + " Scale through subscription: ", response.Value)
                current_scale = response.Value;
            }
        );
        console.log("Subscription topic is " + subscriptionTopic);
    }, 200);

    setTimeout(() => {
        subscriptionTopic = connection.startTopic(
            'subscribe',
            {event: 'start_subscription', property: asset_property},
            (response) => {
                console.log("Got new value of " + asset_property + " through subscription: ", response.Value)
                current_asset = response.Value;
            }
        );
        console.log("Subscription topic is " + subscriptionTopic);
    }, 200);

    // Reset Mars scale
    setTimeout(() => {
        //connection.startTopic('set', {property: current_asset_base + '.Scale.Scale', value: "" + (current_scale - 1)});
            console.log("Reset value of " + current_asset_base + " Scale");
    }, 300);

    // Unscubscribe
    setTimeout(() => {
       // connection.talk(subscriptionTopic, {property: current_asset_base + '.Scale.Scale', event: 'stop_subscription'});
            console.log("Unsubscribed to " + current_asset_base + " Scale");
    }, 400);

    // Execute script to speed up time
//    setTimeout(() => {
//        connection.startTopic('luascript', {script: 'openspace.time.interpolateDeltaTime(10000, 1);'});
//    }, 500);

    // Execute script to slow down time
//    setTimeout(() => {
//        connection.startTopic('luascript', {script: 'openspace.time.interpolateDeltaTime(1, 1);'});
//    }, 2500);

//    setTimeout(() => {
//        connection.disconnect();
//    }, 2600);
});

var zoomin_regex = new RegExp('zoom\\sin');
var zoomout_regex = new RegExp('zoom\\sout');
var gotomars_regex = new RegExp('go\\s+to\\s+mars');
var gotomoon_regex = new RegExp('go\\sto\\sthe\\smoon|go\\sto\\smoon');
var speedup_regex = new RegExp('speed\\s?up');
var slowdown_regex = new RegExp('slow\\s?down');
var driftaway_regex = new RegExp('drift\\saway');
var lookatmars_regex = new RegExp('look\\s+at\\s+mars');
var lookatmoon_regex = new RegExp('look\\s+at\\s+the\\s+moon');

app.post('/update', (req, res) => {
	console.log(req.body );
	var command = req.body.command.toLowerCase();
	if(zoomin_regex.exec(command) != null) {	//zoom in regex
		current_scale += 2;
	    connection.startTopic('set', {property: current_asset_base + '.Scale.Scale', value: "" + current_scale});
	    console.log("Set value of " + current_asset_base + " Scale to 3");
	} else if(zoomout_regex.exec(command) != null ) {
		current_scale -= 2;
	    connection.startTopic('set', {property: current_asset_base + '.Scale.Scale', value: "" + current_scale});
	    console.log("Set value of " + current_asset_base + " Scale to 1");
	} else if(gotomars_regex.exec(command) != null ) {
	    connection.startTopic('set', {property: asset_property, value: "\"Mars\""});
	    connection.startTopic('luascript', {script: 'openspace.globebrowsing.goToGeo(58.5877, 16.1924, 20000000);'});
	    //connection.startTopic('set', {property: 'openspace.globebrowsing.goToGeo', [58.5877, 16.1924, 20000000] };
	    console.log("Set value of " + asset_property + " set to Mars");
	} else if(lookatmars_regex.exec(command) != null ) {
	    connection.startTopic('set', {property: asset_property, value: "\"Mars\""});
	    console.log("Set value of " + asset_property + " set to Mars");
	} else if(gotomoon_regex.exec(command) != null ) {
	    connection.startTopic('set', {property: asset_property, value: "\"Moon\""});
	    connection.startTopic('luascript', {script: 'openspace.globebrowsing.goToGeo(58.5877, 16.1924, 20000000);'});
	    //connection.startTopic('set', {property: 'openspace.globebrowsing.goToGeo', [58.5877, 16.1924, 20000000] };
	    console.log("Set value of " + asset_property + " set to Moon");
	} else if(lookatmoon_regex.exec(command) != null ) {
	    connection.startTopic('set', {property: asset_property, value: "\"Moon\""});
	    console.log("Set value of " + asset_property + " set to Moon");
	} else if(speedup_regex.exec(command) != null ) {
 		connection.startTopic('luascript', {script: 'openspace.time.setDeltaTime(100000);'});
		//connection.startTopic('set', {property: time_control_property, value: "Moon"});
	    //console.log("Set value of " + time_control_property + " set to Moon");
	} else if(slowdown_regex.exec(command) != null ) {
		connection.startTopic('luascript', {script: 'openspace.time.setDeltaTime(1);'});
		//console.log("Set value of " + time_control_property + " set to Moon");
	} else if(driftaway_regex.exec(command) != null ) {
	    //connection.startTopic('set', {property: time_control_property, value: "Moon"});
	    //console.log("Set value of " + time_control_property + " set to Moon");
	}
	res.send();
});

server.listen(port, hostname, () => {
    console.log(`server running at ${hostname}:${port}`);
});

