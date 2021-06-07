var option = {
    appID: "696da46f254d43b0b78c623760d9299b",
    channel: "agora-test-channel",
    uid: null,
    token: "006696da46f254d43b0b78c623760d9299bIADsfeYdJ1/5UYD5mDP6QcJc2yPJM5iiwWnrArxQ1X0zEeBUHCsAAAAAEACbQyLuQSy/YAEAAQBBLL9g"
};

const handleFail = function(err){
    console.error("Error: ", err);
};

let remoteContainer = document.getElementById('remote-container');

function addVideoStream(streamId){
    let streamDiv=document.createElement("div"); // Create a new div for every stream
    streamDiv.id=streamId;
    streamDiv.style.height="250px";                       // Assigning id to div
    streamDiv.style.width="400px";                       // Assigning id to div
    streamDiv.style.transform="rotateY(180deg)"; // Takes care of lateral inversion (mirror image)
    remoteContainer.appendChild(streamDiv);      // Add new div to container
}

function removeVideoStream (streamId) {
    let remDiv = document.getElementById(streamId);
    if(remDiv) remDiv.parentNode.removeChild(remDiv);
}

let client = AgoraRTC.createClient({
    mode: 'rtc',
    codec: "vp8"
});

// Client Setup
// Defines a client for Real Time Communication
client.init(option.appID , () => console.log("AgoraRTC client initialized") ,handleFail);

client.join(option.token, option.channel, null, (uid)=>{
    console.log("Dynamic uid: ", uid);

    // Stream object associated with your web cam is initialized
    let localStream = AgoraRTC.createStream({
        streamID: uid,
        audio: true,
        video: true,
        screen: false
    });

    // Associates the stream to the client
    localStream.init(function() {

        //Plays the localVideo
        localStream.play('me');

        //Publishes the stream to the channel
        client.publish(localStream, handleFail);

    },handleFail);

},handleFail);

//When a stream is added to a channel
client.on('stream-added', function (evt) {
    client.subscribe(evt.stream, handleFail);
});
//When you subscribe to a stream
client.on('stream-subscribed', function (evt) {
    let stream = evt.stream;
    let streamId = String(stream.getId());
    addVideoStream(streamId);
    stream.play(streamId);
});

//When a person is removed from the stream
client.on('stream-removed', (evt) => {
    let stream = evt.stream;
    let streamId = String(stream.getId());
    stream.close();
    removeVideoStream(streamId);
});
client.on('peer-leave', (evt) => {
    let stream = evt.stream;
    let streamId = String(stream.getId());
    stream.close();
    removeVideoStream(streamId);
});
