const net = require('net');
const Swal = require('sweetalert2');

import { updateClockDom } from '../common/utils.js';
import { getBooks, getRandomBook, resetBooks, areAvailableBooks, logRequest, getAvailableBooks } from "./db.js";

var mainClockWorker;
var connections;
var server;

export default function main() {
    initClock();
    initServer();
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

// Modal para editar reloj
const modalEdit = document.querySelector("#modal-edit-clock");
// Boton para editar el reloj
document.querySelector('#clock-s a.edit-clock').addEventListener('click', e=>{
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
})
//Cancelar editar hora en modal
modalEdit.querySelector("a.button.cancel").addEventListener('click', e=>{
    e.preventDefault();
    modalEdit.classList.remove('show');
})

//Aceptar cambio
modalEdit.querySelector("a.button.accept").addEventListener("click", e=>{
    e.preventDefault();
    let newHours = Number(modalEdit.find("h1.hours input").val())
    let newMins=    Number(modalEdit.find("h1.mins input").val())
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
    // Cerrar modal
    modalEdit.removeClass("show");
})


const lastBookContainer = document.querySelector('#last-book');
// Boton para reiniciar el servidor
document.querySelector('.button#btn-reset-all').addEventListener("click", e => {
    e.preventDefault();
    resetSession();
})
async function showAllAvailableBooks() {
    getAvailableBooks().then((books) => {
        const allBooksContainer = document.querySelector('.all-books');
        allBooksContainer.innerHTML = 
            books.reduce( (html,book) => {
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

function initServer() {
    connections = [];

    //Llenar contenedor de libros disponibles
    showAllAvailableBooks();

    server = net.createServer((c) => {
        // 'connection' listener.
        console.log(`${c.address().address} connected`);
        areAvailableBooks().then(res => {
            if (!res) {
                enableClientReset();
            }
        }).catch(console.error);
        c.on('data', (data) => {
            console.log(`received request from ${c.address().address}`);
            let msg = JSON.parse(data.toString());
            console.log(msg);
            if (msg?.type === "requestBook") {
                getRandomBook().then(book => {
                    let resp = {
                        type: "success",
                        info: {
                            book: book
                        }
                    }
                    c.write(JSON.stringify(resp));
                    console.log(resp);

                    logRequest(c.address().address, book.ISBN).catch(console.error);

                    areAvailableBooks().then(res => {
                        if (!res) {
                            enableClientReset();
                        }
                    }).catch(console.error);
                    fillInfoBook(book);
                }).catch(err => {
                    let resp = {
                        type: "error",
                        info: {
                            error_msg: "Error al obtener un libro prestado."
                        }
                    }
                    c.write(JSON.stringify(resp));
                    console.error(err);
                });
            }
        });

        let closeHandler = (function () {
            let address = c.address().address;
            return function () {
                console.log(`${address} disconnected`);
                let idx = connections.indexOf(c);
                if (idx !== -1) {
                    connections.splice(idx, 1);
                }
            }
        })();
        c.on('end', closeHandler);
        c.on('error', closeHandler);

        connections.push(c);
    });

    server.on('error', (err) => {
        if (e.code === 'EADDRINUSE') {
            console.log('Address in use, retrying...');
            setTimeout(() => {
                server.close();
                server.listen(PORT, HOST);
            }, 1000);
        } else {
            throw err;
        }
    });

    server.listen(5500, () => {
        console.log('server bound');
    });
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