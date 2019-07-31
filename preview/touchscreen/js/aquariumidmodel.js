var AquariumIDModel = function () {
	var _endpoint = '//displays.calacademy.org';
	var _callbackData = { callback: '_jqjsp' };
	var _timeout = 12000;

	var _getNormalizedNodeData = function (data) {
		if (calacademy.Utils.isArray(data.nodes)) {
			var arr = [];
			var i = 0;

			while (i < data.nodes.length) {
				var obj = data.nodes[i];

				if (typeof(obj.node) == 'object') {
					arr.push(obj.node);
				}

				i++;
			}

			if (arr.length > 0) {
				return arr;
			}
		}

		return false;
	}

	var _requestJsonp = function (path, success, error) {
		calacademy.Utils.log(_endpoint + path);

		$.jsonp({
			timeout: _timeout,
			data: _callbackData,
			url: _endpoint + path,
			success: function (data, textStatus) {
				var normalized = _getNormalizedNodeData(data);

				if (!normalized) {
					if (typeof(error) == 'function') error();
				} else {
					success(normalized, data);
				}
			},
			error: function (data, textStatus) {
				if (typeof(error) == 'function') error();
			}
		});
	}

	this.getVocabulary = function (success, error) {
		var endpoint = calacademy.isLocal ? '/themes.jsonp' : '/exhibit-theme-list';
		_requestJsonp(endpoint, success, error);
	}

	this.getTanks = function (success, error) {
		var endpoint = calacademy.isLocal ? '/tanks.jsonp' : '/display-list';
		_requestJsonp(endpoint, success, error);
	}

	this.getTankContentsById = function (id, success, error) {
		var endpoint = calacademy.isLocal ? '/content.jsonp' : '/displays/' + id + '/json';
		_requestJsonp(endpoint, success, error);
	}

	this.initialize = function () {
		calacademy.Utils.log('AquariumIDModel.initialize');

		if (parseInt($.getQueryString('qa'))) {
			_endpoint = '';
		}

		if (calacademy.isLocal) {
			_endpoint = 'data';
		}
	}

	this.initialize();
}
