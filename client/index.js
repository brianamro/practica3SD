const net = require('net');

import Clock from '../common/clock.js';
import {asDoubleDigit, updateClockDom} from '../common/utils.js';

const SERVER_PORT = 5500;
const SERVER_IP = "201.97.248.217"

var clock;

var socket;

export default function main() {
    clock = new Clock();
    socket = net.connect({port: SERVER_PORT, host: SERVER_IP});

}