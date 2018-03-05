var sliderControl = null;

    // Getting the map layers
var mappy = L.tileLayer(
  "https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiYmdicmFuZG9tIiwiYSI6ImNqZTZpZDRldDAwcDkyeHA4ZzV0NjVja3IifQ.wRCPuS8vx5aVtwSQTiXyzg"
);
var light = L.tileLayer(
  "https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
    "T6YbdDixkOBWH_k9GbS8JQ"
);
var dark = L.tileLayer(
  "https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
    "T6YbdDixkOBWH_k9GbS8JQ"
);

//Initialize the map
var myMap = L.map("map", {
  center: [40.52, 102.67],
  zoom: 4,
  layers: [light]
});

//Create the base maps
var baseMaps = {
  Light: light,
  Dark: dark,
  Mappy: mappy
};

// Links for our JSON data
var earthquakeLink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

var tectonicLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";


//Call this function to color earthquake markers
function colors(myMagnitude){
    if (myMagnitude < 1){
        return "#3cff22";
    }
    else if (myMagnitude < 2){
        return "#ceffba";
    }
    else if (myMagnitude < 3){
        return "#ffcc85";
    }
    else if (myMagnitude < 4){
        return "#ffa49c";
    }
    else {
        return "#ff4842";
    };
};

//An array which stores the earthquake markers
var earthquakeMarkers = [];

//Get the earthquake data, create markers and the legend
d3.json(earthquakeLink, function(data){
    for (i = 0; i < data.features.length; i++){
        earthquake = data.features[i];
        magnitude = earthquake.properties.mag;
        longitude = earthquake.geometry.coordinates[0];
        latitude = earthquake.geometry.coordinates[1];
        place = earthquake.properties.place;
        unixTime = new Date( earthquake.properties.time);
        earthquakeTime = unixTime.toDateString();
        //console.log(earthquakeTime);

        marker = L.circle([latitude, longitude],{
            color: colors(magnitude),
            fillColor:colors(magnitude),
            fillOpacity:"0.95",
            radius: 1*10**(magnitude),
            time: earthquakeTime
        });
        marker.bindPopup("Magnitude: " + magnitude + "</br> Location: " + place );
        earthquakeMarkers.push(marker);
    };
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map){
        var div = L.DomUtil.create("div", "info legend"),
        grades = [0, 1, 2, 3, 4],
        labels = [];

        //Loop through grades and generate a label with a colored square for each grade
        for (var i = 0; i < grades.length; i++){
            div.innerHTML += 
            '<i style = "background: ' + colors(grades[i] + 0.1) + '"></i> ' + 
            grades[i] + (grades[i+1] ? '&ndash;' + grades[i+1] + '<br>' : '+' );
        }
        return div;
    };
    legend.addTo(myMap);

    //An array which stores the tectonic plate boundaries
tectonicMarkers = [];
var plates = {};

//Get the tectonic plate tracings, and create the control layers
d3.json(tectonicLink, function(data){
    plates = L.geoJson(data, {
        //style isn't doing anything...
        stlye: function(feature){
            return {
                color: "orange",
                weight: 1.5
            };
        }
    });
    //Having to do all this stuff inside the d3 call is super awkward
    var earthquakeLayer = L.layerGroup(earthquakeMarkers);
    var sliderControl = L.control.sliderControl({layer: earthquakeLayer, follow: 10});
    myMap.addControl(sliderControl);
    sliderControl.startSlider();

    var overlayMaps = {
    Earthquakes: earthquakeLayer,
    Tectonics: plates
    };
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

});



});










