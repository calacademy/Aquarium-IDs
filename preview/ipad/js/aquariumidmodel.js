var AquariumIDModel = function () {
	var _endpoint = 'http://displays-prod.calacademy.org';
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
				var d = _getNormalizedNodeData(data);

				if (!d) {
					if (typeof(error) == 'function') error();
				} else {
					success(d);
				}
			},
			error: function (data, textStatus) {
				if (typeof(error) == 'function') error();
			}
		});
	}

	this.getVocabulary = function (success, error) {
		_requestJsonp('/exhibit-theme-list', success, error);
	}

	this.getTanks = function (success, error) {
		_requestJsonp('/display-list', success, error);
	}

	this.getTankContentsById = function (id, success, error) {
		_requestJsonp('/displays/' + id + '/json', success, error);
	}

	this.initialize = function () {
		calacademy.Utils.log('AquariumIDModel.initialize');

		if (parseInt($.getQueryString('qa'))) {
			_endpoint = '';
		}
	}

	this.initialize();
}
