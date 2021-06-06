const net = require('net');
const Swal = require('sweetalert2');
const { remote } = require('electron');

const args = remote.getGlobal('args');

import { updateClockDom } from '../common/utils.js';
import Db from "./db.js";

var mainClockWorker;
var connections;
var server;
var db;

export default function main() {
    db = new Db(args.uri);

    initClock();
    initServer();
    initComponents();
}

function initClock() {
    mainClockWorker = new Worker('../common/worker.js', { type: "module" });
    //Reloj Maestro
    mainClockWorker.onmessage = e => {
        updateClockDom(document.querySelector(".clock#clock-s"), e.data);
    };
    mainClockWorker.postMessage({
        name: "Reloj Maestro"
    });
}

function initComponents() {
    // Modal para editar reloj
    const modalEdit = document.querySelector("#modal-edit-clock");
    // Boton para editar el reloj
    document.querySelector('#clock-s a.edit-clock').addEventListener('click', e => {
        e.preventDefault();
        const ClockContainer = e.currentTarget.parentNode
        const currHours = Number(ClockContainer.querySelector("h1.hours").innerHTML);
        const currMins = Number(ClockContainer.querySelector("h1.mins").innerHTML);
        const currSecs = Number(ClockContainer.querySelector("h1.secs").innerHTML);
        //Detener Reloj
        mainClockWorker.postMessage({
            action: 'stop'
        });
        // Modificar valores del modal
        modalEdit.querySelector(".hours input").value = currHours;
        modalEdit.querySelector(".mins input").value = currMins;
        modalEdit.querySelector(".secs input").value = currSecs;
        //Abrir modal
        modalEdit.classList.add('show');
    });
    //Cancelar editar hora en modal
    modalEdit.querySelector("a.button.cancel").addEventListener('click', e => {
        e.preventDefault();
        modalEdit.classList.remove('show');
    });

    //Aceptar cambio
    modalEdit.querySelector("a.button.accept").addEventListener("click", e => {
        e.preventDefault();
        let newHours = Number(modalEdit.find("h1.hours input").val())
        let newMins = Number(modalEdit.find("h1.mins input").val())
        let newSecs = Number(modalEdit.find("h1.secs input").val())
        let time = {
            hours: newHours,
            mins: newMins,
            secs: newSecs,
        };
        // TODO:
        // Cambiar reloj
        mainClockWorker.postMessage({
            action: 'setTime',
            time: time,
        });
        // Boton para reiniciar el servidor
        $('.button#btn-reset-all').on("click", e => {
            e.preventDefault();
            resetSession();
        })
    });

    // Boton para reiniciar el servidor
    document.querySelector('.button#btn-reset-all').addEventListener("click", e => {
        e.preventDefault();
        resetSession();
    });
}

function initServer() {
    // handle sockets
    fs.readFile("./serverList.json", (err, data) => {

        // try connecting with peers
        let serverList = JSON.parse(data);
        serverList.peers.forEach(sv => {
            let socket = new net.Socket();
            socket.connect({ port: sv.port, host: sv.host }, () => {
                console.log(`connected to server ${sv.host}:${sv.port}`);
                this._peers.push(socket);
            });
            socket.on('end', () => {
                console.log(`disconnected from server ${sv.host}:${sv.port}`);
            });
        });

        // create a TCP server for new peers to connect to
        serverList.peers.push({
            host: "localhost",
            port: port
        });
        this._server = net.createServer(c => {

            let client = `${c.address}:${c.port}`;
            console.log(`${client} connected`);

            // event delegation for current connections
            c.on('data', (data) => {
                console.log(`received request from ${client}`);
                let msg = JSON.parse(data.toString());
                console.log(msg);
            });
            c.on('close', () => {
                console.log(`${client} disconnected`);
                let idx = this._peers.indexOf(c);
                if (idx !== -1) {
                    this._peers.splice(idx, 1);
                }
            });
            c.on('error', err => console.log(err));

            peers.push(c);
        });
        this._server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log('Address in use, retrying...');
                setTimeout(() => {
                    server.close();
                    server.listen(port);
                }, 1000);
            } else {
                throw err;
            }
        });
        this._server.listen(port, () => {
            console.log(`server bound on port ${port}`);
        });
        fs.writeFile('./serverList.json', JSON.stringify(serverList));
    });
}

async function showAllAvailableBooks() {
    getAvailableBooks().then((books) => {
        const allBooksContainer = document.querySelector('.all-books');
        allBooksContainer.innerHTML =
            books.reduce((html, book) => {
                const { ISBN, autor, nombre } = book;
                return `${html}
                    <div class="book-title">
                     <h4>${nombre}</h4>
                     <p>${autor}</p>
                     <p>${ISBN}</p>
                 </div>`
            }, '');
    });
}

// Funcion que llena la interfaz con los datos de un libro
function fillInfoBook(value) {
    let lastBookContainer = document.querySelector('#last-book');
    //Alerta
    Swal.fire({
        title: 'Solicitud entrante',
        text: 'Un cliente ha solicitado un libro',
        icon: 'info',
        confirmButtonText: 'Aceptar'
    });
    //Adquirir datos
    const { nombre, autor, editorial, precio, ISBN, imagen } = value;
    lastBookContainer.querySelector("p#nombre span").innerHTML = nombre;
    lastBookContainer.querySelector("p#autor span").innerHTML = autor;
    lastBookContainer.querySelector("p#editorial span").innerHTML = editorial;
    lastBookContainer.querySelector("p#precio span").innerHTML = precio;
    lastBookContainer.querySelector("p#ISBN span").innerHTML = ISBN;
    lastBookContainer.querySelector("img#book-cover").setAttribute("src", `..${imagen}`);
    //Mostrar contenido
    lastBookContainer.classList.add('visible');
    //Actualizar los libros a prestar
    showAllAvailableBooks();

}

function enableClientReset() {
    connections.forEach(c => {
        let resp = {
            type: "enableReset",
        };
        c.write(JSON.stringify(resp));

        c.on('data', (data) => {
            let msg = JSON.parse(data.toString());
            console.log(msg);
            if (msg?.type === "reset") {
                resetSession();
            }
        });
    });
}

function resetSession() {
    resetBooks().catch(console.error);
    connections.forEach(conn => conn.end());
    connections = [];

    showAllAvailableBooks();
    lastBookContainer.classList.remove('visible');
    //Alerta
    Swal.fire({
        title: 'Reinicio',
        text: 'Se ha reiniciado la sesion',
        icon: 'info',
        confirmButtonText: 'Aceptar'
    });
}