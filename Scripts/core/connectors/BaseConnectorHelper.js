

/*CLASS*/
function ConnectorHelperBase(connector) {
    BaseObject.apply(this,arguments);
    this.$connector = connector;
}

ConnectorHelperBase.Inherit(BaseObject,"ConnectorHelperBase");
ConnectorHelperBase.prototype.get_connector = function() {return this.$connector;}
