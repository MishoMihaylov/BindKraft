function ContentWindow() {
    BaseWindow.apply(this, arguments);
}
ContentWindow.Inherit(PanelWindow, "ContentWindow");
ContentWindow.Defaults({
	templateName: "<div class=\"f_windowframe\" data-key=\"_window\" style=\"position: relative;overflow: auto;background-color:#FFFFFF;\"></div>"
});
// ContentWindow.prototype.$get_windowHtmlTemplate = function () {
    // if (this.$customSystemTemplate != null) {
        // return this.$customSystemTemplate;
    // } else {
        // return "<div class=\"f_windowframe\" data-key=\"_window\" style=\"position: relative;overflow: auto;background-color:#FFFFFF;\"></div>";
    // }
// };
ContentWindow.prototype.get_clientcontainer = function (param) {
    return this.root;
};

