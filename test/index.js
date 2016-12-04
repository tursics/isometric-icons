var spriteCount = 0;

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

function getTransportationTile(chr, item) {
	'use strict';

	switch (chr) {
	case '-':
		return '../transportTiles/transportTilesRL' + item + 'bahn.png';
	case '|':
		return '../transportTiles/transportTilesTB' + item + 'bahn.png';
	case '/':
		return '../transportTiles/transportTilesNS' + item + 'bahn.png';
	case ';':
		return '../transportTiles/transportTilesEW' + item + 'bahn.png';
	case '.':
		return '../transportTiles/transportTilesRS' + item + 'bahn.png';
	case ',':
		return '../transportTiles/transportTilesEL' + item + 'bahn.png';
	case '`':
		return '../transportTiles/transportTilesBW' + item + 'bahn.png';
	case 'l':
		return '../transportTiles/transportTilesTE' + item + 'bahn.png';
	case 'v':
		return '../transportTiles/transportTilesRW' + item + 'bahn.png';
	case '+':
		return '../transportTiles/transportTilesTRBL' + item + 'bahn.png';
	case 'x':
		return '../transportTiles/transportTilesNESW' + item + 'bahn.png';
	}

	return '../cityTiles/cityTiles_072.png';
}

function getTransportationTileBoth(chrS, chrU) {
	'use strict';

	var chr = chrS + chrU;
	switch (chr) {
	case '|-':
		return '../transportTiles/transportTilesTRBLsubahn.png';
	case '-|':
		return '../transportTiles/transportTilesTRBLusbahn.png';
	}

	return getTransportationTile(chrS, 's');
}

function createSprite() {
	'use strict';

	++spriteCount;

	var sprites = document.getElementById('sprites'), sprite;
	sprite = document.createElement('img');
	sprites.appendChild(sprite);

	return {
		obj: sprite,
		basePath: '../vehicleTiles/Taxi/taxi_',
		x: -1,
		y: -1,
		setTo: function (x, y) {
			this.x = x;
			this.y = y;
			this.obj.src = this.basePath + 'E.png';
			this.obj.style = 'left:' + (65 + x * 130 + (y % 2) * 65) + 'px;top:' + ((y + 1) * 33) + 'px;';
		},
		moveTo: function (x, y, callback) {
			var duration = 250 * Math.max(Math.abs(this.x - x), Math.abs(this.y - y));

			if ((this.x === x) && (this.y < y)) {
				this.obj.src = this.basePath + 'S.png';
			} else if ((this.x === x) && (this.y > y)) {
				this.obj.src = this.basePath + 'N.png';
			} else if ((this.x < x) && (this.y < y)) {
				this.obj.src = this.basePath + 'SE.png';
			} else if ((this.x < x) && (this.y > y)) {
				this.obj.src = this.basePath + 'NE.png';
			} else if ((this.x < x) && (this.y === y)) {
				this.obj.src = this.basePath + 'E.png';
			} else if ((this.x > x) && (this.y === y)) {
				this.obj.src = this.basePath + 'W.png';
			} else if ((this.x > x) && (this.y > y)) {
				this.obj.src = this.basePath + 'NW.png';
			} else if ((this.x > x) && (this.y < y)) {
				this.obj.src = this.basePath + 'SW.png';
			}

			this.x = x;
			this.y = y;

			$(this.obj).animate({
				left: (65 + x * 130 + (y % 2) * 65),
				top: ((y + 1) * 33)
			}, duration, callback);
		}
	};
}

function driveLine(sprite, line, startPos, endPos, callback) {
	'use strict';

	var pos = startPos;

	sprite.setTo(line[pos].coords.x, line[pos].coords.y);

	function oneStep() {
		if (pos !== endPos) {
			if (startPos < endPos) {
				++pos;
			} else {
				--pos;
			}

			sprite.moveTo(line[pos].coords.x, line[pos].coords.y, oneStep);
		} else {
			callback();
		}
	}
	oneStep();
}

function placeVehicles(line) {
	'use strict';

	var s1 = createSprite(), s2 = createSprite();

	function firstWay() {
		driveLine(s1, line, 0, line.length - 1, function() {
			driveLine(s1, line, line.length - 1, 0, firstWay);
		});
	}
	firstWay();

	function wayBack() {
		driveLine(s2, line, line.length - 1, 0, function() {
			driveLine(s2, line, 0, line.length - 1, wayBack);
		});
	}
	wayBack();
}

function testSprites(lines) {
	'use strict';

	for (var key in lines) {
		placeVehicles(lines[key]);
	}
}

function composeMap(lines, netSBahn, netUBahn) {
	'use strict';

	var maxX = 0, maxY = 0, line, coords, key, index, map, html, x, y, img;

	for (key in lines) {
		line = lines[key];
		for (index = 0; index < line.length; ++index) {
			coords = line[index].coords;
			maxX = Math.max(maxX, coords.x);
			maxY = Math.max(maxY, coords.y);
		}
	}
	++maxX;
	++maxY;

	map = document.getElementById('map');
	html = '';
	for (y = 0; y < maxY; ++y) {
		html += '<p>';
		for (x = 0; x < maxX; ++x) {
			img = '../cityTiles/cityTiles_072.png';

			if ((typeof netSBahn[y] !== 'undefined') && (typeof netSBahn[y][x] !== 'undefined') && (netSBahn[y][x] !== ' ') && (typeof netUBahn[y] !== 'undefined') && (typeof netUBahn[y][x] !== 'undefined') && (netUBahn[y][x] !== ' ')) {
				img = getTransportationTileBoth(netSBahn[y][x], netUBahn[y][x]);
			} else if ((typeof netSBahn[y] !== 'undefined') && (typeof netSBahn[y][x] !== 'undefined') && (netSBahn[y][x] !== ' ')) {
				img = getTransportationTile(netSBahn[y][x], 's');
			} else if ((typeof netUBahn[y] !== 'undefined') && (typeof netUBahn[y][x] !== 'undefined') && (netUBahn[y][x] !== ' ')) {
				img = getTransportationTile(netUBahn[y][x], 'u');
			}
			html += '<img id="tile' + x + '_' + y + '" class="tile" style="left:' + (x * 130) + 'px;" src="' + img + '">';
		}

		var stationsS = [];
		var stationsU = [];
		for (x = 0; x < maxX; ++x) {
			stationsS.push(0);
			stationsU.push(0);
		}
		for (var key in lines) {
			var line = lines[key];
			for (var index = 0; index < line.length; ++index) {
				var coords = line[index].coords;
				if ('station' === (line[index].type) && (y === coords.y)) {
					if ('u' === key.substr(0, 1)) {
						++stationsU[coords.x];
					} else {
						++stationsS[coords.x];
					}
				}
			}
		}
		for (x = 0; x < maxX; ++x) {
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

	html += '<div id="sprites"></div>';
	map.innerHTML = html;

	testSprites(lines);
}

function load() {
	ajax('https://cdn.rawgit.com/juliuste/ca37f19122407ef710a2c6322306af11/raw/a559056d82b99400b0ff4f868088445614722130/lines2.json', function(lines) {
//	ajax('lines.json', function(lines) {
		ajax('netSBahn.json', function(netSBahn) {
			ajax('netUBahn.json', function(netUBahn) {
				composeMap(lines, netSBahn, netUBahn);
			});
		});
	});
}

load();
