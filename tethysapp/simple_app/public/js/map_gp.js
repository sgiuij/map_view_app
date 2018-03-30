		var map;
		var app;
		var view;
		var tx_wells;
		var tx_minor_aquifers;
		var selectedWellLayer;
		var radius;
		var radius_slider = document.getElementById("input_range");
        var output = document.getElementById("radius_val");
        var result = document.getElementById("points_layer").checked;
        console.log(result)

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
			"dojo/domReady!"
			], function(Map, GraphicsLayer, Graphic, Point, Geoprocessor, LinearUnit, FeatureSet, MapView, MapImageLayer, FeatureLayer, ImageParameters){
				map = new Map({
					basemap: "streets"
				});

				var graphicsLayer = new GraphicsLayer();


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

//            function removeBufferredLayers(){
//                var item = "_items";
//                var sublayerhandles = "postscript";
//                var kk = map.layers[item]
//                console.log(kk)
//
//                for ( k in map.layers[item]){
//                console.log(k)
//                console.log(map.layers[item][k])
//                console.log(typeof map.layers[item][k])
//                console.log(Object.keys(map.layers[item][k]))
//                console.log(map.layers[item][k].hasOwnProperty(sublayerhandles))
//                    if (sublayerhandles in map.layers[item][k]){
//                        console.log('sdfasdfasdfasd')
//                        console.log(map.layers[item][sublayerhandles])
//                        if (map.layers[item][sublayerhandles].length==2){
//                            delete map.layers[k]
//                            console.log(map.layers)
//                        }
//                    }
//                }
//            }
            function bufferPoint(event) {
//                graphicsLayer.removeAll();
                map.add(graphicsLayer);
                var point = new Point({
                    longitude: event.mapPoint.longitude,
                    latitude: event.mapPoint.latitude
                });
                var inputGraphic = new Graphic({
                    geometry: point,
                    symbol: markerSymbol
                });
                graphicsLayer.add(inputGraphic);
                if (selectedWellLayer===false){
//                    graphicsLayer.visible = false;
                }
//                if (selectedWellLayer){}

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
                if (selectedWellLayer===true){
                    gp.submitJob(params).then(completeCallback, errBack, statusCallback);
                }
                if (selectedBuffer===true){
                    gp_wells.submitJob(params).then(completeCallback_wells, errBack_wells, statusCallback_wells);
                }
            }

            function completeCallback(result){
                //set imageParameters
                var imageParams = new ImageParameters({
                    format: "png32",
                    dpi: 300
                });
                // get the task result as a MapImageLayer
                var resultLayer = gp.getResultMapImageLayer(result.jobId);
                resultLayer.opacity = 0.7;
                resultLayer.title = "surface";
                // add the result layer to the map
                var text = map.layers;
                console.log(text)
                map.layers.add(resultLayer);
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
                console.log(data.jobStatus);
                if (data.jobStatus==="job-submitted"){
                    document.getElementById("processing_display").innerHTML="<img src=\'/static/simple_app/images/loading.gif\'>"
                }
                if (data.jobStatus==="job-succeeded"){
                    document.getElementById("processing_display").innerHTML=""
                }
            }

            function statusCallback_wells(data) {

                console.log(typeof data.jobStatus);
                if (data.jobStatus==="job-submitted"){
                    document.getElementById("processing_display").innerHTML="<img src=\'/static/simple_app/images/loading.gif\'>"
                }
                if (data.jobStatus==="job-succeeded"){
                    document.getElementById("processing_display").innerHTML=""
                }
            }

            function drawResult_wells(data){
                var wells_feature = data.value.features;
                for (wells in wells_feature){
                    wells_feature[wells].symbol = wellsSymbol;
                    graphicsLayer.add(wells_feature[wells]);
                }
            }

            function drawResultErrBack_wells(err) {
                console.log("draw result errorb: ", err);
            }


			var template = { // autocasts as new PopupTemplate()
		        title: "Marriage in NY, Zip Code: {name}+{stateplane}+{pop_lastce}",
		        content: "<p>As of 2015, <b>ee%</b> of the population in this zip code is married.</p>" +
		          "<ul><li>ee people are married</li>" +
		          "<li>ee have never married</li>" +
		          "<li>ee are divorced</li></ul>",
		        fieldInfos: [{
		          fieldName: "name",
		          format: {
		            digitSeparator: true, // Use a comma separator for large numbers
		            places: 0 // Sets the number of decimal places to 0 and rounds up
		          }
		        }, {
		          fieldName: "stateplane",
		          format: {
		            digitSeparator: true,
		            places: 0
		          }
		        }, {
		          fieldName: "pop_lastce",
		          format: {
		            digitSeparator: true,
		            places: 0
		          }
		        }]
		      };

		      // Reference the popupTemplate instance in the
		      // popupTemplate property of FeatureLayer

		      wellLayer = new FeatureLayer({
		        url: "http://geoserver2.byu.edu/arcgis/rest/services/UE_UW/tx_maps/FeatureServer/3",
		        outFields: ["*"],
		        popupTemplate: template,
		        visible:false
		      });
		      majorAquiferLayer = new FeatureLayer({
		        url: "http://geoserver2.byu.edu/arcgis/rest/services/UE_UW/tx_maps/FeatureServer/0",
		        outFields: ["*"],
		        popupTemplate: template,
		        visible:false
		      });
		      minorAquiferLayer = new FeatureLayer({
		        url: "http://geoserver2.byu.edu/arcgis/rest/services/UE_UW/tx_maps/FeatureServer/1",
		        outFields: ["*"],
		        popupTemplate: template,
		        visible:false
		      });
		      countyLayer = new FeatureLayer({
		        url: "http://geoserver2.byu.edu/arcgis/rest/services/UE_UW/tx_maps/FeatureServer/2",
		        outFields: ["*"],
		        popupTemplate: template,
		        visible:false
		      });
		      map.add(wellLayer);
		      map.add(majorAquiferLayer);
		      map.add(minorAquiferLayer);
		      map.add(countyLayer);

		      app = {
		        "view": view,
		        "bufferPoint": bufferPoint,
		        "graphicsLayer":graphicsLayer
		      }

		    });


		function showLayers(){
			wellLayer.visible=false;
			majorAquiferLayer.visible=false;
			minorAquiferLayer.visible=false;
			countyLayer.visible=false;
			selectedWellLayer = false;
			selectedBuffer = false;

            if (document.getElementById("points_layer").checked){
				selectedWellLayer = true;
			}
			if (document.getElementById("waterlevel_layer").checked){
				selectedBuffer = true;
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
		    map.layers.removeAll();
		    app.graphicsLayer.removeAll();
		}