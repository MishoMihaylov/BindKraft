


function InitialParameterQuery(param) {
    BaseObject.apply(this, arguments);
    this.result = null;
    this.requestedParameter = param;
}
InitialParameterQuery.Inherit(BaseObject, "InitialParameterQuery");