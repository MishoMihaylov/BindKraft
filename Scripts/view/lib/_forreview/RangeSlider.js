//Asadasdasd

function RangeSlider() {
    Base.apply(this, arguments);
}

RangeSlider.Inherit(Base, "RangeSlider");
RangeSlider.Implement(IUIControl);

RangeSlider.Implement(ICustomParameterization);
RangeSlider.parameterNames = ["currentvalue", "disabled", "showcounter"];
RangeSlider.prototype.setObjectParameter = function(name, value, type) {
	if (name.inSet(RangeSlider.parameterNames)) return true;
	return false;
}

RangeSlider.ImplementActiveProperty("currentvalue", new InitializeNumericParameter("Slider's current value", null), null, null, "ChangeCurrentValue");

RangeSlider.ImplementProperty("disabled", new InitializeBooleanParameter("Is the slider disabled for slinding(only for the user).", false));
RangeSlider.ImplementProperty("showcounter", new InitializeBooleanParameter("Does the control shows the current value of the slider in a field.", true));
RangeSlider.ImplementProperty("min", new InitializeNumericParameter("Minimum value possible that the slider can slide to.", 0));
RangeSlider.ImplementProperty("max", new InitializeNumericParameter("Max value possible that the slider can slide to.", 100));
RangeSlider.ImplementProperty("step", new InitializeNumericParameter("Step of incrementing/decremeting of the slider.", 1));


RangeSlider.prototype.init = function(){
    var sliderTemplate = this.GetSliderTemplate();
    var currElement = $$(this.root).first();
    currElement.empty().append(sliderTemplate);
    
    if(this.get_showcounter()){
        var counterTemplate = this.GetCounterTemplate();
        currElement.append(counterTemplate);
    }
}

RangeSlider.prototype.finalinit = function(){
    this.OnSliderChange();
}

//TODO: Consider using this.Child ??
RangeSlider.prototype.getSlider = function(){
    return $$(this.root).first().select("input[type='range']").first().getNative();
}

RangeSlider.prototype.ChangeCurrentValue = function(){
    this.getSlider().value = this.get_currentvalue();
}

RangeSlider.prototype.OnSliderChange = function(){
    var currValue = this.getSlider().value;
    this.set_currentvalue(currValue);
}

//Template related functions
RangeSlider.prototype.GetSliderTemplate = function(){
    var inputTemplate = new DOMMNode('<input>')
        .attributes("type", "range")
        .attributes("min", this.get_min())
        .attributes("max", this.get_max())
        .attributes("step", this.get_step())
        .attributes("data-on-change", "{bind source=__control path=OnSliderChange}")
        .attributes("data-on-input", "{bind source=__control path=OnSliderChange}")
        .getNative();

    if(this.get_disabled()){
        inputTemplate.attributes("disabled", "true");
    } 

    return inputTemplate;
}

RangeSlider.prototype.GetCounterTemplate = function(){
    var counterTemplate = new DOMMNode("<span>")
        .attributes("data-bind-text", "{read source=__control path=$currentvalue readdata=$currentvalue_changed}")

    return counterTemplate;
}