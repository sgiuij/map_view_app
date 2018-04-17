var map;
var app;
var view;
var tx_wells;
var tx_minor_aquifers;
var selectedWellLayer;
var selectedBuffer;
var radius;
var radius_slider = document.getElementById("input_range");
var output = document.getElementById("radius_val");

output.innerHTML = radius_slider.value;
radius_slider.oninput = function() {
    output.innerHTML = this.value;
    radius = output.innerHTML;
}

require([
    "esri/Map",
    "esri/layers/GraphicsLayer",
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/tasks/Geoprocessor",
    "esri/tasks/support/LinearUnit",
    "esri/tasks/support/FeatureSet",
    "esri/views/MapView",
    "esri/layers/MapImageLayer",
    "esri/layers/FeatureLayer",
    "esri/layers/support/ImageParameters",
    "esri/widgets/Zoom",
    "dojo/domReady!"
    ], function(Map, GraphicsLayer, Graphic, Point, Geoprocessor, LinearUnit, FeatureSet, MapView, MapImageLayer, FeatureLayer, ImageParameters, Zoom){
    map = new Map({
        basemap: "streets"
    });

    var zoom = new Zoom({
      view: view
    });

    var graphicsLayer = new GraphicsLayer();
    var resultLayer = new MapImageLayer;

    view = new MapView({
        container:"map",
        map: map,
        center:[-98.8, 31.4],
        zoom:6
    })

    var markerSymbol = {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        color: [255, 0, 0],
        outline: { // autocasts as new SimpleLineSymbol()
            color: [255, 255, 255],
            width: 2
        }
    };

    var wellsSymbol = {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        color: [0,0,0],
        outline: { // autocasts as new SimpleLineSymbol()
            color: [169,169,169],
            width: 0.5
        }
    };

    var gpUrl = "http://geoserver2.byu.edu/arcgis/rest/services/UE_UW/uwinterp/GPServer/uwinterp";
    var gpUrl_wells = "http://geoserver2.byu.edu/arcgis/rest/services/UE_UW/uwinterp_wells2/GPServer/uwinterp_wells";

    // create a new Geoprocessor
    var gp = new Geoprocessor(gpUrl);
    var gp_wells = new Geoprocessor(gpUrl_wells);

    // define output spatial reference
    gp.outSpatialReference = { // autocasts as new SpatialReference()
        wkid: 102100 //EPSG3857
    };
    gp_wells.outSpatialReference = { // autocasts as new SpatialReference()
        wkid: 102100 //EPSG3857
    };

    view.on("click", bufferPoint);

    function bufferPoint(event) {
        cleanup();
        graphicsLayer.removeAll();
        map.add(graphicsLayer);
        var point = new Point({
            longitude: event.mapPoint.longitude,
            latitude: event.mapPoint.latitude
        });
        var inputGraphic = new Graphic({
            geometry: point,
            symbol: markerSymbol
        });

        view.center = point;
        view.zoom = 10.5-(radius_slider.value/25*1.5);
        graphicsLayer.add(inputGraphic);
        var inputGraphicContainer = [];
        inputGraphicContainer.push(inputGraphic);
        var featureSet = new FeatureSet();
        featureSet.features = inputGraphicContainer;

        var bfDistance = new LinearUnit();
        bfDistance.distance = radius;
        bfDistance.units = "miles";

        var params = {
            "Point": featureSet,
            "Distance": bfDistance
        };
        gp.submitJob(params).then(completeCallback, errBack, statusCallback);

        gp_wells.submitJob(params).then(completeCallback_wells, errBack_wells, statusCallback_wells);
        if (document.getElementById("waterlevel_layer").checked){
            test(true);
        }else{
            test(false);
        }
    }

        function cleanup() {
      // remove the geoprocessing result layer from the map
             map.layers.forEach(function(layer, i) {
             if (layer.title === "surface") {
          map.layers.remove(layer);
        }
      });
    }

    function completeCallback(result){
        //set imageParameters
        var imageParams = new ImageParameters({
            format: "png32",
            dpi: 300
        });
        // get the task result as a MapImageLayer
        resultLayer = gp.getResultMapImageLayer(result.jobId);
        resultLayer.opacity = 0.7;
        resultLayer.title = "surface";
        // add the result layer to the map
        console.log("resultLayer")
        console.log(resultLayer)
        map.layers.add(resultLayer);
        resultLayer.visible = false;
        if (document.getElementById("waterlevel_layer").checked){
//				selectedBuffer = true;
            resultLayer.visible = true;
        }
    }

    function completeCallback_wells(result){
        gp_wells.getResultData(result.jobId, "intersect_wells_3857_shp").then(drawResult_wells, drawResultErrBack_wells);
    }

    function errBack(err) {
        console.log("gp error: ", err);
        document.getElementById("processing_display").innerHTML="<h5>something went wrong, try a different point or smaller radius</h5>"
    }

    function errBack_wells(err) {
        console.log("gp error: ", err);
        document.getElementById("processing_display").innerHTML="<h5>something went wrong, try a different point or smaller radius</h5>"
    }

    function statusCallback(data) {
        if (data.jobStatus==="job-submitted"){
            document.getElementById("processing_display").innerHTML="<img src=\'/static/simple_app/images/loading.gif\'>"
        }
        if (data.jobStatus==="job-succeeded"){
            document.getElementById("processing_display").innerHTML=""
        }
    }

    function statusCallback_wells(data) {
        if (data.jobStatus==="job-submitted"){
//            document.getElementById("low_well").innerHTML="16";

            document.getElementById("well_bar_label").innerHTML="<span id=\"low_well\">16</span>"+
                                                                    "<div id=\"space\"></div>"+
                                                                    "<span id=\"high_well\">4240</span>";
            document.getElementById("processing_display").innerHTML="<img src=\'/static/simple_app/images/loading.gif\'>";
//            document.getElementById("high_well").innerHTML="4240";
        }
        if (data.jobStatus==="job-succeeded"){
            document.getElementById("processing_display").innerHTML=""
        }
    }

    function drawResult_wells(data){
        var wells_feature = data.value.features;
        graphicsLayer.visible = false;
        for (wells in wells_feature){
            wells_feature[wells].symbol = wellsSymbol;
            graphicsLayer.add(wells_feature[wells]);
            if (document.getElementById("points_layer").checked){
                graphicsLayer.visible = true;
                console.log("babycheck")
            }
        }
    }

    function drawResultErrBack_wells(err) {
        console.log("draw result errorb: ", err);
    }

    view.on("pointer-move", eventHandler);
    function eventHandler(event) {
        // the hitTest() checks to see if any graphics in the view
        // intersect the given screen x, y coordinate
        view.hitTest(event)
          .then(getGraphics);
      }

    function getGraphics(response) {
        if (response.results.length) {
        var graphic = response.results[0].graphic;
            var attributes = graphic.attributes;
            var well_depth = attributes.WellDepth;
            console.log(well_depth)
            document.getElementById('buffer_pointer').innerHTML="<p>"+well_depth+"</p>"

        }
        console.log(graphicsLayer)
          console.log(highlight_marker)
          console.log("333333333")
//        var highlight_marker = {
//            type: "unique-value", // autocasts as new UniqueValueRenderer()
//            field: "NAME",
//            defaultSymbol: graphicsLayer.renderer.symbol ||
//              graphicsLayer.renderer.defaultSymbol,
//            uniqueValueInfos: [{
//              value: name,
//              symbol: {
//                type: "simple-marker", // autocasts as new SimpleLineSymbol()
//                color: "orange",
//                width: 0.5,
//              }
//            }]
//          };

        graphicsLayer.renderer = highlight_marker;
    }

      // Reference the popupTemplate instance in the
      // popupTemplate property of FeatureLayer

     wellLayer = new FeatureLayer({
        url: "http://geoserver2.byu.edu/arcgis/rest/services/UE_UW/tx_maps/FeatureServer/3",
        outFields: ["*"],
//        popupTemplate: template,
        visible:false
      });
     majorAquiferLayer = new FeatureLayer({
        url: "http://geoserver2.byu.edu/arcgis/rest/services/UE_UW/tx_maps/FeatureServer/0",
        outFields: ["*"],
//        popupTemplate: template,
        visible:false
      });
     minorAquiferLayer = new FeatureLayer({
        url: "http://geoserver2.byu.edu/arcgis/rest/services/UE_UW/tx_maps/FeatureServer/1",
        outFields: ["*"],
//        popupTemplate: template,
        visible:false
      });
     countyLayer = new FeatureLayer({
        url: "http://geoserver2.byu.edu/arcgis/rest/services/UE_UW/tx_maps/FeatureServer/2",
        outFields: ["*"],
//        popupTemplate: template,
        visible:false
      });
      map.add(wellLayer);
      map.add(majorAquiferLayer);
      map.add(minorAquiferLayer);
      map.add(countyLayer);

      app = {
        "view": view,
        "bufferPoint": bufferPoint,
        "graphicsLayer":graphicsLayer,
        "resultLayer": resultLayer
      }
    });

//function depthPointer(){
//    $(document).ready(function() {
//       var scale = false;
//        $("#wel1").click(function() {
//          if (!sideMenu) {
//            $("#sidemenu").animate({left: "80px"});
//            sideMenu = true;
//          }
//          else {
//            $("#sidemenu").animate({left: "0px"});
//            sideMenu = false;
//          }
//        });
//    });
//}

function test(bool){
    if (bool===true){
        document.getElementById("depth_div").innerHTML="<div id=\"well_bar_label\"></div>"+
                "<div id=\"atr_table\"></div>"+"<div id=\"buffer_pointer\"></div>";
        document.getElementById("atr_table").innerHTML="<img src=\'/static/simple_app/images/fat_kk.jpg\' id=\'legend\'>";
        document.getElementById("well_bar_label").innerHTML+="<span id=\"low_well\">16</span>"+
                                                                    "<div id=\"space\"></div>"+
                                                                    "<span id=\"high_well\">4240</span>";
    }else{
        document.getElementById("depth_div").innerHTML="";
        document.getElementById("atr_table").innerHTML="";
    }
}

function visibilityButton(bool){
    var item = "_items";
    var imgformat = 'imageFormat';
    var kk = map.layers[item]
    console.log(kk)
    for ( k in map.layers[item]){
        if (imgformat in map.layers[item][k]){
            map.layers[item][k]['visible']=bool;
        }
    }
    test(bool);
}

function showLayers(){
    wellLayer.visible=false;
    majorAquiferLayer.visible=false;
    minorAquiferLayer.visible=false;
    countyLayer.visible=false;
    app.graphicsLayer.visible = false;
    app.resultLayer.visible = false;

    if (document.getElementById("points_layer").checked){
        app.graphicsLayer.visible = true;
    }
    if (document.getElementById("waterlevel_layer").checked){
        visibilityButton(true);
//        app.resultLayer.visible = true;
    }else{
        visibilityButton(false);
    }

    if (document.getElementById("wellLayer").checked){
        wellLayer.visible=true;
    }
    if (document.getElementById("majorAquiferLayer").checked){
        majorAquiferLayer.visible=true;
    }
    if (document.getElementById("minorAquiferLayer").checked){
        minorAquiferLayer.visible=true;
    }
    if (document.getElementById("countyLayer").checked){
        countyLayer.visible=true;
    }
}

function removeAll(){
    app.graphicsLayer.removeAll();

    var item = "_items";
    var imgformat = 'imageFormat';
    var kk = map.layers[item]
    console.log(kk)
    for ( k in map.layers[item]){
        if (imgformat in map.layers[item][k]){
            delete map.layers[item][k]
        }
    }
}