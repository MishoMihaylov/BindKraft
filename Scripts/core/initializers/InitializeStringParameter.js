

/*CLASS*/
function InitializeStringParameter(desc, defval) {
    InitializeParameter.apply(this, arguments);
    this.type = "Parameter";
    this.paramType = "string";
};
InitializeStringParameter.Inherit(InitializeParameter, "InitializeStringParameter");