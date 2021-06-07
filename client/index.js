const net = require('net');
const Swal = require('sweetalert2');
const { ipcRenderer } = require('electron');
const fs = require('fs');

import { updateClockDom } from '../common/utils.js';


const bookInfoContainer = $('#book-container');

var clock;
var socket;


export default function main() {
    initClock();
    findServer();
    bindButtons();
}

function requestBookHdl(event) {
    event.preventDefault();
    requestBook();
    document.getElementById('btn-request-book').removeEventListener('click', requestBookHdl);
}

function bindButtons() {
    document.getElementById('btn-request-book').addEventListener('click', requestBookHdl);
}

function initClock() {
    clock = new Worker('../common/worker.js', { type: "module" });
    //Reloj Maestro
    clock.onmessage = e => {
        updateClockDom(document.querySelector('.clock'), e.data);
    }
    clock.postMessage({
        name: "Reloj"
    });
}

function configSocket() {
    let dataCallback = data => {
        let msg = JSON.parse(data.toString());
        console.log(msg);
        if (msg?.type === 'responseBook') {
            const book = msg.info?.book;
            showBook(book);
        } else if (msg?.type === 'enableReset') {
            enableReset();
        } else if (msg?.type === 'error') {
            //Alerta
            Swal.fire({
                title: 'Solicitud rechazada',
                text: 'No se encontró un libro disponible',
                icon: 'error',
                confirmButtonText: 'Cerrar'
            });
            document.getElementById('btn-request-book').addEventListener('click', requestBookHdl);
        }
    };
    let endCallback = () => {
        console.log("disconnected from server");
        bookInfoContainer.removeClass("showing-info");
        bookInfoContainer.find("#btn-request-book").removeClass("disabled");

        //Alerta de cierree de esision
        Swal.fire({
            title: 'Sesion Finalizada',
            text: '¿Te gustaria continuar?',
            showDenyButton: true,
            confirmButtonText: 'Si, continuar',
            denyButtonText: 'No, salir',
        }).then((result) => {
            if (result.isConfirmed) {
                socket = null;
                //Alerta aceptada, continuar con la sesion
                findServer();
                document.getElementById('btn-request-book').addEventListener('click', requestBookHdl);
            } else {
                ipcRenderer.send("asynchronous-message", 'exit');
            }
        })
    };
    socket.on('data', dataCallback);

    socket.on('close', endCallback);

    socket.on('error', err => {
        if (err.code !== 'ECONNRESET') {
            console.error(err);
        }
    });
}

function findServer() {
    let i = 0;
    let handler;
    handler = setInterval(() => {
        fs.readFile('./server/serverList.json', 'utf-8', (err, data) => {
            if (err) {
                return console.error(err);
            }
            // try to connect with any server
            let serverList = JSON.parse(data);
            if (serverList?.peers?.length !== 0) {
                let len = serverList?.peers?.length;
                let sv = serverList.peers[i];

                i = (i + 1) % len;
                let sock = new net.Socket();
                let serverInfo = `${sv.host}:${sv.port}`;
                sock.connect(sv, () => {
                    console.log(`connected to server ${serverInfo}`);
                    socket = sock;
                    clearInterval(handler);
                    configSocket();
                });

                sock.on('error', err => {
                    if (err.code === 'ECONNREFUSED') {
                        console.log(`server ${serverInfo} not available`);
                    }
                });
            }
        });
    }, 2000);
}

// Despliegue de información de libro
function showBook(value) {
    //Alerta
    Swal.fire({
        title: 'Solicitud aceptada',
        text: 'El prestamo ha sido autorizado',
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });
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