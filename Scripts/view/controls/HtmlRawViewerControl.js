


function HtmlRawViewerControl() {
    Base.apply(this, arguments);
}
HtmlRawViewerControl.Inherit(Base,"HtmlRawViewerControl");
HtmlRawViewerControl.prototype.init = function() {
    $(this.root).append('<iframe data-key="iframe" src="about:blank" style="width:100%;height:100%;"></iframe>').get(0);
    this.$iframe = this.child("iframe").get(0);
}
HtmlRawViewerControl.prototype.get_document = function() {
    return this.$iframe.contentWindow.document;
}
HtmlRawViewerControl.prototype.get_html = function() {
    return null;
}
HtmlRawViewerControl.prototype.set_html = function(v) {
    this.get_document().open();
    this.get_document().write(v);
    this.get_document().close();
}
HtmlRawViewerControl.prototype.get_styles = function() {
    return null;
}
HtmlRawViewerControl.prototype.set_styles = function(v) {
    var head = this.get_document().head;
    var stylesheets = head.querySelectorAll("style");
    if (stylesheets != null && stylesheets.length > 0) {
        for (var i = stylesheets.length - 1; i >= 0;i--) {
            head.removeChild(stylesheets[i]);
        }
    }
    var stylesheet = this.get_document().createElement("style");
    stylesheet.type = 'text/css';
    if (stylesheet.styleSheet){
        stylesheet.styleSheet.cssText = v;
    } else {
        stylesheet.appendChild(document.createTextNode(v));
    }
    head.appendChild(stylesheet);
}
