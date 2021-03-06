function BkInit_FSBase(_fs, sdir) {
	BaseObject.apply(this,arguments);
	var memfs = Registers.Default().getRegister(_fs);
	if (!BaseObject.is(memfs, "MemoryFSDirectory")) throw "BkInit cannot find the memory file system specified (" + _fs + ")";
	this.$fs = memfs;
	// Initial cd/mkdir
	var dir = this.$fs.mkdir(sdir); // Make sure the dir exists and changes to it.
	if (dir != null) {
		this.$dir = dir;
	} else {
		throw "Cannot create/change to the directory " + sdir;
	}
}
BkInit_FSBase.Inherit(BaseObject, "BkInit_FSBase");
BkInit_FSBase.prototype.$fs = null;
BkInit_FSBase.prototype.$dir = null;
