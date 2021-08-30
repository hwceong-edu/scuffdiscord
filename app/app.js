// Heroku
const socket = io(window.location.hostname);

// // Local Dev
// const socket = io('ws://localhost:5000');

var typing = false;
var timeout = undefined;

function waitForUnTyping() {
    typing = false;
    socket.emit("not_typing", socket.id);
}

socket.on('message', text => {
    const el = document.createElement('li');
    el.innerHTML = text;
    document.getElementById('global_chat').appendChild(el);
});

socket.on('private message', (sender, receiver, text) => {
    const chatarea = document.getElementById("chatarea")
    var Id = null;

    if (receiver === socket.id) {
        Id = sender;
    } else {
        Id = receiver;
    }

    console.log(Id);

    if (chatarea.querySelector("#id"+Id) == null) {
        elem = document.createElement('ul');
        elem.setAttribute("id", "id"+Id);
        elem.setAttribute("class", "visible");
        chatarea.appendChild(elem);
    }

    var childs = chatarea.children;
    for (var i = 0; i < childs.length; i++) {
        childs[i].className = "invisible";
    }

    document.getElementById("id"+Id).className = "visible";

    const el = document.createElement('li');
    el.innerHTML = sender.substr(0,2) + ": " + text;
    document.getElementById("id"+Id).appendChild(el);
    document.querySelector('input').id = "id"+Id;
});

socket.on('typing', names => {
    var min = Math.min(3, names.length-1);
    var output = '';

    if (names.length <= 0) {
        document.querySelector('p').innerHTML= output;
        return;
    } else if (names.length == 1 && names[0] === socket.id) {
        document.querySelector('p').innerHTML= output;
        return;
    }

    for (let i = 0; i < min; i++) {
        if (names[i] !== socket.id) {
            output += names[i] + ', ';
        }
    }

    if (min >= 3) {
        output += "and others ";
    } else {
        output += names[names.length-1];
    }
    output += " is typing ...";
    document.querySelector('p').innerHTML= output;
});

socket.on('online', names => {
    const onlineList = document.getElementById('online');
    while (onlineList.firstChild) {
        onlineList.removeChild(online.lastChild);
    }

    for (let i = 0; i < names.length; i++) {
        var elem = undefined;
        if (socket.id === names[i]) {
            elem = document.createElement('p');
            elem.innerHTML = names[i] + " (you)";
        } else {
            elem = document.createElement('button');
            elem.innerHTML = names[i];
            elem.setAttribute("id", names[i]);
            elem.setAttribute("onclick", "pm(this.id)");
        }
        onlineList.appendChild(elem);
    }

});

document.getElementById('send').onclick = () => {
    const inputElem = document.querySelector('input');
    const text = inputElem.value;
    inputElem.value = '';

    if (inputElem.id == "globalinput") {
        socket.emit('message', text);
    } else {
        socket.emit('private message', inputElem.id.substr(2), text);
    }
}

document.querySelector('input').onkeyup = (ev) => {
    if (ev.key === "Enter") {
        ev.preventDefault();
        document.getElementById('send').click();
    } 
}

document.querySelector('input').oninput = () => {
    if (!typing) {
        typing = true;
        socket.emit('typing', socket.id);
        timeout = setTimeout(waitForUnTyping, 1000);
    } else {
        clearTimeout(timeout);
        timeout = setTimeout(waitForUnTyping, 1000);
    }
}

document.getElementById("global").onclick = () => {
    const chatarea = document.getElementById("chatarea")

    var childs = chatarea.children;
    for (var i = 0; i < childs.length; i++) {
        childs[i].className = "invisible";
    }
    document.getElementById("global_chat").className = "visible";
    document.querySelector('input').id = "globalinput";
}

function pm(selfId) {
    const chatarea = document.getElementById("chatarea")
    if (chatarea.querySelector("#id"+selfId) == null) {
        elem = document.createElement('ul');
        elem.setAttribute("id", "id"+selfId);
        elem.setAttribute("class", "visible");
        chatarea.appendChild(elem);
    }

    var childs = chatarea.children;
    for (var i = 0; i < childs.length; i++) {
        childs[i].className = "invisible";
    }

    document.getElementById("id"+selfId).className = "visible";

    document.querySelector('input').id = "id"+selfId;
}