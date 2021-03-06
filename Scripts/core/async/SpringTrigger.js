


/*CLASS*/
//function C
// END ASYNC RESULT

/*CLASS*/
function SpringTrigger(callback, pause) {
    BaseObject.apply(this, arguments);
    this.callback = callback;
    this.pause = ((pause == null)?1000:pause);
}
SpringTrigger.Inherit(BaseObject, "SpringTrigger");
SpringTrigger.prototype.obliterate = function(bFull) {
    BaseObject.obliterate(this.callback);
    BaseObject.prototype.obliterate.call(this, bFull);
};
SpringTrigger.prototype.wond = false;
SpringTrigger.prototype.timeResting = 0;
SpringTrigger.prototype.windup = function () {
    Ticker.Default.add(this);
    Ticker.Default.start();
    if (!this.wond) {
        this.wond = true;
    }
    this.timeResting = 0;
};
SpringTrigger.prototype.tick = function () {
    this.timeResting += Ticker.Default.timeout;
    if (this.timeResting > this.pause) {
        Ticker.Default.remove(this);
        this.wond = false;
        BaseObject.callCallback(this.callback);
    }
};
SpringTrigger.prototype.equals = function (obj) {
    if (!BaseObject.prototype.equals.call(this, obj)) return false;
    if (this != obj) return false;
    return true;
};