function SysShellQueryBack(shell, appClass) {
	this.$appClass = Class.getClassDef(appClass);
	this.$shell = shell;
	// Class name is in this.$appClass.classType
	// We keep ref to the shell in case it is not globally visible in future
}
SysShellQueryBack.Inherit(BaseObject,"SysShellQueryBack");
SysShellQueryBack.Implement(ILauncherQueryBack);

SysShellQueryBack.prototype.runningInstance = function() {
	return this.$shell.getAppByClassName(this.$appClass.classType);
}
SysShellQueryBack.prototype.runningInstances = function() {
	return this.$shell.getAppsByClassNames(this.$appClass.classType);
}
SysShellQueryBack.prototype.activateRunningInstance = function() {
	var oldinst = this.runningInstance();
	return this.$shell.activateApp(oldinst);
}.Description("Looks for existing instance and activates its windows");

SysShellQueryBack.prototype.subscribeClientFor = function(app, eventname, client) {
	this.$shell.$dispatcherLeasing.subscribe(app,eventname,client);
}
SysShellQueryBack.prototype.unsubscribeClientFor = function(app, eventname, client) {
	this.$shell.$dispatcherLeasing.unsubscribe(app,eventname,client);
}
SysShellQueryBack.prototype.unsubscribeAllClientsFor = function(app, eventname) {
	this.$shell.$dispatcherLeasing.clearInstDisp(app,eventname);
}
SysShellQueryBack.prototype.unsubscribeAllClients = function(app) {
	this.$shell.$dispatcherLeasing.clearInst(app);
}
SysShellQueryBack.prototype.leasedDispatch = function(app, eventname) {
	var disp = this.$shell.$dispatcherLeasing.getDisp(app, eventname);
	return {
		invoke: function() {
			if (disp != null) {
				disp.invoke.apply(disp, arguments);
			}
		}
	};
}.Description("Gives you a little wrapper through which to invoke a leased dispatcher.\
 		Use like this.$qb.leasedDispatch(this,'myevent').invoke(...); Assuming you saved the query back object in this.$qb in the app constructor.");


