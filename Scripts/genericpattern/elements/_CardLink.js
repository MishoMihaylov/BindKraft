

/*-----CLASS-----*/
function CardLink() {
    Base.apply(this, arguments);
    this.on("click", this.onClick);
    this.on("keypress", this.onKeypress);
    this.openedevent = new EventDispatcher(this);
}
CardLink.Inherit(Base, "CardLink");

CardLink.prototype.set_baseurl = function (url) {
    this.$baseurl = url;
};
CardLink.prototype.get_baseurl = function () {
    return this.$baseurl;
};
CardLink.prototype.set_paramname = function (n) {
    this.$paramname = n;
};
CardLink.prototype.get_paramname = function () {
    return this.$paramname;
};
CardLink.prototype.set_paramvalue =  function (v) {
    this.$paramvalue = v;
};
CardLink.prototype.get_paramvalue = function () {
    return this.$paramvalue;
};
CardLink.prototype.openedevent = null; /// = new InitializeEvent("Informs handlers that the link was successfully opened");

CardLink.prototype.get_url = function () {
    var url = this.get_baseurl();
    var nam = this.get_paramname();
    var val = this.get_paramvalue();
	var delim = "?";
    if (url != null) {
		if (url.indexOf("?") >= 0) delim = "&";
        if (nam != null && nam.lenght != 0) {
            if (val != null && val.lenght != 0) {
                return url + delim + nam + '=' + val;
            } else {
                return url + delim + nam + '=';
            }
        } else if (val != null && val.lenght != 0) {
            return url + '/' + val;
        } else {
            return url;
        }
    } return null;
};
CardLink.prototype.openView = function (url) {
    var p = new HostCallQuery(HostCallCommandEnum.getshell);
    this.throwStructuralQuery(p);
    if (p.shell != null) {
        p.shell.openWindowedView({ url: url });
    } else {
        CCardContainer.create(workspace, url);
    }
};
CardLink.prototype.onClick = function () {
    var url = this.get_url();
    if (url != null) {
        this.openView(url);
        // CCardContainer.create(workspace, url);
        // CCardContainer.create(workspace, url);
        this.openedevent.invoke(this, url);
    }
};

CardLink.prototype.onKeypress = function (e) {
    if (e.which == 13 || e.which == 32) {
        var url = this.get_url();
        if (url != null) {
            this.openView(url);
            // CCardContainer.create(workspace, url);
            //CCardContainer.create(workspace, url);
            this.openedevent.invoke(this, url);
        }
    }
};