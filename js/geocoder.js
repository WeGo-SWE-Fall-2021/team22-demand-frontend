mapboxgl.accessToken = 'pk.eyJ1IjoibmRhbHRvbjEiLCJhIjoiY2tsNWlkMHBwMTlncDJwbGNuNzJ6OGo2ciJ9.QbcnC4OnBjZU6P6JN6m3Pw';
var geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  types: 'address'
});

geocoder.addTo('#geocoder');

// Get the geocoder results container.
//var results = document.getElementById('result');
var order_destination = "";
// Add geocoder result to container.
geocoder.on('result', function (e)
{
  //results.innerText = JSON.stringify(e.result, null, 2);
  order_destination = e.result["place_name"];
  console.log(order_destination);
});

// Clear results container when search is cleared.
geocoder.on('clear', function ()
{
  //results.innerText = '';
  order_destination = "";
  console.log(order_destination);
});
