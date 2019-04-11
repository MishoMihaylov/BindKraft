


/*INTERFACE*/
function ITargetedMessage() { }
ITargetedMessage.Interface("ITargetedMessage");
ITargetedMessage.prototype.confirmTarget = function (subscriber) {
    if (this.target != null && this.target.equals(subscriber)) return true;
    return false;
};