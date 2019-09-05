if (typeof(jQuery) != 'undefined') {
	(function ($) {
	    $.extend({
	        getQueryString: function (name) {
	            function parseParams() {
	                var params = {},
	                    e,
	                    a = /\+/g,  // Regex for replacing addition symbol with a space
	                    r = /([^&=]+)=?([^&]*)/g,
	                    d = function (s) { return decodeURIComponent(s.replace(a, ' ')); },
	                    q = window.location.search.substring(1);

	                while (e = r.exec(q))
	                    params[d(e[1])] = d(e[2]);

	                return params;
	            }

	            if (!this.queryStringParams)
	                this.queryStringParams = parseParams();

	            return this.queryStringParams[name];
	        }
	    });
	})(jQuery);
}

var calacademy = {
	isLocal: (typeof($.getQueryString('tank')) != 'string'),
	selectEvent: Modernizr.touch ? 'touchend' : 'click',
	Constants: {
		expandImageWidth: 2600,
		previewMsg: 'This is a preview intended to proof content only. Display layouts may not be accurately reflected.',
		ebuMsg: 'While this exhibit is being updated, please visit some of our other <em>38,000 live animals.</em>',
		localAssetPath: 'assets/',
		fallbackTheme: 3,
		fallbackEbuImages: [
			{
				src: 'images/fallback-ebu-01.jpg',
				cap: 'Vivian Young © California Academy of Sciences'
			},
			{
				src: 'images/fallback-ebu-02.jpg',
				cap: 'Kathryn Whitney © California Academy of Sciences'
			}
		]
	},
	addHighlight: function (el) {
		var over = Modernizr.touch ? 'touchstart' : 'mouseover';
		var out = Modernizr.touch ? 'touchend' : 'mouseout click';

		el.on(over, function () {
			$(this).addClass('highlight');
		});
		el.on(out, function () {
			$(this).removeClass('highlight');
		});
	},
	Utils: {
		log: function (obj) {
			if (typeof(console) == 'undefined') {
				if (typeof(dump) == 'function') {
					dump(obj);
				} else {
					// alert(obj);
				}
			} else {
				console.log(obj);
			}
		},
		randomRange: function (low, high) {
			return (Math.random() * high) + low;
		},
		isArray: function (myVar) {
			if (typeof(myVar) == 'undefined') return false;
			return (Object.prototype.toString.call(myVar) === '[object Array]');
		},
		htmlDecode: function (value) {
			return $('<div />').html(value).text();
		},
		getUnique: function (arr) {
			var u = {};
			var a = [];
			
			$.each(arr, function (i, val) {
				if (u.hasOwnProperty(val)) {
					return;
				}

				a.push(val);
				u[val] = 1;
			});

			return a;
		},
		scaleToFill: function (item, container) {
			var w = Math.ceil((item.width() * container.height()) / item.height());
			
			if (w >= container.width()) {
				item.css('width', w + 'px');
				item.css('height', container.height() + 'px');

				var x = Math.round((container.width() - w) / 2);
				item.css('left', x + 'px');
				item.css('top', '0px');
			} else {
				var h = Math.ceil((item.height() * container.width()) / item.width());

				item.css('width', container.width() + 'px');
				item.css('height', h + 'px');
				
				var y = Math.round((container.height() - h) / 2);
				
				item.css('left', '0px');
				item.css('top', y + 'px');
			}
		}
	}
};
