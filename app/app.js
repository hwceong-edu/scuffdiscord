const socket = io();
var typing = false;
var timeout = undefined;

function waitForUnTyping() {
    typing = false;
    socket.emit("not_typing", socket.id);
}

socket.on('message', text => {
    const el = document.createElement('li');
    el.innerHTML = text;
    document.querySelector('ul').appendChild(el);
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

document.querySelector('button').onclick = () => {
    const text = document.querySelector('input').value;
    document.querySelector('input').value = '';
    socket.emit('message', text);
}

document.querySelector('input').onkeyup = (ev) => {
    if (ev.key === "Enter") {
        ev.preventDefault();
        document.querySelector('button').click();
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
