		var map;
		var tx_wells;
		var tx_minor_aquifers;
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
                map.add(graphicsLayer);

            var view = new MapView({
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
                    width: 1
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
                graphicsLayer.removeAll();
                var point = new Point({
                    longitude: event.mapPoint.longitude,
                    latitude: event.mapPoint.latitude
                });
                console.log(point)
                var inputGraphic = new Graphic({
                    geometry: point,
                    symbol: markerSymbol
                });
                graphicsLayer.add(inputGraphic);

                var inputGraphicContainer = [];
                inputGraphicContainer.push(inputGraphic);
                var featureSet = new FeatureSet();
                featureSet.features = inputGraphicContainer;

                var bfDistance = new LinearUnit();
                bfDistance.distance = 50;
                bfDistance.units = "miles";

                // input parameters
                var params = {
                    "Point": featureSet,
                    "Distance": bfDistance
                };
                console.log(featureSet);
                gp.submitJob(params).then(completeCallback, errBack, statusCallback);
                var job = gp_wells.submitJob(params);
                job.then(completeCallback_wells, errBack, statusCallback);

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
                map.layers.add(resultLayer);
            }

            function completeCallback_wells(result){
                gp_wells.getResultData(result.jobId, "intersect_wells_3857_shp").then(drawResult_wells, drawResultErrBack_wells);
            }

            function errBack(err) {
                console.log("gp error: ", err);
            }

            function errBack_wells(err) {
                console.log("gp error: ", err);
            }

            function statusCallback(data) {
                console.log(data.jobStatus);
            }

            function statusCallback_wells(data) {
                console.log(data.jobStatus);
            }

            function drawResult_wells(data){
                console.log("1111111111111111111111111")
                console.log(data)
                var wells_feature = data.value.features[0];
                console.log("222222222222")
                console.log(wells_feature)
                wells_feature.symbol = wellsSymbol;
                graphicsLayer.add(wells_feature);
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

		    });


		function showLayers(){
			wellLayer.visible=false;
			majorAquiferLayer.visible=false;
			minorAquiferLayer.visible=false;
			countyLayer.visible=false;

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