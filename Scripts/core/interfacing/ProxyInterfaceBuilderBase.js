function ProxyInterfaceBuilderBase(transport) {
	BaseObject.apply(this,arguments);
	this.$transport = transport;
}
ProxyInterfaceBuilderBase.Inherit(BaseObject,"ProxyInterfaceBuilderBase");
ProxyInterfaceBuilderBase.Implement(IProxyInterfaceBuilder);
ProxyInterfaceBuilderBase.prototype.$transport = null;
ProxyInterfaceBuilderBase.prototype.buildProxy = function(instance, interfaceDef) {
	throw "Not implemented (base class)";
}