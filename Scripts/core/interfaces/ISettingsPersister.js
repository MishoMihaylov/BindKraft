function ISettingsPersister() {}
ISettingsPersister.Interface("ISettingsPersister");

ISettingsPersister.prototype.disablePersistence = function(bDisable) { throw "not implemented"; }
ISettingsPersister.prototype.set_allowmap = function(v) { throw "not implemented"; }
ISettingsPersister.prototype.get_allowmap = function() { throw "not implemented"; }
ISettingsPersister.prototype.get_setting = function(key, defaultValue) {throw "not implemented";}
ISettingsPersister.prototype.set_setting = function(key, settingValue) {throw "not implemented";}
ISettingsPersister.prototype.hasSetting = function(key) {throw "not implemented";}
ISettingsPersister.prototype.get_key = function(key, settingValue) {throw "not implemented";}

ISettingsPersister.prototype.get_isdirty = function() {throw "not implemented";}
ISettingsPersister.prototype.save = function() {throw "not implemented";}
ISettingsPersister.prototype.load = function() {throw "not implemented";}

ISettingsPersister.prototype.get_persistenceprovider = function(p) {throw "not implemented";}
ISettingsPersister.prototype.set_persistenceprovider = function(p) {throw "not implemented";}