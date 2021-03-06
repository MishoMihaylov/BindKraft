// +VERSION 2.11.4
// Obliteration bridge (should be attached to the correct API Jquery or DOMM)
JBUtil.Empty = function(rawelement) {
	$(rawelement).Empty();
}
JBUtil.Clean = function(rawelement) {
	$(rawelement).Clean();
}
JBUtil.Remove = function(rawelement) {
	$(rawelement).Remove();
}
// End Obliteration bridge
// -VERSION 2.11.4


JBUtil.Inherit(BaseObject, "JBUtil");
JBUtil.stripElementSet = function (els) { // Strips DOM element set from whatever - jquery object
    if (els == null) return false;

};
JBUtil.reFindParams = /[a-zA-Z0-9\#]+\=\'(.|\'\')*?\'/gi;
// JBUtil.reParseParam = /^([a-zA-Z0-9\#]+)\=\'(.*)\'$/i;

// This is set of parameters in an object. Each field is a separate parameter, but it can be given in two forms:
//  simple - just a value , the name is obtained from the field's name, the type is determined from the value (can be risky in some cases - choose wisely)
//  described - an object with fields:
//				type - type of the parameter (see ParameterTypeEnum enum)
//				value - value of the parameter. (no conversion is performed in current version)
// 		The described approach lays a base for future enhancements.
JBUtil.$parseParametersObject = function(paramObject) {
	var r = [];
	if (typeof paramObject == "object") {
		for (var k in paramObject) {
			var param = paramObject[k];
			if (param == null) {
				r.push({ name: k, type: ParameterTypeEnum.string, value: null}); // For compatibility reasons we declare the null as string. This is not seen by the parametrized object.
			} else if (typeof param == "string") {
				r.push({ name: k, type: ParameterTypeEnum.string, value: param});
			} else if (typeof param == "number") {
				r.push({ name: k, type: ParameterTypeEnum.number, value: param});
			} else if (typeof param == "boolean") {
				r.push({ name: k, type: ParameterTypeEnum["boolean"], value: param});
			} else if (BaseObject.is(param, "Date")) {
				r.push({ name: k, type: ParameterTypeEnum["date"], value: param});
			} else if (typeof param == "object") {
				var o = { name: k };
				if (typeof param.type == "string") {
					switch (param.type) { // To make sure we can add aliases we transfer these step by step (this is not stupidity!)
						case "string":
							o.type = ParameterTypeEnum.string;
							o.value = param.value;
						break;
						case "number":
							o.type = ParameterTypeEnum.number;
							o.value = param.value;
						break;
						case "boolean":
							o.type = ParameterTypeEnum["boolean"];
							o.value = param.value;
						break;
						case "date":
							o.type = ParameterTypeEnum["date"];
							o.value = param.value;
						break;
						case "binding":
							o.type = ParameterTypeEnum.boundproperty;
							o.value = param.value; // In future we may decide to enable object description of the binding here.
						break;
					}
				}
			}
		}
	}
	return r;
};
// TODO: Remove after final check for usage
// JBUtil.reFinfParamsWithoutBinding = /(^|\s)\#?[a-zA-Z0-9_]+\=((\'([^'\\]|(\\')|\\(?!'))*\')|(\S*?(?=\s|$)))/gi;

/*
	Reserved type prefixes and suggestions open for voting
	$ - string with replacements "abc $otherparamname defgh"
	
	Reserved value syntax
	=[ ... ] - array parameters
	=( ... ) - no specific suggestions - ideas are welcome

*/

//=VERSION: 2.7.2 - Added multiline processing, this is always used with prefetched attribute values, there is no danger to assume multiline.
// JBUtil.reFindParamsWithBinding = /(^|\s)(\#|\@|\!)?[a-zA-Z0-9_]+\=((\{([^\}\\]|(\\\})|\\(?!\}))*\})|(\'([^'\\]|(\\')|\\(?!'))*\')|(\S*?(?=\s|$)))/gim;
//?VERSION: 2.72 - Suggested change
JBUtil.reFindParamsWithBinding = /(^|\s)(\#|\@|\!)?[a-zA-Z0-9_]+\=((\{([^\}\\]|(\\\})|\\(?!\}))*\})|(\'([^'\\]|\\\\|\\'|(?:\\[a-zA-Z])|(?:\\#[0-9]{1,5})|(?:\\#x[0-9ABCDRFabcdef]{1,4}))*\')|(\S*?(?=\s|$)))/gim;
//?VERSION: 2.72 - Suggested unescapes in value enclosed in ' ' (no escape without '')
//	\\ -> \
// 	\A -> Specials: A:=t -> tab, A:=n -> LF, A:=r -> CR A:=(not currently supported) -> remove
//  \' -> '
//	\1234 -> caracter from unicode code point
//  \x123 -> Like above but hexdecimal



JBUtil.reParseParameter = /^(\#|\@|\!?)([a-zA-Z0-9_]+)\=(.*)$/i;
JBUtil.parseParameters = function (paramStr) {
    var r = [],
		booleanMap = {};
	if (typeof paramStr == "object") {
		return JBUtil.$parseParametersObject(paramStr);
    } else if (BaseObject.is(paramStr, "string")) {
        var arr = paramStr.match(JBUtil.reFindParamsWithBinding);
        if (arr != null) {
            var parr, o, v, t;
            for (var i = 0; i < arr.length; i++) {
                parr = arr[i].trim().match(JBUtil.reParseParameter);
                if (parr != null && parr.length > 0) {
                    o = { name: parr[2], "type": ParameterTypeEnum.string, value: null };
                    v = parr[3];
                    if (v.length > 0) {
                        if (v.charAt(0) == "'") {
                            v = v.slice(1, -1);
                            o.value = v;
                        } else if (v.charAt(0) == "{") {
                            o.type = ParameterTypeEnum.binding;
                            o.value = v;
                        } else if (v.charAt(0) != "[" && v.charAt(0) != "(") { // Reserved symbols for future extensions [ and (
                            o.value = v;
						}
                    }
                    if (o.type != ParameterTypeEnum.binding && (parr[1] == "#" || parr[1] == "!")) {
                        if (v != null && v.length == 0) {
                            v = null;
                        } else {
							switch (parr[1]) {
								case "#":
									if (v.indexOf(".") >= 0) {
										v = parseFloat(v);
									} else {
										v = parseInt(v, 10);
									}

									o.type = ParameterTypeEnum.number;
									break;
								case "!":
									v = v.toLowerCase();
									booleanMap = {
										"true": true,
										"1": true,
										"yes": true,
										"on": true,

										"false": false,
										"0": false,
										"no": false,
										"off": false
									};

									v = booleanMap[v] != undefined ? booleanMap[v] : Boolean(v);
									break;
								default:
									break;
							}
                        }
                        o.value = v;
                    } else if (o.type == ParameterTypeEnum.binding && parr[1] == "@") {
                        o.type = ParameterTypeEnum.boundproperty; // creates get_paramname to use the binding's get_sourceValue method. The binding is not registered or used in any way in the normal binding mechanisms
                    }
                    r.push(o);
                }
            }
        }
    }
    return r;
};
// TODO: Implement support for escape characters.
JBUtil.getEnclosedTokens = function (openbrackets, closebrackets, escapes, str) {
    if (str == null || str.length == 0) return [];
    var r = [];
    var n = 0, lngth = str.length;
    var bs = [];
    var ch, oidx, cidx, stp;
    for (n = 0; n < lngth; n++) {
        ch = str.charAt(n);
        stp = bs.lastElement();
        oidx = openbrackets.indexOf(ch);
        cidx = closebrackets.indexOf(ch);
        if (oidx >= 0) {
            if (oidx == cidx) {
                if (stp != null && stp.s && stp.i == oidx) {
                    // closing
                    if (bs.length == 1) {
                        r.push(str.slice(stp.p, n + 1));
                    }
                    bs.pop();
                } else {
                    bs.push({ i: oidx, c: ch, p: n, s: true });
                }
            } else {
                bs.push({ i: oidx, c: ch, p: n, s: false });
            }
        } else if (cidx >= 0) {
            if (stp != null && !stp.s && stp.i == cidx) {
                // closing
                if (bs.length == 1) {
                    r.push(str.slice(stp.p, n + 1));
                }
                bs.pop();
            }
        }
    }
    return r;
};
JBUtil.parametrize_old = function (sParams) { // _thiscall
    if (BaseObject.is(sParams, "string")) {
        var arr = sParams.match(JBUtil.reFindParams);
        if (arr != null && arr.length > 0) {
            var parr, memberName;
            for (var i = 0; i < arr.length; i++) {
                parr = arr[i].match(JBUtil.reParseParam);
                if (parr != null) {
                    if (parr[1].charAt(0) == "#") {
                        memberName = parr[1].slice(1);
                        if (BaseObject.is(this["set_" + memberName], "function")) {
                            this["set_" + memberName](parseInt(parr[2], 10));
                        } else {
                            this[memberName] = parseInt(parr[2], 10);
                        }
                    } else {
                        memberName = parr[1];
                        if (BaseObject.is(this["set_" + memberName], "function")) {
                            this["set_" + memberName](parr[2]);
                        } else {
                            this[memberName] = parr[2];
                        }

                    }
                }
            }
        }
    }
};
//+VERSION: 2.7.2 - Supported unescapes in value enclosed in ' ' (no escape without '')
//	\\ -> \
// 	\A -> Specials: A:=t -> tab, A:=n -> LF, A:=r -> CR A:=(not currently supported) -> remove
//  \' -> '
//	\#1234 -> caracter from unicode code point
//  \#x123 -> Like above but hexdecimal
JBUtil.$reParamEscapes = /([^'\\]|(\\\\)|(\\')|(?:\\([a-zA-Z]))|(?:\\#([0-9]{1,5}))|(?:\\#x[0-9ABCDRFabcdef]{1,4}))*/gi;
JBUtil.unescapeParameterString = function(v) {
	if (typeof v == "string") {
		return v.replace(JBUtil.$reParamEscapes, function (matchstr, gslash, gquote, gspecial, gchardec, gcharhex, pos, whole) {
			var n;
			if (gslash != null) {
				return "\"";
			} else if (gquote != null) {
				return "\'";
			} else if (gspecial != null) {
				switch (gspecial) {
					case "r":
						return "\r";
					case "n":
						return "\n";
					case "t":
						return "\t";
					case "Q":
						return "\"";
					default:
						return "";
				}
			} else if (gchardec != null || gchardec != null) {
				n = parseInt(gchardec, 10);
				if (!isNaN(n)) {
					//return String.fromCharCode
					throw "\\#... escapes are not yet implemented";
				}
			}
		});
	} else {
		return v;
	}	
}
//-VERSION: 2.7.2
/* JBUtil.parametrize(
domEl - the dom Element over which the parameters were found (usually as attribute value or as part of an attribute value)
sParams - unparsed string containing the parameters
)
returns: nothing.
*/
JBUtil.parametrize_genBoundProperty = function (paramName) {
    return function () {
        if (BaseObject.is(this["binding_" + paramName], "Binding")) return this["binding_" + paramName].get_sourceValue(true);
        return null;
    };
};
JBUtil.$getPropPrototype = function(obj, prop) {
	if (obj != null && obj.constructor != null && obj.constructor.prototype != null) {
		return obj.constructor.prototype[prop];
	}
	return null;
}
// _thiscall
JBUtil.parametrize = function (domEl, bindingRegistrator, sParams) {
    var params = JBUtil.parseParameters(sParams);
    var param, binding;
    var isCustom = this.is("ICustomParameterization");
    for (var i = 0; i < params.length; i++) {
        param = params[i];
        if (param.type == ParameterTypeEnum.binding || param.type == ParameterTypeEnum.boundproperty) {
			if (domEl == null) {
				jbTrace.log("binding parameter without dom element.");
				continue;
			}
            if (param.type != ParameterTypeEnum.boundproperty && bindingRegistrator != null) {
				// TODO: This branch is probably not needed
                if (BaseObject.is(this["set_" + param.name], "function")) {
                    binding = new Binding(domEl, this, "$" + param.name, param.value); // use pseudo property
                } else {
					//if (this[param.name]
                    binding = new Binding(domEl, this, param.name, param.value); // use normal property
                }
                bindingRegistrator.$registerBinding(binding);
            } else {
				// TODO: What to do with custom parameterization.
				if (JBCoreConstants.StrictParameters || this.is("IStrictParameterization")) {
					if (typeof this["get_" + param.name] != "function") throw "Attempt to set up binding as an undeclared parameter " + param.name + " while parametrizing an instance of class " + this.fullClassType();
				}
				if (!isCustom || (isCustom && this.setObjectParameter(param.name, param.value,param.type))) {
					binding = new Binding(domEl, this, null, param.value);
					if (this["binding_" + param.name] == null || BaseObject.is(this["binding_" + param.name], "Binding")) {
						this["binding_" + param.name] = binding;
						this["get_" + param.name] = JBUtil.parametrize_genBoundProperty(param.name);
					}
				}
            }
        } else {
			if (isCustom && this.setObjectParameter(param.name, param.value, param.type)) {
				if (BaseObject.is(this["set_" + param.name], "function")) {
					this["set_" + param.name](param.value);
				} else {
					if ((JBCoreConstants.StrictParameters || this.is("IStrictParameterization")) && this.constructor != null && this.constructor.prototype != null) {
						var orig = this.constructor.prototype[param.name];
						// TODO: Should we check for Initialize only?
						if (!BaseObject.is(orig,"InitializeParameter")) throw "Attempt to set a parameter to a field as InitializeParameter. Field: " + param.name + " in class " + this.fullClassType() + ". Implement a property (with get_/set_ methods) or declare your field in the prototype with appropriate InitializeParameter";
					}
					this[param.name] = param.value;
				}
			} else if (!isCustom) {
				if (BaseObject.is(this["set_" + param.name], "function")) {
					this["set_" + param.name](param.value);
				} else {
					if ((JBCoreConstants.StrictParameters || this.is("IStrictParameterization")) && this.constructor != null && this.constructor.prototype != null) {
						var orig = this.constructor.prototype[param.name];
						// TODO: Should we check for Initialize only?
						if (!BaseObject.is(orig,"InitializeParameter")) throw "Attempt to set a parameter to a field as InitializeParameter. Field: " + param.name + " in class " + this.fullClassType() + ". Implement a property (with get_/set_ methods) or declare your field in the prototype with appropriate InitializeParameter";
					}
					this[param.name] = param.value;
				}
			}
        }
    }
}.Description("Parses and/or constructs the parameters for an instance of a class and applies them over the specified instance.")
	.Param("domEl", "The reference DOM element. For Base classes this is the element on which they are declared with data-class, for others this is the DOM element to which they belong in some sense - i.e. this is the element from which references and paths will be calculated when the parameters are resolved.")
	.Param("bindingRegistrator","A Base instance on which any bindings in the parameter expressions will be registered. The registrator controls the bindings and invokes updates through them. This is well defined for the case when a Base class uses instances of a number of other classes as configured rules, functionality extensions and so on - then this Base will be the registrator. In more complex scenarios one will need to find the closest Base in the direction of the DOM root and pass it here.")
	.Param("sParams","A string or an object containing the parameters. Check parametrization on the documentation for the syntax.");
JBUtil.getRelatedElementsPC = function (baseEl, pattParent, pattChild, bAll) {
    var s = pattParent + ((pattChild != null && pattChild.length > 0) ? "/" + pattChild + (bAll ? "*" : "") : "");
    return JBUtil.getRelatedElements(baseEl, s);
};
// baseEl - the base DOM element relatively to which the search is performed
// patt - pattern or patterns (if more than one separated with , comma), each pattern is of the form parent_keu/child_key or just parent_key.
//          The parent part supports the following special keys . or self - the baseEl itself and .. or parent - the immediate parent of baseEl
// data-class="TabberHelper buttons='./key1,./key2,./key3' pages="./page1,./page2,./page3'"
// details is an optional object parameter. If specified the function will set some properties in it to inform the caller for additional specifics of the result.
JBUtil.getRelatedElements = function (baseEl, patt, details) {
    if (patt == null || patt.length <= 0) return $();
    var el = $(baseEl);
    var result = $();
    var arrPatts = patt.split(",");
    var arr, p, c, parentKey, childKey, bAll, g;
    if (arrPatts.length > 1 && details != null) details.arrayResult = true;
    for (var i = 0; i < arrPatts.length; i++) {
        arr = arrPatts[i].split("/");
        if (arr.length > 0) {
            parentKey = arr[0].trim();
            if (arr.length > 1) {
                childKey = arr[1].trim();
                bAll = false;
                if (childKey.charAt(childKey.length - 1) == "*") {
                    childKey = childKey.slice(0, childKey.length - 1);
                    bAll = true;
                    if (details != null) details.arrayResult = true;
                }
            } else {
                bAll = false;
                childKey = null;
            }
            switch (arr[0].trim()) {
                case ".":
                case "self":
                    p = el;
                    break;
                case "..":
                case "parent":
                    p = el.parent();
                    break;
                case "__control":
                    p = JBUtil.getSpecialParent(el, JBUtil.EParentKinds.control);
                    break;
                case "__view":
                    p = JBUtil.getSpecialParent(el, JBUtil.EParentKinds.templateRoot);
                    break;
                default:
                    p = el.parents('[data-key="' + arr[0] + '"]');
            }
            p = (p.length <= 1) ? p : $(p.get(0));
            if (p.length > 0) {
                if (childKey == null) {
                    result.push(p.get(0));
                } else {
                    g = ElementGroup.getElementSet(p); // get the group
                    if (g.length > 0) {
                        p = $(g);
                        c = p.find('[data-key="' + childKey + '"]');
                        if (c.length > 0) {
                            if (bAll) {
                                for (var j = 0; j < c.length; result.push(c.get(j++)));
                            } else {
                                result.push(c.get(0));
                            }
                        }
                        if (bAll || c.length <= 0) {
                            c = p.filter('[data-key="' + childKey + '"]');
                            if (c.length > 0) {
                                if (bAll) {
                                    for (var j = 0; j < c.length; result.push(c.get(j++)));
                                } else {
                                    result.push(c.get(0));
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return result;
};
JBUtil.getRelatedObjects = function(baseEl, patt, arrTypes_or_types) {
	var details = {};
	var result = null;
	var els = JBUtil.getRelatedElements(baseEl, patt, details);
	var types = [];
	var i, itm;
	for (i = 2; i < arguments.length; i++) {
		var t = arguments[i];
		if (typeof t == "string") {
			types.push(t);
		} else if (BaseObject.is(t, "Array")) {
			types = types.concat(t);
		} 
	}
	
	result = [];
	for (i = 0; i < els.length; i++) {
		itm = els.get(i);
		if (itm != null && itm.activeClass != null) {
			if (types.length == 0) {
				result.push(itm.activeClass);
			} else {
				if (types.All(function(idx, item) {
					return BaseObject.is(itm.activeClass, item);
				})) {
					result.push(itm.activeClass);
				};
			}
		}
	}
	if (!details.arrayResult) {
		if (result.length > 0) return result[0];
		return null;
	}
	return result;
}.Description("Like getRelatedElements, but returns the Base objects attached to them (only those that have data-class, the rest are ignored). Also, unlimited number of string or array arguments can be specified after the pattern, in which case only the objects compatible with the speicfied types are returned.");
JBUtil.getDataKeyOfElement = function (el_bind_cbase) {
    var el = el_bind_cbase;
	if (BaseObject.is(el_bind_cbase,"Base")) {
		el = el_bind_cbase.root;
	} else if (BaseObject.is(el_bind_cbase, "Binding")) {
		el = el_bind_cbase.$target;
	} else if (BaseObject.is(el_bind_cbase,"ElementBehaviorBase")) {
		el = el_bind_cbase.$target;
	} else if (BaseObject.isDOM(el_bind_cbase)) {
		el = el_bind_cbase;
	} else if (BaseObject.isJQuery(el_bind_cbase) && el_bind_cbase.length > 0) {
		el = el_bind_cbase.get(0);
	} else {
		return null;
	}
    if (el != null) {
		if (el.hasAttribute && el.hasAttribute("data-key")) return el.getAttribute("data-key");
	}
	return null;
}

JBUtil.EParentKinds = { control: 0, templateRoot: 1 };
JBUtil.getSpecialParent = function (baseEl, parentKind) {
    var cur = $(baseEl);
    var raw;
    var result = $();
    if (parentKind == JBUtil.EParentKinds.control) {
        cur = cur.parent(); // We need to start from the parent in case this is a control root too
        while (cur != null && cur.length > 0) {
            raw = cur.activeclass();
            if (raw != null && BaseObject.is(raw, "IUIControl")) {
                result.push(cur.get(0));
                return result;
            }
            cur = $(cur).parent();
        }
    } else if (parentKind == JBUtil.EParentKinds.templateRoot) {
        // In this case we can return the current element if it is the template root.
        while (cur != null && cur.length > 0) {
            if (JBUtil.isTemplateRoot(cur)) {
                result.push(cur.get(0));
                return result;
            }
            cur = $(cur).parent();
        }
    }
    return result;
};
JBUtil.isTemplateRoot = function (el) {
	var he = DOMUtil.toDOMElement(el); // HTMLElement
	if (he != null) {
		var ac = he.activeClass;
		if (BaseObject.is(ac, "ITemplateRoot")) return true;
		if (he.getAttribute("data-template-root") != null) return true;
	}
	return false;
	
    // var e = $(el);
    // var c = e.activeclass();
    // if (c != null && c.is("ITemplateRoot")) return true;
    // if (e.attr("data-template-root") != null) return true;
    // return false;
};
JBUtil.getNamedBinding = function (baseEl, bName) {
    var el = $(baseEl);
    var c = el.activeclass();
    while (c == null) {
        if (el.length == 0) return null;
        if (JBUtil.isTemplateRoot(el)) return null;
        el = el.parent();
        c = el.activeclass();
        if (!BaseObject.is(c, "Base")) c = null;
    }
    return c.findBindingByName(bName);
};
// Internal - resolves a single reference. For public use see the non $ function
JBUtil.$resolveBindingReference = function (baseEl, addr, overalDetails) {
    var parts, details = {}, arrResult = [];
    if (!BaseObject.is(addr, "string")) return [];
    if (addr.indexOf("@") >= 0) {
        parts = addr.split("@");
        if (parts != null) {
            var o = JBUtil.getRelatedElements(baseEl, parts[0], details);
            var ac = null, el;
            if (details.arrayResult) overalDetails.arrayResult = true;
            if (o != null) {
                for (var i = 0; i < o.length; i++) {
                    el = o.get(i);
                    if (el != null) {
                        el = $(el);
                        ac = el.activeclass();
                        if (ac != null && parts.length > 1 && parts[1].length > 0) {
                            arrResult.push(BaseObject.getProperty(ac, parts[1], null));
                        } else {
                            arrResult.push(ac);
                        }
                    }
                }
            }
        }
    } else if (addr.indexOf("~") >= 0) {
        parts = addr.split("~");
        if (parts != null) {
            var o = JBUtil.getRelatedElements(baseEl, parts[0], details);
            var ac = null, el;
            if (details.arrayResult) overalDetails.arrayResult = true;
            if (o != null) {
                for (var i = 0; i < o.length; i++) {
                    el = o.get(i);
                    var dc;
                    if (el != null) {
                        el = $(el);
                        dc = JBUtil.findDataContext(el);
                        if (dc != null | parts.length > 1 && parts[1].length > 0) {
                            arrResult.push(BaseObject.getProperty(dc, parts[1], null));
                        } else {
                            arrResult.push(dc);
                        }
                    }
                }
            }
        }
    } else {
        parts = addr.split(":");
        if (parts != null) {
            var o = JBUtil.getRelatedElements(baseEl, parts[0], details);
            var b, el;
            if (details.arrayResult) overalDetails.arrayResult = true;
            if (o != null) {
                for (var i = 0; i < o.length; i++) {
                    var el = o.get(i);
                    if (el != null) {
                        el = $(el);
                        if (parts.length > 1 && parts[1].length > 0) {
                            b = JBUtil.getNamedBinding(el, parts[1]);
                            if (b != null) arrResult.push(b);
                        } else {
                            arrResult.push(el);
                        }
                    }
                }
            }
        }
    }
    return arrResult;
};
// Resolves an expression of the kind parent[/child][:binding] where [] denote optional parts.
// This is used for resolution of references in bindings
JBUtil.resolveBindingReference = function (baseEl, addr) {
    if (!BaseObject.is(addr, "string")) return null;
    var parts, arrResult = [];
    var d = {};
    var arrpats = addr.split(",");
    var r;
    if (arrpats != null) {
        if (arrpats.length > 1) d.arrayResult = true;
        for (var i = 0; i < arrpats.length; i++) {
            r = JBUtil.$resolveBindingReference(baseEl, arrpats[i], d);
            if (d.arrayResult) {
                arrResult.copyFrom(r);
            } else {
                if (r != null && r.length > 0) {
                    return r[0];
                } else {
                    return null;
                }
            }
        }
        if (!d.arrayResult) return null;
    }
    return arrResult;
};
JBUtil.$parseFlagSelector = function (selector) {
    var s = (selector != null) ? selector : "";
    var arr = s.split("|");
    var selnodes = [];
    for (var i = 0; i < arr.length; i++) {
        selnodes.push(arr[i].split("&"));
    }
    return selnodes;
};
JBUtil.reParseDataClass = /^(\S+)(.*)$/i;
JBUtil.parseDataClass = function (expr) {
    if (BaseObject.is(expr, "string") && expr.length > 0) {
        var sexpr = expr.trim();
        if (sexpr.charAt(0) == "{") sexpr = sexpr.slice(1, -1);
        var arr = sexpr.match(JBUtil.reParseDataClass);
        if (arr != null && arr.length > 0) {
            var pars = arr[2];
            if (pars != null) pars = pars.trim();
            if (pars.length == 0) pars = null;
            var cn = arr[1];
            if (cn != null && cn.length == 0) return null;
            return {
                className: arr[1],
                parameters: pars
            };
        }
    } else if (typeof expr == "object") {
		var r = null;
		if (typeof expr.className == "string") {
			r = { className: expr.className };
		}
		if (r != null && expr.parameters != null) {
			r.parameters = expr.parameters;
		}
		return r;
	}
    return null;
};
JBUtil.findDataContext = function (el, useParentContext) {
    var cur = $(el);
    if (useParentContext) {
        cur = cur.parent();
    }
    while (cur != null && cur.length > 0) {
        cur = cur.get(0);
        if (cur == null) break;
        if (cur.dataContext != null || cur.hasDataContext === true || JBUtil.isTemplateRoot(cur)) return cur.dataContext;
        cur = $(cur).parent();
    }
    return null;
};
// Standard get/set routines for use inside the binding related routines (avoid using these in application specific code).
JBUtil.$getProperty = function (obj, idx, prop) {
    if (obj != null) {
        if (typeof prop == "number") {
            if (idx == null) {
                return obj[prop];
            } else {
                if (obj[prop] == null) return null;
                return obj[prop][idx];
            }
        } else if (prop != null && prop.length > 0) {
            if (prop.charAt(0) == "$") {
                if (idx != null) {
                    return obj["get_" + prop.slice(1)](idx);
                } else {
                    return obj["get_" + prop.slice(1)]();
                }
            } else {
                if (idx == null) {
                    return obj[prop];
                } else {
                    if (obj[prop] == null) return null;
                    return obj[prop][idx];
                }
            }
        }
    }
    return obj;
};
JBUtil.$setProperty = function (obj, idx, prop, v) {
    if (obj != null) {
        if (typeof prop == "number") {
            if (idx == null) {
                obj[prop] = v;
            } else {
                if (obj[prop] == null) obj[prop] = [];
                obj[prop][idx] = v;
            }
        } else if (prop != null && prop.length > 0) {
            if (prop.charAt(0) == "$") {
                if (idx != null) {
                    obj["set_" + prop.slice(1)](idx, v);
                } else {
                    obj["set_" + prop.slice(1)](v);
                }
            } else {
                if (idx == null) {
                    obj[prop] = v;
                } else {
                    if (obj[prop] == null) obj[prop] = {};
                    obj[prop][idx] = v;
                }
            }
        }
    }
};
JBUtil.$setPropertyStrict = function (obj, idx, prop, v) {
    if (obj != null) {
        if (typeof prop == "number") {
            if (idx == null) {
                obj[prop] = v;
            } else {
                if (obj[prop] == null) obj[prop] = [];
                obj[prop][idx] = v;
            }
        } else if (prop != null && prop.length > 0) {
            if (prop.charAt(0) == "$") {
                if (idx != null) {
                    obj["set_" + prop.slice(1)](idx, v);
                } else {
                    obj["set_" + prop.slice(1)](v);
                }
            } else {
                if (idx == null) {
                    obj[prop] = v;
                } else {
                    if (obj[prop] == null) obj[prop] = {};
                    obj[prop][idx] = v;
                }
            }
        }
    }
};
// The DOM routing (default and outside the query routing pattern - DOM elements do not support routing)
JBUtil.throwStructuralQuery = function (domEl, query, processInstructions) {
    var curElement, curActiveClass;
    curElement = $(domEl);
    curActiveClass = curElement.activeclass();
    while (curElement.length != 0) {
        if (curActiveClass != null) {
            if (curActiveClass.is("IStructuralQueryRouter") && curActiveClass.get_structuralQueryRoutingType() != "DOM") {
                return curActiveClass.routeStructuralQuery(query, processInstructions);
            } else if (curActiveClass.is("IStructuralQueryProcessor")) {
                if (curActiveClass.processStructuralQuery(query, processInstructions)) {
                    return true;
                }
            }
        }
        //        if (curActiveClass != null && curActiveClass.is("IStructuralQueryProcessorImpl")) {
        //            if (curActiveClass.processStructuralQuery(query, processInstructions)) {
        //                return true;
        //            }
        //        }
        curElement = curElement.parent();
        curActiveClass = curElement.activeclass();
    }
    return false;
};
JBUtil.throwDownStructuralQuery = function (domEl, query, processInstructions) {
    var curEl = $(domEl).parent();
    return JBUtil.throwStructuralQuery(curEl, query, processInstructions);
};
JBUtil.getScrollbarWidth = function () {
    var div, body, w = window._browserScrollbarWidth;
    if (w === undefined) {
        body = document.body, div = document.createElement('div');
        div.innerHTML = '<div style="width: 50px; height: 50px; position: absolute; left: -100px; top: -100px; overflow: auto;"><div style="width: 1px; height: 100px;"></div></div>';
        div = div.firstChild;
        body.appendChild(div);
        w = window._browserScrollbarWidth = div.offsetWidth - div.clientWidth;
        body.removeChild(div);
  }
  return w;
};
JBUtil.adjustPopupInHost = function(view, el, shiftLeft, shiftTop, mode) {
	var th;
	if (!BaseObject.is(view, "Base")) {
		jbTrace.log("JBUtil.adjustPopupInHost: view is not a Base object");
		return;
	}
	if (typeof el == "string") {
		th = view.getRelatedElements(el);
	} else {
		th = el;
	}
	if (th == null || th.length == 0) {
		jbTrace.log("JBUtil.adjustPopupInHost: el is not found or null has been passed.");
		return;
	}
    var query = new HostCallQuery(HostCallCommandEnum.gethost);
    view.throwStructuralQuery(query);
    var viewcontainer = null;
    if (query.host != null) {
        if (BaseObject.is(query.host, "IViewHostQuery")) {
            viewcontainer = query.host.get_viewcontainerelement();
            if (viewcontainer != null) {
                if ($(viewcontainer).has(th).length == 0) {
                    viewcontainer = null;
                }
            }
        }
        if (viewcontainer == null) {
            // Try window
            if (BaseObject.is(query.host, "BaseWindow")) {
                viewcontainer = query.host.get_windowelement();
            }
        }

        if (viewcontainer == null) {
            jbTrace.log("JBUtil.adjustPopupInHost: Cannot find appropriate container.");
            return;
        }
		var containerRect = Rect.fromDOMElementInner(viewcontainer);
		var controlRect = Rect.fromDOMElementOffset(view.root);
		var pt = new Point(controlRect.x + (shiftLeft ? shiftLeft : 0), controlRect.y + (shiftTop ? shiftTop : 0));
		var ballonRect = Rect.fromDOMElementOffset(th);
		// Safety madness
		if (ballonRect.w <= 0) {
			ballonRect.w = 250;
		}
		if (ballonRect.h <= 0) {
			ballonRect.h = 20;
		}
		var placementRect = containerRect.adjustPopUp(controlRect, ballonRect, (typeof mode == "string"?mode:"aboveunder"), 0);
		// Assume the control is relative and correct to that
		placementRect.x = placementRect.x - controlRect.x;
		placementRect.y = placementRect.y - controlRect.y;
		th.css("z-index", "9999");
		// We do not want to change the size - the popup is glued to the host element and if something remains hidden we are good with that.
		placementRect.w = null;
		placementRect.h = null;
		placementRect.toDOMElement(th);
	} else {
		jbTrace.log("JBUtil.adjustPopupInHost: cannot find the view's host.");
	}

}.Description("Moves the el (pop up) anchored to the view (anchor for positioning) in its view container (usually a window client) in the best possible position around the anchor so that it would be entirely visible (if possible)." +
				" It is assumed that the pop up (el) is absolutely positioned relatively to the host's view container")
	.Param("view","The anchor element - for example the header of a drop down.")
	.Param("el","The element to position (the pop up)")
	.Param("shiftLeft","Pixels to shift the element left/right")
	.Param("shiftTop","Pixels to shift the element top/down");
