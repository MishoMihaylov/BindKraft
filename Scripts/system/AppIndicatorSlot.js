function AppIndicatorSlot() {
	Base.apply(this, arguments);
}
AppIndicatorSlot.Inherit(Base,"AppIndicatorSlot");
AppIndicatorSlot.Implement(IUIControl);
AppIndicatorSlot.Implement(ICustomParameterizationStdImpl,"class");
AppIndicatorSlot.ImplementProperty("class", new InitializeStringParameter("For initial parameterization only",null));
AppIndicatorSlot.ImplementProperty("indicator", new Initialize("pluginto slot for the indicator component", null)); // it has to support IAppIndicator
AppIndicatorSlot.prototype.$indicatorclass = null;
AppIndicatorSlot.prototype.get_indicatorclass = function() {
	return this.$indicatorclass;
}
AppIndicatorSlot.prototype.set_indicatorclass = function(v) {
	if ( typeof v == "string") { // if different refill the slot
		if (this.$indicatorclass != v) {
			this.$emptySlot();
			// new class
			var newClass = Class.getClassDef(v);
			if (Class.is(newClass, "IAppIndicator") && Class.is(newClass, "Base")) {
				this.$fillSlot(newClass);
			}			
		}
	} else if (v == null) { // Empty the slot
		if (this.$indicatorclass != null) {
			// TODO: Empty this
			this.$emptySlot();
		}
	} else {
		// May be throw?
	}
	
}
AppIndicatorSlot.prototype.finalinit = function() {
	var cls = this.get_class();
	if (cls != null) {
		this.set_indicatorclass(cls);
	}
}
/////////////////////
AppIndicatorSlot.prototype.$emptySlot = function() {
	if (BaseObject.is(this.get_indicator(),"IAppIndicator")) {
		this.get_indicator().unPlug();
	}
	JBUtil.Empty(this.root);
	this.$indicator = null;
	this.$indicatorclass = null;
}
AppIndicatorSlot.prototype.$fillSlot = function(indClassDef) {
	if (Class.is(indClassDef, "IAppIndicator") && Class.is(indClassDef, "Base")) {
		var str = '<span data-class="' + indClassDef.classType + '" data-on-pluginto="{bind source=__control path=indicator}" data-context-border="true"></span>';
		ViewBase.cloneTemplate(this.root,str,{});
		this.rebind();
		this.updateTargets();
	}		
}
/////////////////////
