// We better replace this with internal functionality


// Tooltips to elements
function QTipBehavior(node, phase) {
    ElementBehaviorBase.apply(this, arguments);
}
QTipBehavior.Inherit(ElementBehaviorBase, "QTipBehavior");
QTipBehavior.bindBehavior = function (node, behParams, phase) {
    if (phase == BehaviorPhaseEnum.bind) {
        var beh = new QTipBehavior(node, phase);
        JBUtil.parametrize.call(beh, node, null, behParams); // JBUtil.parametrize.call(beh, behParams);
        beh.init();
		return beh;
    }
	return null;
};
QTipBehavior.prototype.hinttext = "hinttext";
QTipBehavior.prototype.title = true; // if true (default) texts like <title>:<hint text> will display titled
QTipBehavior.prototype.pos = "top";
QTipBehavior.prototype.theme = "cream";
QTipBehavior.prototype.radius = 3;
QTipBehavior.prototype.width = 200;
QTipBehavior.allowedThemes = ["blue", "light", "dark", "green", "red", "cream"];
QTipBehavior.prototype.init = function () {
    var el = $(this.$target);
    var t = this;
    if (this.hover) {
        el.mouseenter(function (e) {
            t.onCreate(this, e);
        });
        el.mouseleave(function (e) {
            t.onDestroy(this, e);
        });
    } else {
        el.focus(function (e) {
            t.onCreate(this, e);
        });
        el.focusout(function (e) {
            t.onDestroy(this, e);
        });
        el.blur(function (e) {
            t.onDestroy(this, e);
        });
    }
};
QTipBehavior.prototype.$genPos = function () {
    switch (this.pos) {
        case "right":
            return { corner: { target: "rightMiddle", tooltip: "leftMiddle"} };
        case "under":
            return { corner: { target: "bottomMiddle", tooltip: "topMiddle"} };
        default: // top
            return { corner: { target: "topMiddle", tooltip: "bottomMiddle"} };
    }
};
QTipBehavior.prototype.$genStyle = function () {
    if (QTipBehavior.allowedThemes.findElement(this.theme) >= 0) {
        return { name: this.theme, tip: true, border: { radius: this.radius }, width: this.width };
        // , border: { radius: this.radius }
    } else {
        return { name: "light" };
    }
};
QTipBehavior.prototype.onCreate = function (element, ev) {
    var el = $(this.$target);
    var t = el[this.hinttext]();
    if ((t == null || t.length <= 0) && this.get_text != null) t = this.get_text();
    if (t == null || t.length <= 0) t = this.text;
    if (t == null) t = el.elementtitle();
    if (el.data("qtip") != null) el.qtip("destroy");
    if (t != null && t.length > 0) {
        var i = t.indexOf(":");
        var tText, tTitle = false;
        if (i > 0) {
            tText = t.slice(i + 1);
            tTitle = t.slice(0, i);
        } else {
            tText = t;
            tTitle = false;
        }
        if (this.hover) {
            el.qtip({ content: { text: tText, prerender: true, title: { text: tTitle, button: false} }, show: "mouseover", hide: "mouseout", position: this.$genPos(), style: this.$genStyle() });
        } else {
            el.qtip({ content: { text: tText, prerender: true, title: { text: tTitle, button: false} }, show: "focus", hide: "blur", position: this.$genPos(), style: this.$genStyle() });
        }
        el.qtip("show");
    }
};
QTipBehavior.prototype.onDestroy = function (element, ev) {
    var el = $(this.$target);
    if (el.data("qtip") != null) {
        el.qtip("hide");
        el.qtip("destroy");
    }
};