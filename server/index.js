const net = require('net');
const Swal = require('sweetalert2');

import { updateClockDom } from '../common/utils.js';
import { getBooks, getRandomBook, resetBooks, areAvailableBooks, logRequest, getAvailableBooks } from "./db.js";

var mainClock;
var connections;
var server;

export default function main() {
    initClock();
    initServer();
}

function initClock() {
    mainClock = new Worker('../common/worker.js', { type: "module" });
    //Reloj Maestro
    mainClock.onmessage = e => {
        updateClockDom($(".clock#clock-m"), e.data);
    };
    mainClock.postMessage({
        name: "Reloj Maestro"
    });
}

const lastBookContainer = $('#last-book');
// Boton para reiniciar el servidor
$('.button#btn-reset-all').on("click", e => {
    e.preventDefault();
    resetSession();
})
async function showAllAvailableBooks() {
    getAvailableBooks().then((books) => {
        const allBooksContainer = $('.all-books');
        allBooksContainer.html("");
        books.forEach(book => {
            const { ISBN, autor, nombre } = book;
            let newBook =
                `<div class="book-title">
                 <h4>${nombre}</h4>
                 <p>${autor}</p>
                 <p>${ISBN}</p>
             </div>`
            allBooksContainer.append(newBook);
        });
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
    lastBookContainer.find("p#nombre span").html(nombre);
    lastBookContainer.find("p#autor span").html(autor);
    lastBookContainer.find("p#editorial span").html(editorial);
    lastBookContainer.find("p#precio span").html(precio);
    lastBookContainer.find("p#ISBN span").html(ISBN);
    lastBookContainer.find("img#book-cover").attr("src", `..${imagen}`);
    //Mostrar contenido
    lastBookContainer.slideDown(250);
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
    lastBookContainer.slideUp();
    //Alerta
    Swal.fire({
        title: 'Reinicio',
        text: 'Se ha reiniciado la sesion',
        icon: 'info',
        confirmButtonText: 'Aceptar'
    });
}