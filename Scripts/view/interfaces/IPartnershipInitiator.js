


/*INTERFACE*/
function IPartnershipInitiator() {}
IPartnershipInitiator.Interface("IPartnershipInitiator");
IPartnershipInitiator.prototype.initiatePartnerships = function() {
	throw "initiatePartnerships is not implemented in " + this.fullClassType();
}