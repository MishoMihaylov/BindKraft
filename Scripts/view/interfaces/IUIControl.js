


/*INTERFACE*/
function IUIControl() {
}
IUIControl.Interface("IUIControl");
IUIControl.RequiredTypes("Base");
IUIControl.prototype.get_controlparameter = function (pname) {
    if (typeof this["get_" + pname] == "function") {
        return this["get_" + pname]();
    } else {
        return this[pname];
    }
}