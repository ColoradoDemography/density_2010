dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("esri.map");
dojo.require("esri.arcgis.utils");
dojo.require("esri.layers.FeatureLayer");
dojo.require("dijit.Menu");
dojo.require("esri.dijit.Geocoder");
dojo.require("esri.dijit.Legend");


var legend;
var map;
var featureLayer;
var resizeTimer;

var legendLayers = [];

var Block;
var Block2;

function commafy(nStr) {
	var x, x1, x2, rgx;

	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function init() {

	$("#legendDiv").draggable({
		containment : "#mapDiv"
	});

	$("select").uniform();

	map = new esri.Map("mapDiv", {
		center : [-105.109167, 40.171667],
		zoom : 12,
		sliderStyle : "large",
		maxZoom : 16,
		minZoom : 1,
        basemap: "gray"
	});
    


	dojo.connect(map, "onLoad", initOperationalLayer);

	dojo.byId("title").innerHTML = "Population Density";
	dojo.byId("subtitle").innerHTML = "US Census 2010, Block Data";

	//addbasemap("TerrainMap");
}

function initOperationalLayer(map) {

	var Geocoder = new esri.dijit.Geocoder({
		autoComplete : true,
		arcgisGeocoder : {
			placeholder : "Find a place",
			sourceCountry : 'USA'
		},
		map : map
	}, dojo.byId("search"));

	// start widget
	Geocoder.startup();

	esri.config.defaults.map.logoLink = "https://dola.colorado.gov/";
	//document.getElementsByClassName('logo-med')[0].style.backgroundImage = "url(\"https://dola.colorado.gov/gis-php/files/gis-images/CO_LOGO.png\")";
	document.getElementsByClassName('logo-med')[0].style.backgroundRepeat = "no-repeat";

	Block = new esri.layers.FeatureLayer("https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/CBlocksDissoved/FeatureServer/0", {
		mode : esri.layers.FeatureLayer.MODE_ONDEMAND,
		outFields : ["*"]
	});

	Block2 = new esri.layers.FeatureLayer("https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/HousingDissolved/FeatureServer/0", {
		mode : esri.layers.FeatureLayer.MODE_ONDEMAND,
		outFields : ["*"]
	});

	var renderer, defaultSymbol;

	defaultSymbol = new esri.symbol.SimpleFillSymbol();
	defaultSymbol.setColor(new dojo.Color([150, 150, 150, 0.5])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([100, 100, 100]), 0.1));

	renderer = new esri.renderer.ClassBreaksRenderer(defaultSymbol, 'Symb');
	renderer.addBreak({
		minValue : 0.5,
		maxValue : 1.5,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([129, 179, 171, 0.4])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "250 to 500 per sq mile"
	});
	renderer.addBreak({
		minValue : 1.5,
		maxValue : 2.5,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([191, 212, 138, 0.4])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "500 to 1,000"
	});
	renderer.addBreak({
		minValue : 2.5,
		maxValue : 3.5,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([250, 250, 100, 0.4])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "1,000 to 2,500"
	});
	renderer.addBreak({
		minValue : 3.5,
		maxValue : 4.5,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([252, 179, 68, 0.4])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "2,500 to 5,000"
	});
	renderer.addBreak({
		minValue : 4.5,
		maxValue : 5.5,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([247, 110, 42, 0.4])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "5,000 to 10,000"
	});
	renderer.addBreak({
		minValue : 5.5,
		maxValue : 6.5,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([232, 21, 21, 0.4])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "> 10,000 per sq mile"
	});

	Block.setRenderer(renderer);

	var renderer3;

	renderer3 = new esri.renderer.ClassBreaksRenderer(defaultSymbol, 'Symb');
	renderer3.addBreak({
		minValue : 0.5,
		maxValue : 1.5,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 200, 0, 0.4])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "100 to 200 HU per sq mile"
	});
	renderer3.addBreak({
		minValue : 1.5,
		maxValue : 2.5,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 125, 3, 0.4])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "200 to 400"
	});
	renderer3.addBreak({
		minValue : 2.5,
		maxValue : 3.5,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 23, 58, 0.4])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "400 to 1,000"
	});
	renderer3.addBreak({
		minValue : 3.5,
		maxValue : 4.5,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([255, 0, 111, 0.4])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "1,000 to 2,000"
	});
	renderer3.addBreak({
		minValue : 4.5,
		maxValue : 5.5,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([204, 0, 184, 0.4])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "2,000 to 4,000"
	});
	renderer3.addBreak({
		minValue : 5.5,
		maxValue : 6.5,
		symbol : new esri.symbol.SimpleFillSymbol().setColor(new dojo.Color([0, 0, 255, 0.4])).setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_NULL)),
		label : "> 4,000 HU per sq mile"
	});

	Block2.setRenderer(renderer3);

	map.addLayers([Block, Block2]);

	Block2.hide();

	dojo.forEach(map.graphicsLayerIds, function(id) {
		var layer = map.getLayer(id);
		legendLayers.push({
			layer : layer,
			title : "TITLE"
		});
	});

	legend = new esri.dijit.Legend({
		map : map,
		layerInfos : legendLayers
	}, "legendDiv");
	legend.startup();

	countyLayer = new esri.layers.FeatureLayer("https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/County_C2010v3/FeatureServer/0", {
		mode : esri.layers.FeatureLayer.MODE_ONDEMAND
	});

	//RENDERER for county layer only - please keep
	var defaultSymbol2 = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NULL, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 0]), 2.5), new dojo.Color([0, 0, 0, 1]));
	var renderer2 = new esri.renderer.SimpleRenderer(defaultSymbol2);
	countyLayer.setRenderer(renderer2);

	map.addLayers([countyLayer]);

}

function midFunction() {
	if ($('#g2').val() == '1') {
		Block2.hide();
		Block.show();
		dojo.byId("title").innerHTML = "Population Density";
	}

	if ($('#g2').val() == '2') {
		Block.hide();
		Block2.show();
		dojo.byId("title").innerHTML = "Housing Unit Density";
	}
}

/*function addbasemap(bmName) {
	var basemap;

	if (bmName == "TerrainMap") {
		basemap = new esri.layers.WebTiledLayer("https://api.mapbox.com/styles/v1/statecodemog/ciq0yl9wf000ebpndverm5ler/tiles/256/{z}/{x}/{y}", {
			"copyright" : "<a href='https://www.mapbox.com/about/maps/'>© Map Box and OpenStreetMap</a>",
			"id" : "MapBoxStreets",
			"subDomains" : ["a", "b", "c", "d"]
		});
	}

	map.addLayer(basemap);
}*/

function makeid() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < 5; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

function Clickhereformap(mainid) {

	//new ({ wkid: 4326});
	//old ({ wkid: 102100});
	var oldx = (map.extent.xmin + map.extent.xmax) / 2;
	var oldy = (map.extent.ymin + map.extent.ymax) / 2;

	//function convert spatial ref 102100 to spatial ref 4326
	var x = oldx;
	var y = oldy;
	var num3 = x / 6378137.0;
	var num4 = num3 * 57.295779513082323;
	var num5 = Math.floor(((num4 + 180.0) / 360.0));
	var num6 = num4 - (num5 * 360.0);
	var num7 = 1.5707963267948966 - (2.0 * Math.atan(Math.exp((-1.0 * y) / 6378137.0)));
	var newx = num6;
	var newy = num7 * 57.295779513082323;

	var newobj = new Object();
	newobj.zoom = map.getZoom();
	newobj.filename = "https://dola.colorado.gov/gis-php/phantomDENSITY.html";
	newobj.lat = newy;
	newobj.lng = newx;
	newobj.title = encodeURIComponent(dojo.byId("title").innerHTML);
	newobj.subtitle = encodeURIComponent(dojo.byId("subtitle").innerHTML);
	newobj.stat = $('#g2').val();
	newobj.outname = makeid();
	//output file name  ... makeid() is function creates random 5 letter filename

	$('#printspan').html('Processing...');

	$.get("https://dola.colorado.gov/gis-php/density.php", newobj, function() {
		$('#printspan').html('DOWNLOAD');
		$('#uniform-printbtns').attr("onClick", "opmapwin('" + newobj.outname + "')");
	});

}

function opmapwin(outname) {
	window.open("https://dola.colorado.gov/tmp/" + outname + ".png");
	$('#printspan').html("Print Map");
	$('#uniform-printbtns').attr("onClick", "javascript:Clickhereformap('uniform-printbtns')");
}

dojo.ready(init); 