

// It is probably not needed, but it seems that including it into the base window definition may be benefical 


/* INTERFACE */
function IWindowTemplate() { }
IWindowTemplate.Interface("IWindowTemplate");
IWindowTemplate.prototype.$get_windowHtmlTemplate = function () {
    if (this.$customSystemTemplate != null) {
        return this.$customSystemTemplate;
    } else {
        return "<div class=\"f_windowframe\" data-key=\"_window\" style=\"position: absolute;width:200px;height:200px;\"><div data-key=\"_windowcaption\" class=\"f_windowcaption\" style=\"height:20px;\" data-bind-text=\"{read source=_window path=$caption}\"></div><div data-key=\"_client\"></div></div>";
    }
};