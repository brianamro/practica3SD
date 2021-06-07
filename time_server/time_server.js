const net = require('net');
const { setTimeout } = require('timers');


const server = net.createServer();
server.on('connection', (client) => {
  console.log ('Client ')
});
  
server.on('error', (err) => {
    console.log("Error al iniciar socket");
});
  
server.listen(8124, () => {
    console.log('time server bound');
});







