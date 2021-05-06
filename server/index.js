const asDoubleDigit = num => ((num < 10) ? ("0" + num) : num.toString());

const updateClockDom = (domElement, clock) => {
    domElement.find("h1.hours").html(asDoubleDigit(clock.hours));
    domElement.find("h1.mins").html(asDoubleDigit(clock.minutes));
    domElement.find("h1.secs").html(asDoubleDigit(clock.seconds));
}

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