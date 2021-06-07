const net = require('net');
const { setTimeout } = require('timers');


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
  
server.listen(8124, () => {
    console.log('time server bound');
});






