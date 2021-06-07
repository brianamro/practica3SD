const net = require('net');
const { setTimeout } = require('timers');

const hostPortTimeServer = {
    "host": "localhost",
    "port": 5510
}

export default function main() {
    // initClock();
    server();
    // initComponents();
}

const server = net.createServer();
server.on('connection', (client) => {
  console.log ('Client ')
});
  
server.on('error', (err) => {
    console.log("Error al iniciar socket");
});
  
server.listen(hostPortTimeServer, () => {
    console.log('time server bound');
});







