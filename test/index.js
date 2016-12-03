function ajax(url, callback) {
	'use strict';

	var xmlhttp = null;
	if (window.XMLHttpRequest) {
		xmlhttp = new XMLHttpRequest();
	} else {
		xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
	}

	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
			callback(JSON.parse(xmlhttp.responseText));
		}
	};
	xmlhttp.open('GET', url, true);
	xmlhttp.send();
}

function composeMap(lines, netSBahn, netUBahn) {
	'use strict';

	var maxX = 0, maxY = 0, line, coords;

	for (var key in lines) {
		line = lines[key];
		for (var index = 0; index < line.length; ++index) {
			coords = line[index].coords;
			maxX = Math.max(maxX, coords.x);
			maxY = Math.max(maxY, coords.y);
		}
	}
	++maxX;
	++maxY;

	var map = document.getElementById('map');
	var html = '';
	for (var y = 0; y < maxY; ++y) {
		html += '<p>';
		for (var x = 0; x < maxX; ++x) {
			var img = '../cityTiles/cityTiles_072.png';

			if ((typeof netSBahn[y] !== 'undefined') && (typeof netSBahn[y][x] !== 'undefined')) {
				switch(netSBahn[y][x]) {
				case '-': img = '../transportTiles/transportTilesRLsbahn.png'; break;
				case '|': img = '../transportTiles/transportTilesTBsbahn.png'; break;
				case '/': img = '../transportTiles/transportTilesNSsbahn.png'; break;
				case ';': img = '../transportTiles/transportTilesEWsbahn.png'; break;
				case '.': img = '../transportTiles/transportTilesRSsbahn.png'; break;
				}
			} else if ((typeof netUBahn[y] !== 'undefined') && (typeof netUBahn[y][x] !== 'undefined')) {
				switch(netUBahn[y][x]) {
				case '-': img = '../transportTiles/transportTilesRLubahn.png'; break;
				case '|': img = '../transportTiles/transportTilesTBubahn.png'; break;
				case '/': img = '../transportTiles/transportTilesNSubahn.png'; break;
				case ';': img = '../transportTiles/transportTilesEWubahn.png'; break;
				case '.': img = '../transportTiles/transportTilesRSubahn.png'; break;
				}
			}
			html += '<img id="tile' + x + '_' + y + '" class="tile" style="left:' + (x * 130) + 'px;" src="' + img + '">';
		}

		var stationsS = [];
		var stationsU = [];
		for (var x = 0; x < maxX; ++x) {
			stationsS.push(0);
			stationsU.push(0);
		}
		for (var key in lines) {
			var line = lines[key];
			for (var index = 0; index < line.length; ++index) {
				var coords = line[index].coords;
				if (y === coords.y) {
					if ('u' === key.substr(0, 1)) {
						++stationsU[coords.x];
					} else {
						++stationsS[coords.x];
					}
				}
			}
		}
		for (var x = 0; x < maxX; ++x) {
			if ((stationsU[x] > 0) && (stationsS[x] > 0)) {
				html += '<img class="tile" style="left:' + (x * 130) + 'px;" src="' + '../transportDetails/transportDetailsSubahn.png">';
			} else if (stationsU[x] > 0) {
				html += '<img class="tile" style="left:' + (x * 130) + 'px;" src="' + '../transportDetails/transportDetailsUbahn.png">';
			} else if (stationsS[x] > 0) {
				html += '<img class="tile" style="left:' + (x * 130) + 'px;" src="' + '../transportDetails/transportDetailsSbahn.png">';
			}
		}
		html += '</p>';
	}
	map.innerHTML = html;
}

function load() {
	ajax('lines.json', function(lines) {
		ajax('netSBahn.json', function(netSBahn) {
			ajax('netUBahn.json', function(netUBahn) {
				composeMap(lines, netSBahn, netUBahn);
			});
		});
	});
}

load();
