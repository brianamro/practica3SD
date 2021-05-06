import {asDoubleDigit, updateClockDom} from '../common/utils.js';

var workerM = new Worker('../common/worker.js', { type: "module" });

//Reloj Maestro
workerM.onmessage = e => {
    let clockM = e.data;
    updateClockDom($(".clock#clock-m"), clockM);
}

export default function main() {
    workerM.postMessage({
        name: "Reloj Maestro"
    });
}