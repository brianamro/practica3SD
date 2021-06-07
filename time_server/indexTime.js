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






<<<<<<< HEAD:time_server/time_server.js

=======
>>>>>>> e14bc4d2018c57c5cf728ca2aabc78a736fad489:time_server/indexTime.js
