const net = require('net');
var HashMap = require('hashmap');
global.words_to_actions_map = new HashMap();
global.words_to_actions_map.set('zoom in', 'Scale.Scale');
global.words_to_actions_map.set('zoom out', 'Scale.Scale');
global.words_to_actions_map.set('spin faster', 'Scale.Scale');
global.words_to_actions_map.set('spin slower', 'Scale.Scale');
global.words_to_actions_map.set('go to mars', 'Mars');

const connection = {
    connect: (onConnected) => {
        this._client = net.createConnection({ port: 8000 }, () => {
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

connection.connect(() => {
    // First, make Earth bigger
    connection.startTopic('set', {property: 'Scene.Mars.Scale.Scale', value: "2"});
    console.log("Set value of Mars Scale to 2");

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
        connection.startTopic('set', {property: 'Scene.Mars.Scale.Scale', value: "1"});
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

    setTimeout(() => {
        connection.disconnect();
    }, 2600);
});
