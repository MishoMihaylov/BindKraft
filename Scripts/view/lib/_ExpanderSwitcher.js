


function ExpanderSwitcher() {
    ViewBase.apply(this, arguments);
}

ExpanderSwitcher.Inherit(ViewBase, "ExpanderSwitcher");
ExpanderSwitcher.Implement(ITemplateSourceImpl);
ExpanderSwitcher.prototype.obliterate = function() {
    delete this.$template;
    ViewBase.prototype.obliterate.call(this);
};