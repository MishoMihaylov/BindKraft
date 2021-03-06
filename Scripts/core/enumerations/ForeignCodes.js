/*
This one contains flags used in the error information object
The flags are combined together by groups
*/

var ForeignCodesFlags = {
// General 1-bit (0)
	Ok: 			0x000000,
	Success:		0x000000,
	Failure: 		0x000001,
	
// Where 2-bits (1,2)
	Cancel:			0x000002, // Operation was forcibly cancelled - ignore results and continue if and as possible
	RemoteParty:	0x000000, // Remote party (callee) failed while performing the task
	Transport:		0x000004, // Transport level problem occured
	ProxyStub:		0x000006, // Failure occured at proxy or stub level (usually generally unacceptable argument or something like this)
	
// Reserved 1-bit (3)

// General kind 4-bits (4-7) - general character of the error
	General:  		0x000000, // General error (no specific kind can be specified)
	NotFound:  		0x000010, // Something assumed/addressed/searched is not found.
	NotAllowed: 	0x000020, // Operation/task/execution (but NOT argument(s) type/content) is not allowed because of the state of the "where" part.
	Argument:		0x000030, // Argument(s) cause problems are not acceptable/serializable etc.
	NotAvailable:	0x000040, // A required service/component/protocol is not available at this time or permanently. Only active components, resources are NotFound
	Pending:		0x000060, // This is reported as an error to make sure that callers not capable of waiting will treat it as an error, but others will know
									// to wait (currently not used)
	AccessDenied:	0x000050, // Access was denied to a resource/service/component at the specified layer.
	Format:			0x000070, // Format of a structure is incorrect.
	
	
// Specific 16-bits (8,23), meaning may be different depending on Where this happens errors 0001-00FF are reserced define your codes outside this range.
// 	The reservation is an attempt to define some set of well-known and frequently needed values.
//	Can be left 0 if unsure what to report.

	NoCode: 		0x000000,
	
	KraftError: function(_success, _layer, _kind, _code) {
		var success = (_success == true);
		var layer = ((typeof _layer == "number")?_layer: ((typeof this[_layer] == "number")?this[_layer]:0));
		var kind = ((typeof _kind == "number")?_kind: ((typeof this[_kind] == "number")?this[_kind]:0));
		var code = ((typeof _code == "number")?_code: ((typeof this[_code] == "number")?this[_code]:0));
		var err = 0x000000 | ((success)?this.Ok:this.Failure);
		
		err |= ((typeof layer == "number" && layer >= 2 && layer <= 6)?layer:0);
		err |= ((typeof kind == "number" && kind >= 0x10 && kind <= 0xF0)?kind:0);
		err |= ((typeof code == "number" && code >= 0x000100 && code <= 0xFFFF00)?code:0);
		return err;
	},
	IsSuccess: function (_err) {
		var err = ((typeof _err == "number")?_err:parseInt(err,10));
		if (typeof err == number) {
			if (err & this.Failure) return false;
			return true;
		} else {
			return false;
		}
	},
	IsFailure: function (err) {
		var err = ((typeof _err == "number")?_err:parseInt(err,10));
		if (typeof err == number) {
			if (err & this.Failure) return true;
			return false;
		} else {
			return true;
		}
	},
	Origin: function (err) {
		return (err & 0x000006);
	},
	OriginName: function(err) {
		var o = Origin(err);
		for (k in this) {
			if (this[k] == o) return k;
		}
		return "unknown";
	},
	Kind: function (err) {
		return (err & 0x0000F0);
	},
	KindName: function(err) {
		var o = Kind(err);
		for (k in this) {
			if (this[k] == o) return k;
		}
		return "unknown";
	},
	Success: function() { return 0x000000;}
	
};