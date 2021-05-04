const dgram = require('dgram');

import Clock from '../common/clock.js';

var clock = new Clock();
var interval = 1.0;
var server = dgram.createSocket('udp4');

const asDoubleDigit = num => ((num < 10) ? ("0" + num) : num.toString());

var mlHandler = setInterval(
    () => {
        clock.advance();
        updateClockDom($('.clock'), clock.time);
    },
    1000
)

const updateClockDom = (domElement, clock) => {
    domElement.find("h1.hours").html(asDoubleDigit(clock.hours));
    domElement.find("h1.mins").html(asDoubleDigit(clock.minutes));
    domElement.find("h1.secs").html(asDoubleDigit(clock.seconds));
}

export default function main() {
    server.on('error', (err) => {
        console.log(`server error:\n${err.stack}`);
        server.close();
    });

    server.on('message', (msg, rinfo) => {
        clearInterval(mlHandler);

        let objMsg = JSON.parse(msg);
        console.log(objMsg);
        clock = new Clock(objMsg.time.hours, objMsg.time.minutes, objMsg.time.seconds);

        $('#main-content h2').html(objMsg.name);

        updateClockDom($('.clock'), clock.time);

        mlHandler = setInterval(
            () => {
                clock.advance();
                updateClockDom($('.clock'), clock.time);
            },
            1000 * objMsg.velocity
        )
    });

    server.on('listening', () => {
        const address = server.address();
        console.log(`server listening ${address.address}:${address.port}`);
    });

    server.bind(41236);

}