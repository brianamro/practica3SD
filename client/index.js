const net = require('net');

import { updateClockDom } from '../common/utils.js';

const SERVER_PORT = 5500;
const SERVER_IP = "localhost";

var clock;
var socket;

export default function main() {
    initClock();
    initSocket();
    bindButtons();
}

function bindButtons() {
    document.getElementById('btn-request-book').addEventListener('click', function requestBookHdl(event) {
        event.preventDefault();
        requestBook();
        document.getElementById('btn-request-book').removeEventListener('click', requestBookHdl);
    });
}

function initClock() {
    clock = new Worker('../common/worker.js', { type: "module" });
    //Reloj Maestro
    clock.onmessage = e => {
        updateClockDom($('.clock'), e.data);
    }
    clock.postMessage({
        name: "Reloj"
    });
}

function initSocket() {
    socket = net.connect({ port: SERVER_PORT, host: SERVER_IP }, () => {
        // 'connect' listener.
        console.log('connected to server!');
    });

    socket.on('data', data => {
        let msg = JSON.parse(data.toString());
        if (msg?.type === 'success') {
            const book = msg.info?.book;
            showBook(book);
        } else if (msg?.type === 'enableReset') {
            enableReset();
        } else if (msg?.type === 'error') {
            console.error(msg.info.error_msg);
        }
    });

    socket.on('end', () => {
        // TODO: Preguntar al usuario si quisiera conectarse de nuevo o salir
        console.log("disconnected from server");
    });
}

// Despliegue de información de libro
function showBook({ value }) {
    const bookInfoContainer = $('#book-container');
    const infoBook = bookInfoContainer.find(".information");
    const { ISBN, autor, editorial, nombre, precio } = value;
    //Rellenar informacion
    infoBook.find("p#nombre span").html(nombre);
    infoBook.find("p#autor span").html(autor);
    infoBook.find("p#editorial span").html(editorial);
    infoBook.find("p#precio span").html(precio);
    infoBook.find("p#ISBN span").html(ISBN);
    //Mostrar Contenedor
    bookInfoContainer.addClass("showing-info");
    //Desactivar boton de pedir libro
    bookInfoContainer.find("#btn-request-book").addClass("disabled");
}

function reset() {
    let request = {
        type: "reset"
    };
    socket.write(JSON.stringify(request));
}

function requestBook() {
    let request = {
        type: "requestBook"
    }
    socket.write(JSON.stringify(request));
}

function enableReset() {
    document.getElementById('btn-reset').addEventListener('click', function resetSessions(event) {
        event.preventDefault();
        reset();
    });
}