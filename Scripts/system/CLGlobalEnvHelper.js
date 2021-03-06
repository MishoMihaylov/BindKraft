// Limited simple access to environment wrapper
function CLGlobalEnvHelper(env) {
	BaseObject.apply(this,arguments);
	this.env = env;
}
CLGlobalEnvHelper.Inherit(BaseObject,"CLGlobalEnvHelper");
CLGlobalEnvHelper.prototype.set = function(key, val) {
	this.env.setEnv(key, val);
}
CLGlobalEnvHelper.prototype.get = function(key) {
	return this.env.getEnv(key, null);
}
