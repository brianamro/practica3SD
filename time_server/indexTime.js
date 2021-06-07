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

const server = net.createServer((c) => {
    // 'connection' listener.
    console.log('client connected');
    c.on('end', () => {
      console.log('client disconnected');
    });
    c.write('hello\r\n');
    c.pipe(c);
});
  
server.on('error', (err) => {
    console.log("Error al iniciar socket");
});
  
server.listen(hostPortTimeServer, () => {
    console.log('time server bound');
});






