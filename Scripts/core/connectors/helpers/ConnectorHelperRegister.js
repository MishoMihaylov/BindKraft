


/*CLASS*/
function ConnectorHelperRegister() {
    BaseObject.apply(this, arguments);
}
ConnectorHelperRegister.Inherit(BaseObject,"ConnectorHelperRegister");
ConnectorHelperRegister.$helperProtocols = ["IConnectorPagingHelper","IConnectorSingleFilteringHelper","IConnectorPrimaryKeyHelper"];
ConnectorHelperRegister.AddHelperProtocol = function(prot) {
    this.$helperProtocols.addElement(prot);
}
ConnectorHelperRegister.RemoveHelperProtocol = function(prot) {
    this.$helperProtocols.removeElement(prot);
}
ConnectorHelperRegister.prototype.$register = new InitializeObject("Dictionary by connector type");
                                                        // connector    helper         helper conf    address regexp ...
ConnectorHelperRegister.prototype.registerHelper = function(className, helperClassIn, configuration, addressConstraint, bindHostConstraint, priority) {
    if (typeof this.$register[className] == null) {
        this.$register[className] = {};
    }
    var p = this.$register[className];
    var helperClass = (typeof helperClassIn == "function")?helperClassIn:Function.classes[helperClassIn];
    for (var i = 0; i < ConnectorHelperRegister.$helperProtocols.length; i++) {
        var prot = ConnectorHelperRegister.$helperProtocols[i];
        if (Class.is(helperClass, prot)) {
            if (p[prot] == null) {
                p[prot] == [];
            }
            if (priority) {
                p[prot].insertElement(new ConnectorHelperRegistration(helperClass,configuration,addressConstraint,bindHostConstraint),0);
            } else {
                p[prot].addElement(new ConnectorHelperRegistration(helperClass,configuration,addressConstraint,bindHostConstraint));
            }
        }
    }
    return this;
}
ConnectorHelperRegister.prototype.GetHelper = function(connector,protocolName) {
    var k,i, connectorClass = null;
    for (var k in this.$register) {
        if (connector.classType() == k) {
            connectorClass = k;
        }
    }
    if (connectorClass == null) return null;
    if (typeof protocolName == "string") {
        var p = this.$register[connectorClass];
        if (BaseObject.is(p[protocolName],"Array")) {
            for (i = 0; i < p[protocolName].length;i++) {
                if (p[protocolName][i].checkConstraints(connector,protocolName)) {
                    return new p[protocolName][i].classDef(connector,p[protocolName][i].configuration);
                }
            }
        }
        
    }
    return null;
}

ConnectorHelperRegister.$default = null;
ConnectorHelperRegister.Default = function() {
    if (this.$default == null) {
        this.$default = new ConnectorHelperRegister();
    }
}