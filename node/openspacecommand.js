const net = require('net');
const http = require('http');
var util = require('util');

//var HashMap = require('hashmap');
//global.words_to_actions_map = new HashMap();
//global.words_to_actions_map.set('zoom in', 'Scale.Scale');
//global.words_to_actions_map.set('zoom out', 'Scale.Scale');
//global.words_to_actions_map.set('spin faster', 'Scale.Scale');
//global.words_to_actions_map.set('spin slower', 'Scale.Scale');
//global.words_to_actions_map.set('go to mars', 'Mars');

const connection = {
    connect: (onConnected) => {
        this._client = net.createConnection({ host: '10.10.0.122', port: 8000 }, () => {
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

const hostname = '127.0.0.1';
const port = 8080;
//const Asset = 'Scene.Mars';
setTimeout(() => {}, 10000);
connection.connect(() => {
    // First, make Earth bigger
    connection.startTopic('set', {property: 'Scene.Mars.Scale.Scale', value: "3"});
    console.log("Set value of Mars Scale to 3");

    // Get Earth scale
    setTimeout(() => {
        connection.startTopic('get', {property: 'Scene.Mars.Scale.Scale'}, (response) => {
            console.log("Got value of Mars Scale ", response.Value)
        });
    }, 100)

    let subscriptionTopic = -1;
    // Subscribe to Mars scale
    setTimeout(() => {
        subscriptionTopic = connection.startTopic(
            'subscribe',
            {event: 'start_subscription', property: 'Scene.Mars.Scale.Scale'},
            (response) => {
                console.log("Got new value of Mars Scale through subscription: ", response.Value)
            }
        );
        console.log("Subscription topic is " + subscriptionTopic);
    }, 200);

    // Reset Mars scale
    setTimeout(() => {
        connection.startTopic('set', {property: 'Scene.Mars.Scale.Scale', value: "5"});
            console.log("Reset value of Mars Scale");
    }, 300);

    // Unscubscribe
    setTimeout(() => {
        connection.talk(subscriptionTopic, {property: 'Scene.Mars.Scale.Scale', event: 'stop_subscription'});
            console.log("Unsubscribed to Mars Scale");
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


const server = http.createServer((req, res) => {
	    connection.startTopic('set', {property: 'Scene.Mars.Scale.Scale', value: "5"});
	    console.log("Set value of Mars Scale to 5");
	    console.log("req is " + req.url);
	    util.inspect(req);
	if((req.url) == '/zoomin') {
	    connection.startTopic('set', {property: 'Scene.Mars.Scale.Scale', value: "3"});
	    console.log("Set value of Mars Scale to 3");
    } else if((req.url) == '/zoomout' ) {
        connection.startTopic('set', {property: 'Scene.Mars.Scale.Scale', value: "10"});
        console.log("Set value of Mars Scale to 1");
    }
    } else if((req.url) == '/gotoMoon' || (req.url) == '/gotomoon') {
        connection.startTopic('set',{property: "openspace.navigation.CameraState.Focus", value:"moonAsset.Moon.Identifier"});
        console.log("Moving camera to Moon");
    }
});


server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

