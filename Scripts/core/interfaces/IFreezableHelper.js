


/*INTERFACE*/
function IFreezableHelper() {}
IFreezableHelper.Interface("IFreezableHelper");
IFreezableHelper.RequiredTypes("IFreezable");
IFreezableHelper.prototype.$frozeEventsBlock = function(func) {
	if (typeof func == "function") {
		this.freezeEvents(this, func);
	} 
}