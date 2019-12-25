var sender = document.getElementById('sender');
var receiver = document.getElementById('receiver');
var conversation = document.getElementById('conversation');
var sendBtn = document.getElementById('sendBtn');
var socket = null;
var createSocket = function() {
    if(socket) {
        socket.close();
    }
    var url = 'ws://' + window.location.host + '/ws/' + sender.options[sender.selectedIndex].value;
    socket = new WebSocket(url);
    socket.onopen = function() {
        console.log('connected to ' + url);
    }
    socket.onmessage = function(event) {
        var data = JSON.parse(event.data);
        conversation.innerHTML = conversation.innerHTML + data.from + ':' + data.content + '<br/>'; 
    }
    socket.onclose = function() {
        console.log('close connect to' + url);
    }
};

var sendMessage = function() {
    var msg = document.getElementById('msg').value;
    fetch('/rest/message', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            from: sender.options[sender.selectedIndex].value,
            content: msg,
            to: receiver.options[receiver.selectedIndex].value
        }) 
    }).then(res => {
        return res.json();
    }).then(data => {
        if(!data.succeed) {
            alert(data.msg);
        }
    })
};

sender.onchange = function() {
    createSocket();
}

sendBtn.onclick = function() {
    sendMessage();
}

createSocket();