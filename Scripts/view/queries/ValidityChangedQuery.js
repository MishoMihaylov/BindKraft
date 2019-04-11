function ValidityChangedQuery(vld) {
	BaseObject.apply(this, arguments);
	this.$validator = vld;
}
ValidityChangedQuery.Inherit(BaseObject,"ValidityChangedQuery");
ValidityChangedQuery.prototype.get_validator = function() {return this.$validator;}
ValidityChangedQuery.prototype.get_validity = function() { return this.get_validator().result; }
ValidityChangedQuery.prototype.get_message = function() { return this.get_validator().get_message(); }
ValidityChangedQuery.prototype.get_messages = function() { return this.get_validator().get_messages(); }
