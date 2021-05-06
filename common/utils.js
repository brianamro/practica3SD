const asDoubleDigit = num => ((num < 10) ? ("0" + num) : num.toString());

const updateClockDom = (domElement, clock) => {
    domElement.find("h1.hours").html(asDoubleDigit(clock.hours));
    domElement.find("h1.mins").html(asDoubleDigit(clock.minutes));
    domElement.find("h1.secs").html(asDoubleDigit(clock.seconds));
}

export {
    asDoubleDigit,
    updateClockDom
}