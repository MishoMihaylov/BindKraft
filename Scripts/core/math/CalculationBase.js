function CalculationBase() {
	BaseObject.apply(this, arguments);
}
CalculationBase.Inherit(BaseObject, "CalculationBase");
CalculationBase.prototype.execute = function(input) {
	throw "not implemented";
}