const net = require('net');

import { getBooks, takeBook, resetBooks } from "./db";

let connections = [];

let server = net.createServer((c) => {
    // 'connection' listener.
    console.log('client connected');
    c.on('end', () => {
        console.log('client disconnected');
    });
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

server.listen(8124, () => {
    console.log('server bound');
});

function resetSession(){
    connections.forEach(conn => {
        conn.close();
    });
    connections = []
}