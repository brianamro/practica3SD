const asDoubleDigit = num => ((num < 10) ? ("0" + num) : num.toString());

const updateClockDom = (domElement, clock) => {
    domElement.querySelector("h1.hours").innerHTML = asDoubleDigit(clock?.hours);
    domElement.querySelector("h1.mins").innerHTML = asDoubleDigit(clock?.minutes);
    domElement.querySelector("h1.secs").innerHTML = asDoubleDigit(clock?.seconds);
}

export {
    asDoubleDigit,
    updateClockDom
}