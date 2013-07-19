/**
 * Lazy Form Fuzz
 *
 * A tool to take some drudgery out of form testing
 *
 * @author Timothy J Warren
 * @license MIT
 */
(function(RandExp, undefined) {

	"use strict";

	// Some 'constants'
	var MONTH	=	"-(1[0-2]|0[1-9])",
		YEAR	=	"(20|1[0-9])[0-9]{2}", // Year 1000 - 2099
		TIME	=	"(2[0-3]|[0-1][0-9]):[0-5][0-9]",
		DATE	=	YEAR+MONTH+"-(2[0-8]|1[0-9]|0[1-9])";

	// A map of some common regex patterns
	var patterns = {
		email:				/[a-z0-9._+\-]{1,20}@[a-z0-9]{3,15}\.[a-z]{2,4}/i,
		url:				/^(https?:\/\/)([a-z\.\-]+)\.([a-z\.]{2,6})\/?$/,
		sql:				/[a-z0-9"'`\-]{5,17}/,
		text:				/[\x20-\x7E]{10,15}/, // Visible ASCII character range
		color:				/^\#[0-9a-f]{6}$/i,
		tel:				/[0-9+\-]{7,15}/,
		alphanumeric:		/[A-Z][0-9]+/i,
		week:				new RegExp(YEAR+"-W(5[1-2]|[1-4][0-9]|0[1-9])"),
		month:				new RegExp(YEAR+MONTH),
		datetime:			new RegExp(DATE+"T"+TIME+"Z"),
		"datetime-local":	new RegExp(DATE+"T"+TIME),
		date:				new RegExp(DATE),
		time:				new RegExp(TIME)
	};
	
	if ( ! Array.prototype.forEach ) {
		Array.prototype.forEach = function(fn, scope) {
			for(var i = 0, len = this.length; i < len; ++i) {
				if (i in this) {
					fn.call(scope, this[i], i, this);
				}
			}
		};
	}

	var array_diff = function(arr1)
	{
		// http://kevin.vanzonneveld.net
		// original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// improved by: Sanjoy Roy
		// revised by: Brett Zamir (http://brett-zamir.me)
		// example 1: array_diff(['Kevin', 'van', 'Zonneveld'], ['van', 'Zonneveld']);
		// returns 1: {0:'Kevin'}
		var retArr = [],
		argl = arguments.length,
		k1 = '',
		i = 1,
		k = '',
		arr = {};

		arr1keys: for (k1 in arr1) {
			for (i = 1; i < argl; i++) {
				arr = arguments[i];
				for (k in arr) {
					if (arr[k] === arr1[k1]) {
					// If it reaches here, it was found in at least one array, so try next value
						continue arr1keys;
					}
				}
				retArr.push(arr1[k1]);
			}
		}

		return retArr;
	};


	/**
	 * Returns a randomly picked number from a maximum, interval, and minimum
	 *
	 * @param int max
	 * @param int step
	 * @param int min
	 * @return int
	 */
	var pickRand = function(max, step, min)
	{
		max = max || 1000;
		step = step || 1;
		min = min || 0;

		var len = Math.round(max / step);
		return Math.ceil(Math.random() * len) * step - min;
	};

	var run = function(xdoc, options)
	{
		// Get all the form elements
		var x,
			attr,
			itype,
			self;
		var elems = xdoc.querySelectorAll("input, select, textarea");
		var len = elems.length;

		// Remove selections from any option fields
		var opts = xdoc.querySelectorAll("option");
		[].forEach.call(opts, function(el) {
			el.selected = false;
		});

		// Remove checks from radio or checkboxes
		var chkd = xdoc.querySelectorAll("[checked]");
		[].forEach.call(chkd, function(el) {
			el.checked = false;
		});

		for(x=0; x < len; x++)
		{
			self = elems[x];

			// Check for attributes to skip
			if (self.hasAttribute('readonly') || self.hasAttribute('disabled')) {continue;}

			// Uncheck any elements that fall through
			if (self.hasAttribute('checked')) { self.checked = false; }

			// Check for pattern attribute
			if (self.hasAttribute('pattern'))
			{
				attr = self.getAttribute('pattern');
				self.value = new RandExp(attr).gen();
				continue;
			}

			// ! Non-input form elements
			if (self.hasAttribute("type") === false && self.nodeName !== "INPUT")
			{
				switch(self.nodeName)
				{
					case "TEXTAREA":
						var txt = new RandExp(patterns.text).gen();
						self.value = txt;
						continue;
					//break;

					case "SELECT":
						var sel_opts = self.querySelectorAll("option");
						sel_opts[Math.floor(Math.random() * sel_opts.length)].selected = true;
						continue;
					//break;

					default:
						continue;
					//break;
				}
			}

			// Default pattern for special input types
			itype = self.getAttribute('type');

			var patt,
				boxen,
				boxen_names = {};

			switch(itype)
			{
				case "radio":
					if (boxen_names[self.name] == null)
					{
						boxen = array_diff(
							xdoc.querySelectorAll('input[type=radio][name='+self.name+']'),
							xdoc.querySelectorAll('[name='+self.name+'][disabled]')
						);

						boxen[Math.floor(Math.random() * boxen.length)].checked = true;
						boxen_names[self.name] = true;
					}
					continue;
				//break;

				case "number":
				case "range":
					self.value = pickRand(self.getAttribute('max'), self.getAttribute('step'), self.getAttribute('min'));
					continue;
				//break;

				case "checkbox":
					var chk = Math.round(Math.random());
					self.checked = chk;
					continue;
				//break;

				case "search":
				case "text":
					patt = patterns.text;
				break;

				case "hidden":
				case "button":
				case "image":
				case "file":
				case "password":
				case "reset":
				case "submit":
					continue;
				//break;

				default:
					if (patterns[itype] != null)
					{
						patt = patterns[itype];
					}
				break;
			}

			if (patt !== null && patt !== undefined)
			{
				var val = new RandExp(patt).gen();
				self.value = val;
				if (String(self.value).toLowerCase() != String(val).toLowerCase())
				{
					console.log(itype+" : "+val);
					console.log(self.value);
				}
				continue;
			}
		}
	};

	// Run on the main document
	run(document);

	// Run on frames if they exist
	var frms = document.querySelectorAll("frame, iframe");
	var frlen = frms.length;
	if (frlen > 0)
	{
		[].forEach.call(frms, function(frm) {
			run(frm.contentWindow.document);
		});
	}
}(RandExp));