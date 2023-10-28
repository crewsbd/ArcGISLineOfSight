// All the page elements we will need to use
const transmitterRadioButton = document.querySelector("#selector_t")
const transmitterLatitude = document.querySelector("#transmitter_latitude")
const transmitterLongitude = document.querySelector("#transmitter_longitude")
var transmitterAltitude = 0

const receiverRadioButton = document.querySelector("#selector_r")
const receiverLatitude = document.querySelector("#receiver_latitude")
const receiverLongitude = document.querySelector("#receiver_longitude")
var receiverAltitude = 0

var currentOption = "transmitter";
const checkLOSButton = document.querySelector("#checkLOS")

const lowerFrequency = document.querySelector("#range_lower")
const upperFrequency = document.querySelector("#range_upper")
const filterButton = document.querySelector("#filter_button")

require([  // There are all the ArcGIS libraries needed for the map
    "esri/config",
    "esri/geometry/Point",
    "esri/Map",
    "esri/views/MapView",
    "esri/views/SceneView",
    "esri/layers/FeatureLayer",
    "esri/widgets/LineOfSight",
    "esri/widgets/LineOfSight/LineOfSightViewModel",
    "esri/widgets/LineOfSight/LineOfSightTarget",
    "esri/views/3d/environment/FoggyWeather"
], function (esriConfig, Point, Map, MapView, SceneView, FeatureLayer, LineOfSight, LineOfSightViewModel, LineOfSightTarget, FoggyWeather) {

    esriConfig.apiKey = apiKey //Personal account

    // This is the feature layer that contains the repeaters.
    featureUrl = "https://services6.arcgis.com/thHY3L96DuwM72cK/arcgis/rest/services/bay_area_repeaters/FeatureServer/0";
    
    
    const stationRenderer = {  // This defines the icon style for stations
        "type": "simple",
        "symbol": {
            "type": "picture-marker",
            "url": "/images/RadioTower.svg",
            "width": "32px",
            "height": "32px"
        }
    };

    const stationLabels = { // This defines the text style for stations
        symbol: {
            type: "text",
            color: "#FFFFFF",
            haloColor: "#5E8D74",
            haloSize: "2px",
            font: {
                size: "12px",
                family: "Noto Sans",
                style: "italic",
                weight: "normal"
            }
        },

        labelPlacement: "above-center",
        labelExpressionInfo: {
            expression: "$feature.Name"
        }
    };
    const stationPopups = { // This defines the layout for popups
        "title": "Station",
        "content": "<b>Name:</b> {name}<br><b>Call sign:</b> {callsign}}<br><b>Frequency:</b> {frequency}<br><b>Tone:</b> {tone}"
      }
    
    const repeaterLayer = new FeatureLayer({ // This is the featureLayer that displays the stations
        title: "Bay Area Repeaters",
        url: featureUrl,
        renderer: stationRenderer,
        labelingInfo: [stationLabels],
        popupTemplate: stationPopups,
        copyright: "Brian Crews"
    });



    const map = new Map({  //This is the map. Must be assigned to a view
        basemap: "arcgis-topographic",
        ground: "world-elevation",
        //layers: [repeaterLayer],
    });

    const scene = new SceneView({  //This displays the map on screen in 3d
        map: map,
        container: "mapView",
        center: [-122.165594, 37.402998],
        zoom: 9,
        //extent: { //Another way to set the view
        // xmin: -118.98364,
        // ymin: 33.64236,
        // xmax: -117.50735,
        // ymax: 34.463889,
        //spatialReference: 4326
        //},
        // environment: {
        //     weather: {
        //         type: "foggy",
        //         fogStrength: .5
        //     }
        //}
    });

    map.add(repeaterLayer); // Add the repeater feature layer

    
    // This didn't work

    /** @type {LineOfSightViewModel} */
    const los = new LineOfSightViewModel({
        view: scene
    });



    scene.on("click", (context) => {  // If the map is clicked, update latitudes and longitudes
        if (currentOption == "transmitter") {
            currentOption = "receiver";
            receiverRadioButton.checked = true;
            transmitterLatitude.value = context.mapPoint.x / 1;
            transmitterLongitude.value = context.mapPoint.y / 1;
            transmitterAltitude = context.mapPoint.z;


        }
        else {
            currentOption = "transmitter"
            transmitterRadioButton.checked = true;
            receiverLatitude.value = context.mapPoint.x / 1;
            receiverLongitude.value = context.mapPoint.y / 1;
            receiverAltitude = context.mapPoint.z;
        }
        console.log(`sdf${context.mapPoint.z}`);

        console.log(`BLICK! ${context.mapPoint.x}`);

    });
    receiverRadioButton.addEventListener("click", () => { //User can change which station is used
        currentOption = "receiver";
        console.log("REC!")
    })

    transmitterRadioButton.addEventListener("click", () => {
        currentOption = "transmitter";
        console.log("TRAN!")
    })
    filterButton.addEventListener("click", () => {
        let upper = Number(upperFrequency.value)
        let lower = Number(lowerFrequency.value)
        const expression = [`Frequency > ${lower} AND Frequency < ${upper}`]
        repeaterLayer.definitionExpression = expression;
    })


    checkLOSButton.addEventListener("click", () => { //Calculate the line of sight
        console.log("LOS")

        console.log(los.status)
        los.start();
        console.log(los.state)
        los.observer = new Point({
            latitude: Number(transmitterLatitude.value) * 1,
            longitude: Number(transmitterLongitude.value) * 1,
            z: transmitterAltitude
        })


        los.targets = [new LineOfSightTarget({
            location: new Point({
                latitude: Number(receiverLatitude.value) * 1,
                longitude: Number(receiverLongitude.value) * 1,
                z: receiverAltitude
            })
        })]
        console.log(los);




        los.stop();
        console.log("LOS STOPPED")
        console.log
        // console.log(los.targets[0].visible);
        // los.stop();

    })





    async function sleep(time) { //Recursive sleep function. Not working
        function _sleep(millis) {
            return new Promise(resolve => setTimeout(resolve, millis));
        }
        await _sleep(1000);
    }



    // This is the widget. I want to use it behind the scenes.
    // const lineOfSight = new LineOfSight({
    //     view: scene
    // })
    // scene.ui.add(lineOfSight, {
    //     position: "bottom-left"
    // });




    // const view = new MapView({
    //     container: "mapView",
    //     map: map,
    // extent: {
    //     xmin: -118.98364,
    //     ymin: 33.64236,
    //     xmax: -117.50735,
    //     ymax: 34.463889,
    //     spatialReference: 4326
    // }

    // zoom: 12,
    // center: [-112.168, 32.776]
    // });

})

//Can this be hidden?
