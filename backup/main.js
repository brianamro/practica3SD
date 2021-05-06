const net = require('net');

import { resetBooks, setBorrowedBook, logRequest, resetLogin } from "./db.js";

var server;

(function main() {
    initServer();
})();

function initServer() {
    server = net.createServer((c) => {
        // 'connection' listener.
        console.log(`${c.address().address} connected`);

        c.on('data', (data) => {
            console.log(`received request from ${c.address().address}`);
            let msg = JSON.parse(data.toString());
            console.log(msg);
            if (msg?.type === "resetBooks") {
                resetBooks().then(console.log, console.error);
            } else if (msg?.type === "setBorrowedBook") {
                setBorrowedBook(msg.data.bookID).then(console.log, console.error);
            } else if (msg?.type === "logRequest") {
                logRequest(msg.data).then(console.log, console.error);
            } else if (msg?.type === "resetLogin") {
                resetLogin().then(console.log, console.error);
            }
        });

        let closeHandler = (function () {
            let address = c.address().address;
            return function () {
                console.log(`${address} disconnected`);
            }
        })();
        c.on('end', closeHandler);
        c.on('error', closeHandler);
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

    server.listen(5600, () => {
        console.log('server bound');
    });
}