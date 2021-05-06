const net = require('net');

import { updateClockDom } from '../common/utils.js';
import { getBooks, getRandomBook, resetBooks, areAvailableBooks, logRequest } from "./db.js";

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

function initServer() {
    connections = [];
    server = net.createServer((c) => {
        // 'connection' listener.
        console.log(`${c.address().address} connected`);

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

                    logRequest(c.address().address, book.ISBN).catch(console.error);

                    areAvailableBooks().then(res => {
                        if (!res) {
                            enableClientReset();
                        }
                    }).catch(console.error);
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
}