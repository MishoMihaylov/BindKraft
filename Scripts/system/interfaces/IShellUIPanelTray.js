function IShellUIPanelTray() {}
IShellUIPanelTray.Interface("IShellUIPanelTray","IShellUIPanel");
IShellUIPanelTray.prototype.ShRemoveAt = function(index) { throw "not implemented"; }
IShellUIPanelTray.prototype.ShGetEntries = function () { throw "not implemented"; }
IShellUIPanelTray.prototype.ShAddEntry = function(type, entrydata) { throw "not implemented"; }