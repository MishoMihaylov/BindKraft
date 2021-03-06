


// Toggler
/*CLASS*/

function Toggler(el) {
    Base.apply(this, arguments);
    this.on("click", this.onClick);
    // this.isVisible = true;
}

Toggler.Inherit(Base, "Toggler");
Toggler.prototype.toggleElements = new InitializeStringParameter("parent[/child] key selectors of the elements to toggle", null);
Toggler.prototype.accordionTogglers = new InitializeStringParameter("parent[/child] key selectors of other Toggler elements to control in accordion-like manner.", null);
Toggler.prototype.dependentTogglers = null;
Toggler.prototype.cssActiveHeader = null;
Toggler.prototype.cssNormalHeader = null;
Toggler.prototype.isVisible = new InitializeBooleanParameter("Can be used as parameter to set the initial state: #isVisible='0'", true);
Toggler.prototype.slide = false;
Toggler.prototype.duration = 'slow';
Toggler.prototype.toggledevent = new InitializeEvent("Fires when the state is toggled.");
// new EventDispatcher(this);
Toggler.prototype.init = function() {
    if (this.duration != null && this.duration.trim().length == 0) this.duration = null;
    this.setState(null, true);
};
Toggler.prototype.onClick = function(evnt, dc) {
    this.toggleState();
};
Toggler.prototype.toggleState = function() {
    var els = this.getRelatedElements(this.toggleElements);
    var deps = this.getRelatedElements(this.dependentTogglers);
    if (this.isVisible) {
        if (this.slide) {
            els.slideUp(this.duration);
        } else {
            els.hide(this.duration);
        }
        this.isVisible = false;
    } else {
        if (this.slide) {
            els.slideDown(this.duration);
        } else {
            els.show(this.duration);
        }
        this.isVisible = true;
    }
    deps.callActiveObjects("Toggler", this.setState, this.duration, true, this.isVisible);
    this.setState(this.duration, false);
    this.toggledevent.invoke(this, this.isVisible);
};
Toggler.prototype.setState = function(speed, onlySelf, newState) {
    var els = this.getRelatedElements(this.toggleElements);
    if (newState != null) this.isVisible = newState;
    if (this.isVisible) {
        els.show(speed);
    } else {
        els.hide(speed);
    }
    var arrAh, arrNh, i;
    if (this.cssActiveHeader != null && this.cssNormalHeader != null) {
        arrAh = this.cssActiveHeader.split(" ");
        arrNh = this.cssNormalHeader.split(" ");
        for (i = 0; i < arrAh.length; i++) {
            $(this.root).removeClass(arrAh[i]);
        }
        for (i = 0; i < arrNh.length; i++) {
            $(this.root).removeClass(arrNh[i]);
        }
        if (this.isVisible) {
            for (i = 0; i < arrAh.length; i++) {
                $(this.root).addClass(arrAh[i]);
            }
        } else {
            for (i = 0; i < arrNh.length; i++) {
                $(this.root).addClass(arrNh[i]);
            }
        }
    }

    if (!onlySelf) {
        els = this.getRelatedElements(this.accordionTogglers);
        var o;
        if (this.isVisible) {
            for (i = 0; i < els.length; i++) {
                o = els.get(i);
                if (o != null && o.activeClass && o.activeClass != this) {
                    o.activeClass.isVisible = false;
                    o.activeClass.setState('slow', true);
                }
            }
        }
    }
};
