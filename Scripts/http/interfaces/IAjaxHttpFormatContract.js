/**
	Immutable during normal usage
*/
function IAjaxHttpFormatContract() {}
IAjaxHttpFormatContract.Interface("IAjaxHttpFormatContract");
IAjaxHttpFormatContract.prototype.get_requestcomposer = function(ajaxhttprequest) { throw "not impl"; }
IAjaxHttpFormatContract.prototype.get_responseextractor = function(ajaxhttpresponse) { throw "not impl"; }