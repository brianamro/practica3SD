const logClock = (name, time) => {
    console.log(`${name}: ${time.hours}:${time.minutes}:${time.seconds}`);
}

const asDoubleDigit = num => ((num < 10) ? ("0" + num) : num.toString());

const modalEdit = $("#modal-edit-clock");
var editingClock;       //Variable global con el id del reloj a editar

//Cerrar Modal
modalEdit.find("a.button.cancel").on("click", e=>{
    e.preventDefault();
    modalEdit.removeClass("show");
})

//Aceptar cambio
modalEdit.find("a.button.accept").on("click", e=>{
    e.preventDefault();
    let newHours = Number(modalEdit.find("h1.hours input").val())
    let newMins= Number(modalEdit.find("h1.mins input").val())
    let newSecs = Number(modalEdit.find("h1.secs input").val())
    let time = {
        hours: newHours,
        mins: newMins,
        secs: newSecs,
    };
    //Camnbiar reloj
    if(editingClock === 0)
        workerM.postMessage({
            action: 'setTime',
            time: time,
        });
    else if(editingClock === 1)
        worker1.postMessage({
            action: 'setTime',
            time: time,
        });
    else if(editingClock === 2)
        worker2.postMessage({
            action: 'setTime',
            time: time,
        });
    else if(editingClock === 3)
        worker3.postMessage({
            action: 'setTime',
            time: time,
        });
    //Cerrar modal
    modalEdit.removeClass("show");
})

const openModalEditCLock = (currHours, currMins, currSecs) =>{
    modalEdit.find(".hours input").val(currHours);
    modalEdit.find(".mins input").val(currMins);
    modalEdit.find(".secs input").val(currSecs);
    let titleCLock = (editingClock===0) ? 'Maestro' : editingClock.toString();
    modalEdit.find("h3 span").html(titleCLock);
    modalEdit.addClass("show");
}

const assignEditController = (worker, domElement, idClock) => {
    domElement.on('click', e => {
        e.preventDefault();
        let currHours = Number(domElement.parent().find("h1.hours").html());
        let currMins = Number(domElement.parent().find("h1.mins").html());
        let currSecs = Number(domElement.parent().find("h1.secs").html());
        //Detener Reloj
        worker.postMessage({
            action: 'stop'
        })
        editingClock = idClock;
        openModalEditCLock(currHours, currMins, currSecs);
    })
}

const assignSendController = (worker, domElement) => {
    domElement.on('click', function (e) {
        e.preventDefault()
        worker.postMessage({
            action: 'send'
        });
    })
}

const assignVelocityController = (worker, domElements) => {
    let velocity = 1.0;
    let delta = 1.0;
    let maximum = 100;
    const delayAnimation = 1500;

    (() => {
        domElements.increase.on('click', e => {
            e.preventDefault();
            let notification = $(this).parent().find(".notification");
            let notifMessage;

            if ((velocity + delta) < maximum) {
                velocity += delta;
                console.log("Increasing velocity to " + velocity);
                notifMessage = `<p>Incrementando a ${velocity.toFixed(1)}</p>`;
                worker.postMessage({
                    action: 'setVelocity',
                    velocity: velocity
                });
            }

            notification.html(notifMessage).addClass("appear");
            setTimeout(() => { notification.removeClass("appear") }, delayAnimation);

        });
        domElements.decrease.on('click', e => {
            e.preventDefault();
            let notification = $(this).parent().find(".notification");
            let notifMessage;

            if ((velocity - delta) > 0) {
                velocity -= delta;
                console.log("Decreasing  to " + velocity);
                notifMessage = `<p>Decrementando a ${velocity.toFixed(1)}</p>`;
                worker.postMessage({
                    action: 'setVelocity',
                    velocity: velocity
                });
            }

            notification.html(notifMessage).addClass("appear");
            setTimeout(() => { notification.removeClass("appear") }, delayAnimation);
        });

    })();
}

const updateClockDom = (domElement, clock) => {
    domElement.find("h1.hours").html(asDoubleDigit(clock.hours));
    domElement.find("h1.mins").html(asDoubleDigit(clock.minutes));
    domElement.find("h1.secs").html(asDoubleDigit(clock.seconds));
}

var workerM = new Worker('../common/worker.js', { type: "module" });
var worker2 = new Worker('../common/worker.js', { type: "module" });
var worker3 = new Worker('../common/worker.js', { type: "module" });
var worker1 = new Worker('../common/worker.js', { type: "module" });

//Reloj Maestro
workerM.onmessage = e => {
    let clockM = e.data;
    // logClock('Master Clock', clockM);
    updateClockDom($(".clock#clock-m"), clockM);
}
//Reloj 1
worker1.onmessage = e => {
    let clock1 = e.data;
    // logClock('Clock 1', clock1);
    updateClockDom($(".clock#clock-1"), clock1);
}
//Reloj 2
worker2.onmessage = e => {
    let clock2 = e.data;
    // logClock('Clock 2', clock2);
    updateClockDom($(".clock#clock-2"), clock2);
}
//Reloj 3
worker3.onmessage = e => {
    let clock3 = e.data;
    // logClock('Clock 3', clock3);
    updateClockDom($(".clock#clock-3"), clock3);
}

export default function main() {
    workerM.postMessage({
        name: "Reloj Maestro"
    });
    worker1.postMessage({
        name: "Reloj 1",
        destAddr: {
            port: 41234,
            ip: "localhost"
        }
    });
    worker2.postMessage({
        name: "Reloj 2",
        destAddr: {
            port: 41235,
            ip: "localhost"
        }
    });
    worker3.postMessage({
        name: "Reloj 3",
        destAddr: {
            port: 41236,
            ip: "localhost"
        }
    });

    assignEditController(workerM, $(".clock#clock-m .edit-clock"), 0);
    assignVelocityController(workerM, {
        increase: $(".clock#clock-m .increase"),
        decrease: $(".clock#clock-m .decrease")
    });

    assignEditController(worker1, $(".clock#clock-1 .edit-clock"), 1);
    assignSendController(worker1, $(".clock#clock-1 .send-clock"));
    assignVelocityController(worker1, {
        increase: $(".clock#clock-1 .increase"),
        decrease: $(".clock#clock-1 .decrease")
    });

    assignEditController(worker2, $(".clock#clock-2 .edit-clock"), 2);
    assignSendController(worker2, $(".clock#clock-2 .send-clock"));
    assignVelocityController(worker2, {
        increase: $(".clock#clock-2 .increase"),
        decrease: $(".clock#clock-2 .decrease")
    });

    assignEditController(worker3, $(".clock#clock-3 .edit-clock"), 3);
    assignSendController(worker3, $(".clock#clock-3 .send-clock"));
    assignVelocityController(worker3, {
        increase: $(".clock#clock-3 .increase"),
        decrease: $(".clock#clock-3 .decrease")
    });
}