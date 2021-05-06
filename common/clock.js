const getRandom = maxNum => (Math.floor(Math.random() * maxNum));

export default class Clock {
    constructor(hours, mins, secs) {
        let now = new Date();
        hours = (hours ?? now.getHours()) % 24;
        mins =  (mins ?? now. getMinutes()) % 60;
        secs = (secs ?? now.getSeconds()) % 60;
        this._seconds = hours * 60 * 60 + mins * 60 + secs;
    }
    get time() {
        let hours = Math.floor(this._seconds / (60 * 60));
        let minutes = Math.floor((this._seconds - hours * 60 * 60) / 60);
        let seconds = this._seconds - minutes * 60 - hours * 60 * 60;
        return {
            hours: hours,
            minutes: minutes,
            seconds: seconds
        };
    }
    set time(newTime) {
        newTime.hours %= 24;
        newTime.mins %= 60;
        newTime.secs %= 60;
        this._seconds = newTime.hours * 60 * 60 + newTime.mins * 60 + newTime.secs;
    }
    advance() {
        this._seconds = (this._seconds + 1) % (24 * 60 * 60);
    }
}
