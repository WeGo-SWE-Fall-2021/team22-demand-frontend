let startCoordinate = '-97.752987,30.229009';
let endCoordinate = '-97.741089,30.272759';
mapboxgl.accessToken = 'pk.eyJ1IjoibmRhbHRvbjEiLCJhIjoiY2tsNWlkMHBwMTlncDJwbGNuNzJ6OGo2ciJ9.QbcnC4OnBjZU6P6JN6m3Pw';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-97.7, 30.2], // starting view position
    zoom: 9 // starting zoom
    });
  // Initialize the start and end coordinates. This makes it easier for us if we
// want to change the coordinates
 var directionsAPICall = 'https://api.mapbox.com/directions/v5/mapbox/driving/'+startCoordinate+';'+endCoordinate+'?geometries=geojson&overview=full&steps=true&access_token='+mapboxgl.accessToken;
     var responseJSON = "";
     request.open("GET", directionsAPICall);
     request.send();
     request.onload = () => {
       console.log(request);
       if(request.status == 200)
       {
         responseJSON = JSON.parse(request.response);
         console.log(responseJSON["routes"][0]["geometry"]);
       }
       else{
         console.log("ERROR")
       }
var geojson =
{
    type: 'FeatureCollection',
    features: [{
        type: 'Feature',
        geometry:
        {
           type: 'Point',
           coordinates: startCoordinate
        },
        properties:
        {
           title: 'Mapbox',
           description: "Starting Location"
        }
       },
       {
         type: 'Feature',
         geometry:
         {
           type: 'Point',
           coordinates: endCoordinate
         },
         properties:
         {
           title: 'Mapbox',
           description: 'Destination Location'
         }
       }]
};
map.on('load', function ()
{
    map.addSource('route',
    {
        'type': 'geojson',
         'data':
         {
           'type': 'Feature',
           'properties': {},
           'geometry': responseJSON["routes"][0]["geometry"],
          }
    });
    map.addLayer({
         'id': 'route',
         'type': 'line',
         'source': 'route',
         'layout':
         {
           'line-join': 'round',
           'line-cap': 'round'
         },
         'paint':
         {
           'line-color': '#888',
           'line-width': 8
         }
    });
});
     // add markers to map
geojson.features.forEach(function(marker)
{
       // create a HTML element for each feature
    var el = document.createElement('div');
    el.className = 'marker';

       // make a marker for each feature and add to the map
    new mapboxgl.Marker(el)
    .setLngLat(marker.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
    .setHTML('<h3>' + marker.properties.title + '</h3><p>' + marker.properties.description + '</p>'))
    .addTo(map);
});
// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
