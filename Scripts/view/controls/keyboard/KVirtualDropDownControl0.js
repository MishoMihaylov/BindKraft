


/*
<el>
	<selection> -- holds the focus and shows the selected item (if any)
	<data-area> -- This is the drop down panel
		<scrollable-area>
			<selectable-repeater>
			</selectable-repeater>
		</scrollable-area>
	</data-area>
</el>


*/


function VirtualDropDownKeyboardControl() {
	Base.apply ( this, arguments );
	this.onAccelerator = new Delegate(this, this.$onAccelAction);
}

//-----------------------------------------------------

VirtualDropDownKeyboardControl.Inherit ( Base, "VirtualDropDownKeyboardControl" );
VirtualDropDownKeyboardControl.Implement ( IUIControl );
VirtualDropDownKeyboardControl.Implement ( IDisablable );
VirtualDropDownKeyboardControl.Implement ( IProcessAcceleratorsImpl );

//-----------------------------------------------------

VirtualDropDownKeyboardControl.prototype.defaultTemplateName = ".j_framework_control_vdropdown_k";
VirtualDropDownKeyboardControl.prototype.disabledCss = new InitializeStringParameter("Optional CSS class to assign to the root element when the repeater is disabled.","f_select_disabled");
VirtualDropDownKeyboardControl.prototype.enabledCss = new InitializeStringParameter("Optional CSS class to assign to the root element when the repeater is enabled.", "f_select_enabled");
VirtualDropDownKeyboardControl.ImplementProperty("keyproperty", new InitializeStringParameter("The name of the property that will be used as unique key to distinguish between the items.", "lookupkey"));
VirtualDropDownKeyboardControl.ImplementProperty("descproperty", new InitializeStringParameter("The name of the property that will be used as display name for the items (this is what is visible for the user).", "lookupdescription"));
VirtualDropDownKeyboardControl.ImplementProperty("titleproperty", new InitializeStringParameter("The name of the property that will be used as title for the items (this is what is visible for the user).", "title"));
VirtualDropDownKeyboardControl.ImplementProperty("maxlen", new InitializeNumericParameter("Limit the display text of the items to the specified number of symbols. Default is 55", 55));
VirtualDropDownKeyboardControl.ImplementProperty("captlen", new InitializeNumericParameter("Limit the display text of the items to the specified number of symbols. Default is 55", null));
VirtualDropDownKeyboardControl.ImplementProperty("templateName", new InitializeStringParameter("The id of the control template. Null denotes the standard built-in templates.", null));
VirtualDropDownKeyboardControl.ImplementProperty("pendingtimeout", new InitializeNumericParameter("Timeout for pending operations in milliseconds. Default is 50.",300));

// an event property for the binding
VirtualDropDownKeyboardControl.prototype.accelevent = new InitializeEvent ( "Event for the accelerators" );
// data-class="VirtualDropDownKeyboardControl ... " data-on-$accelevent="{bind source=viewroot path=on.....}"
VirtualDropDownKeyboardControl.ImplementProperty ( "accelforitem", new Initialize ( "A callback to supply accelerator descriptor for an item. Proto: f(this, index, item )", null));
VirtualDropDownKeyboardControl.ImplementProperty ( "acceldescriptor", new InitializeStringParameter ( "If string and no callback accelforitem is set - denotes a property on the items from which the accel definition (descriptor) is obtained by the internal default callback.", null ) );
VirtualDropDownKeyboardControl.ImplementProperty ( "accelAll", new InitializeBooleanParameter ( "Applies the accelerators either for all or only for the shown elements", false ) );
VirtualDropDownKeyboardControl.ImplementProperty ( "firstCall", new InitializeBooleanParameter ( "Flag for the first call to the user defined callback", true ) );


VirtualDropDownKeyboardControl.prototype.selchangedevent = new InitializeEvent("Fired every time the selection changes");
VirtualDropDownKeyboardControl.prototype.activatedevent = new InitializeEvent("Fired whenever the selection is confirmed - enter pressed or when the user clicks on an item.");
VirtualDropDownKeyboardControl.prototype.openevent = new InitializeEvent("Fired whenever the dropdown opens.");
VirtualDropDownKeyboardControl.prototype.closeevent = new InitializeEvent("Fired whenever the dropdown closes.");

//-----------------------------------------------------



VirtualDropDownKeyboardControl.prototype.set_disabled = function (v) {
    IDisablable.prototype.set_disabled.apply(this, arguments);
    if (this.enabledCss != null && this.enabledCss.length > 0) {
        if (v) {
            $(this.root).removeClass(this.enabledCss);
        } else {
            $(this.root).addClass(this.enabledCss);
        }
    }
    if (this.disabledCss != null && this.disabledCss.length > 0) {
        if (v) {
            $(this.root).addClass(this.disabledCss);
        } else {
            $(this.root).removeClass(this.disabledCss);
        }
    }
};

VirtualDropDownKeyboardControl.prototype.$init = function() {
	var tmlLocal = $(this.root).children();
	var el = $(this.root);
	if (tmlLocal != null && tmlLocal.length > 0) {
		// Nothing for now
	} else {
		var tmlName = this.get_templateName();
		if (tmlName == null) tmlName = this.defaultTemplateName;
		var tml = $(tmlName);
		el.empty();
		el.append(el.append(tml.children().clone()));
    }
	Base.prototype.$init.apply(this, arguments);
}
VirtualDropDownKeyboardControl.prototype.$el_header = null;
VirtualDropDownKeyboardControl.prototype.$el_dataarea = null;
VirtualDropDownKeyboardControl.prototype.$el_list = null;
VirtualDropDownKeyboardControl.prototype.$el_scrollable = null;
VirtualDropDownKeyboardControl.ExtendMethod("init",function() {
	// Extract and verify nodes
	this.$el_header = this.child("headerelement");
	var f = $(this.$el_header).find('[data-purpose="focus"]');
	if (f != null && f.length > 0) f.prop("tabindex", -1); 
	this.$el_dataarea = this.child("da");
	this.$el_drop = this.$el_dataarea;
	this.$el_list = this.child("itemslist");
	this.$el_scrollable = this.childObject("sa");
	this.set_bodyVisible(this.get_bodyVisible());
	
	this.on("keyup", this.onKeyPress);
    this.on("keydown", this.onSwallow);
    this.on("keypress", this.onSwallow);
	
	this.set_disabled(this.get_disabled());
});

// This is the entry point for  the logic that defines the accelerator - it is called for an item and returns null or accell descriptor (see IProcessAccelerators)
VirtualDropDownKeyboardControl.prototype.$getAccelForItem = function (index, item){	
	// A callback to supply accelerator descriptor for an item
	var proc = this.get_accelforitem();
	var tmp = null;
	
	if ( BaseObject.isCallback ( proc ) )
	{
		tmp = BaseObject.callCallback ( proc, this, index, item ); // returns { key:, modifier: ,alt:, ctrl:, shift:} see IProcessAccelerators
		if ( this.get_firstCall () )
		{
			this.set_firstCall ( false );
		}
		return tmp;
	}
	else if ( BaseObject.is ( this.get_acceldescriptor(), "string" ) )
	{
		tmp = this.$internalGetAccelForItem ( index, item );
		if ( this.get_firstCall () )
		{
			this.set_firstCall ( false );
		}
		return tmp;
	}
	return null;
};
VirtualDropDownKeyboardControl.prototype.$internalGetAccelForItem = function(index, item) {
	if ( item != null ) {
		var acc = this.$manageAccelDescriptor ( item[this.get_acceldescriptor()] ); // Ctrl+Alt+C
		if ( BaseObject.is ( acc, "string" ) ) {
			// From the string generate accell descriptor
			var toBeReturned = null
			acc = acc.trim();
			if ( acc.length > 0 ) {
				toBeReturned = this.parseModifierFromText ( acc );
			}
			return toBeReturned;
		}
	}
	return null;
}
VirtualDropDownKeyboardControl.prototype.$onAccelAction = function(sender, accel) {
	this.set_selecteditem ( accel.userdata );
	this.ForceClose();
};
VirtualDropDownKeyboardControl.prototype.onAccelerator = null; // Runtime - a delegate to the internal accelerator processor.
VirtualDropDownKeyboardControl.prototype.get_items = function() {
	return this.$items;
};

// all items received from the database / source
VirtualDropDownKeyboardControl.prototype.set_items = function(v) {
	this.$items = v;
	var self = this;
	this.removeAllAccelerators();

	// !!! register for all 
	if ( this.get_accelAll() ) {
		// Generate all the accelerators for all the items
		this.$items.forEach ( function ( element, index, arr ) {
			var a = self.$getAccelForItem ( index, element );
			var name = null;
			if ( a != null ) {
				a.callback = self.onAccelerator;
				a.userdata = element;
				name = self.registerAccelerator ( a );
			}
			element.acceleratorkey = name;
		});
	}
	
	// When we finish we may need to just call the parent implementation here.
	this.discardAsync("update_targets");
	this.asyncUpdateTargets();
};

// items which are currently shown
VirtualDropDownKeyboardControl.prototype.supplyPagedItems = function ( start, end ) {
	var result = null;
	var self = this;
	if ( start == "length" ) {
		return ( BaseObject.is ( this.$items, "Array" ) ? this.$items.length : 0 );
	} else {
		
		// Clear accels
		if ( !this.get_accelAll() ) { this.removeAllAccelerators(); }
		
		if (BaseObject.is(this.$items, "Array")) {
			if (start == null || start < 0) start = 1;
			if (start > 0) {
				if (end > 0) {
					result = this.$items.slice(start - 1, start - 1 + end);
				} else {
					result = this.$items.slice(start - 1);
				}
			} else {
				result = this.$items;
			}
		} else {
			result = this.$items; // All of them
		}
	}
	if ( BaseObject.is ( result, "Array" ) ) {
		if ( !this.get_accelAll() ) {
			result = result.Select ( function ( idx, item ) {
				var acc = self.$getAccelForItem ( idx, item );
				if ( acc != null ) {
					acc.callback = self.onAccelerator;
					acc.userdata = item;
					var name = self.registerAccelerator(acc);
				}
				return {
					key				: item[self.get_keyproperty()],
					display			: item[self.get_descproperty()],
					title			: item[self.get_titleproperty()],
					acceleratorkey	: name /* We can add a property that displays the accel */
				};
			});
		} else {
			result = result.Select(function(idx , item) {
				var x = item;
				return {
					key				: item[self.get_keyproperty()],
					display			: item[self.get_descproperty()],
					title			: item[self.get_titleproperty()],
					acceleratorkey	: item.acceleratorkey // We can find the accel for this item in the $accelerators, but it is slow. Something better?
				};
			});
		}
	}
	return result;	
};
VirtualDropDownKeyboardControl.prototype.get_bodyVisible = function () { return this.$bodyVisible; };
VirtualDropDownKeyboardControl.prototype.set_bodyVisible = function (v) {
    if (this.get_disabled()) {
        this.$bodyVisible = false;
    } else {
        this.$bodyVisible = v;
    }
    if (this.$el_drop != null) {
        if (this.$bodyVisible) {
            if (this.get_disabled()) {
                $(this.$el_drop).hide();
            } else {
                $(this.$el_drop).show();
				if (this.$el_scrollable != null && $(this.$el_scrollable).activeclass() != null) {
					$(this.$el_scrollable).activeclass().onDataAreaChange();
				}
            }
        } else {
            $(this.$el_drop).hide();
        }
        // this.updateTargets();
    }
};
VirtualDropDownKeyboardControl.prototype.FocusHeader = function (e, dc) {
	var f = $(this.$el_header).find('[data-purpose="focus"]');
	if (f != null && f.length > 0) {
		f.focus();
	}
};
VirtualDropDownKeyboardControl.prototype.goActive = function (e, dc) {
    if (this.get_disabled()) return;
    if (this.get_bodyVisible()) return;
	var f = $(this.root).find('[data-purpose="focus"]');
	if (f != null && f.length > 0) {
		f.focus();
	}
    this.openevent.invoke(this, null);
    this.set_bodyVisible(true);
};
VirtualDropDownKeyboardControl.prototype.goInactive = function (e, dc) {
    if (!this.get_bodyVisible()) return;
    this.closeevent.invoke(this, null);
    this.set_bodyVisible(false);
};
VirtualDropDownKeyboardControl.prototype.toggleActive = function (e, dc) {
    if (this.get_bodyVisible()) {
        this.goInactive();
    } else {
        this.goActive();
    }
};
VirtualDropDownKeyboardControl.prototype.Open = function () {
    this.$schedulePending("open");
    // jbTrace.log("open");
};
VirtualDropDownKeyboardControl.prototype.Close = function () {
    this.$schedulePending("close");
    // jbTrace.log("close");
};
VirtualDropDownKeyboardControl.prototype.ForceClose = function () {
    this.$schedulePending("close", true);
    // jbTrace.log("close");
};
VirtualDropDownKeyboardControl.prototype.Toggle = function () {
    if (this.get_bodyVisible()) {
        this.$schedulePending("close");
    } else {
        this.$schedulePending("open");
    }
    // jbTrace.log("toggle");
};
VirtualDropDownKeyboardControl.prototype.$pendingOperationHandler = function () {
    this.$pendingOperationHandlerWrapper = null;
    var op = this.$pendingOperation;
    this.$pendingOperation = null;
    if (op != null) {
        switch (op) {
            case "open":
                this.goActive();
                break;
            case "close":
            case "forceclose":
                this.goInactive();
                break;
        }
    }
};
VirtualDropDownKeyboardControl.prototype.$pendingOperationHandlerWrapper = null;
VirtualDropDownKeyboardControl.prototype.$pendingOperation = null;
VirtualDropDownKeyboardControl.prototype.$schedulePending = function (op, force) {
    if (op != null) {
        if (op == "open" && this.$pendingOperation != "forceclose") {
            this.$pendingOperation = "open";
        } else if (op == "close" && this.$pendingOperation != "open") {
            this.$pendingOperation = op;
        } else if (op == "close" && force) {
            this.$pendingOperation = "forceclose";
        }
    }
    if (this.$pendingOperationHandlerWrapper == null) {
        this.$pendingOperationHandlerWrapper = Delegate.createWrapper(this, this.$pendingOperationHandler);
        window.setTimeout(this.$pendingOperationHandlerWrapper, this.get_pendingtimeout());
    }
};
VirtualDropDownKeyboardControl.prototype.get_selectedindex = function() {
	var items = this.get_items();
	var self = this;
	var key = this.get_keyproperty();
	if (BaseObject.is(items, "Array") && this.$value != null) {
		return items.FirstOrDefault(function(idx,itm) {
			if (itm[key] == self.$value) return idx;
			return null;
		});
	} else {
		return null;
	}
};
VirtualDropDownKeyboardControl.prototype.set_selectedindex = function(n) {
	var items = this.get_items();
	var key = this.get_keyproperty();
	if (BaseObject.is(items, "Array")) {
		if (items.length > n) {
			if (items[n] != null) {
				this.set_value(items[n][key]);
			}
		}
	}
};
VirtualDropDownKeyboardControl.prototype.get_selecteditem = function() {
	var items = this.get_items();
	var self = this;
	var key = this.get_keyproperty();
	if (BaseObject.is(items, "Array") && this.$value != null) {
		return items.FirstOrDefault(function(idx,itm) {
			if (itm[key] == self.$value) return itm;
			return null;
		});
	} else {
		return null;
	}
};
VirtualDropDownKeyboardControl.prototype.get_selectedinternalitem = function() {
	var item = this.get_selecteditem();
	if (item == null) return null;
	return {
				key: item[this.get_keyproperty()],
				display: item[this.get_descproperty()],
				title: item[this.get_titleproperty()]
			};
};
VirtualDropDownKeyboardControl.prototype.set_selecteditem = function ( v ) {
	this.set_value ( ( v == null ) ? null : ( v[this.get_keyproperty()] ) );
};
VirtualDropDownKeyboardControl.prototype.$value = null;
VirtualDropDownKeyboardControl.prototype.get_value = function() {
	return this.$value;
};
VirtualDropDownKeyboardControl.prototype.set_value = function(v) {
	if (this.$value != v) {
		this.$value = v;
		this.discardAsync("update_targets");
		this.asyncUpdateTargets();
		this.selchangedevent.invoke(this, this.get_selecteditem());
	}
};
VirtualDropDownKeyboardControl.prototype.onSelectionChanged = function(sender, dc) {
	this.Open();
	this.FocusHeader();
};
VirtualDropDownKeyboardControl.prototype.onItemActivated = function(sender, dc) {
	if (dc != null) {
		this.set_value(dc.key);
		this.FocusHeader();
		this.ForceClose();
		this.activatedevent.invoke(this, this.get_selecteditem());
	}
};
VirtualDropDownKeyboardControl.$ignoreKeys = [9,27];
VirtualDropDownKeyboardControl.prototype.$manageAccelDescriptor = function ( descriptor ) {
	if ( descriptor )
	{
		if ( descriptor.indexOf ( "+" ) > -1 )
		{
			// we have a Ctrl + #
			return descriptor;
		}
		else
		{
			return descriptor.charAt(0);
		}
	}
};
VirtualDropDownKeyboardControl.prototype.onSwallow = function (e) {
    jbTrace.log("onSwallow event: " + e.which);
    var count = VirtualDropDownKeyboardControl.$ignoreKeys.Aggregate(function (idx, item, result) {
        var rs = (result == null) ? 0 : result;
        if (item == e.which) return rs + 1;
        return rs;
    });
    if (count > 0) return;
    e.stopPropagation();
    e.preventDefault();
};
VirtualDropDownKeyboardControl.prototype.onKeyPress = function (evnt) {
    if (evnt.which == 27) {
        //this.escapeevent.invoke(this, null);
		this.ForceClose();
        evnt.stopPropagation();
    } else if ((evnt.which >= 37 && evnt.which <= 40) || evnt.which == 13 || evnt.which == 32) {
        if ($(this.$el_list).activeclass() != null) {
			if (!$(this.$el_list).activeclass().processKey(evnt)) {
				if ($(this.$el_scrollable).activeclass() != null) {
					if ($(this.$el_scrollable).activeclass().processKey(evnt)) {
						evnt.stopPropagation();
					}
				}
			}
		}
    } else {
		// execute the user defined accelerator method
		
		//var res = this.accelevent.invoke ( this );
		
		//evnt.stopPropagation();
	}
   // jbTrace.log("onKeyPress event: " + evnt.which);
};
// VirtualDropDownControl.prototype.onKeyPress.call(this, evnt);