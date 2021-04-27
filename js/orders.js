/* Global Variables */
let cloud = window.location.hostname.split('.')[0]
let cloudURL = `https://${cloud}.team22.sweispring21.tk`
var intervalVehicleUpdate = undefined;

// General main func once documents finished loading
$(() => {
    var map = new mapboxgl.Map({
        container: 'orderMap', // container id
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        zoom: 9 // starting zoom
    });

    // This function checks to see if there is credentials saved. If so just direct them to the dashboard
    fetchLoggedInUser(cloud).then(response => {
        // Success getting user
        if (response.status == 200) {
            $("#usernameLabel").text(response.body["username"]);
        } else {
            // Failed to get user with token
            // window.location.replace(cloudURL)
        }
    }).catch(error => {
        // Error fetching
        // showAlert("There was an error getting user information.")
        console.error("Error fetching: " + error)
        hideAlert();
    });

    // Fetch orders
    fetch("https://demand.team22.sweispring21.tk/api/v1/demand/orders", {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
        return Promise.reject(response)
    }).then(json => {
        let orders = json.orders;
        populateTable(orders);
    }).catch(err => {
        console.error(err);
    });

    // Handle click events on table rows
    $("#ordersTable tbody").on("click", "tr", function () {
        let tableRow = $(this);
        let tableDataObjectId = tableRow.find(".orderId");
        let orderId = tableDataObjectId.text();
        getOrderDetails(orderId, map);
    });
});

async function getOrderDetails(orderId, map) {
    if (intervalVehicleUpdate != undefined) {
        intervalVehicleUpdate = clearInterval(intervalVehicleUpdate);
    }

    const response = await fetch(`https://demand.team22.sweispring21.tk/api/v1/demand/orders?orderId=${orderId}`);
    if (!response.ok) {
        console.error("There was an error fetching order. Error: " + response.status + " Body: " + response.text());
        showAlert("Could not show order information for: " + orderId)
    }

    // Was able to retreive data, check if we need to do a live update if vehicle has not delivered
    let data = await response.json();
    if (data.orders.length == 0) {
        console.error("There was an error fetching order.")
        showAlert("Could not show order information for: " + orderId)
    }

    let order = data.orders[0];
    showNewOrderDetails(order, map);
    // Create vehicle update
    intervalVehicleUpdate = setInterval(async function () {
        const response = await fetch(`https://demand.team22.sweispring21.tk/api/v1/demand/orders?orderId=${orderId}`);
        if (!response.ok) {
            console.error("There was an error fetching order. Status: " + response.status)
            showAlert("Could not show order information for: " + orderId)
            return
        }

        let data = await response.json();
        if (data.orders.length == 0) {
            console.error("There was an error fetching order.")
            showAlert("Could not show order information for: " + orderId)
        }
        let order = data.orders[0];
        showNewOrderDetails(order, map)
    }, 5000);
}

function showNewOrderDetails(order, map) {
    $('#orderId').text(order.orderId);
    $('#orderName').text(formatCapsWordToStandard(order.plugin));
    $('#shippingAddress').text(order.orderDestination);
    $('#paymentType').text(formatCapsWordToStandard(order.paymentType));
    $('#status').text(formatCapsWordToStandard(order.orderStatus));
    $('#eta').text(order.eta + " minutes");

    if (order.orderStatus == "DELIVERED") {
        $('#eta').addClass("d-none");
        var geojson = {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: order.destinationCoordinate
                },
                properties: {
                    title: 'Mapbox',
                    description: 'Destination Location'
                }
            }]
        };

        geojson.features.forEach(function (marker) {
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
        map.addControl(new mapboxgl.NavigationControl());
    } else {
        $('#eta').removeClass("d-none");
        var geojson = {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: order.dock
                },
                properties: {
                    title: 'Mapbox',
                    description: "Starting Location"
                }
            }, {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: order.destinationCoordinate
                },
                properties: {
                    title: 'Mapbox',
                    description: 'Destination Location'
                }
            }]
        };

        if (map.getSource('route')) {
            map.removeLayer('route')
            map.removeSource('route')
        }

        map.on('load', function () {
            map.addSource('route', {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': order.geometry,
                }
            });
            map.addLayer({
                'id': 'route',
                'type': 'line',
                'source': 'route',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': '#888',
                    'line-width': 8
                }
            });
        });

        geojson.features.forEach(function (marker) {
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
        map.addControl(new mapboxgl.NavigationControl());
    }

    $('#orderDetails').remove('d-none');
}

function populateTable(orders) {
    var dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    let tBody = $("#ordersTable > tbody");
    tBody.empty();
    $.each(orders, (index, order) => {
        let idShort = order.orderId.slice(0, 7)
        let formattedDate = new Date(order.timeStamp + "Z").toLocaleDateString("en-US", dateOptions);
        let pluginName = formatCapsWordToStandard(order.plugin);
        let status = formatCapsWordToStandard(order.orderStatus);
        let element = `<tr>` +
            `<td>${idShort}</td>` +
            `<td class="d-none orderId">${order.orderId}</td>` +
            `<td>${formattedDate}</td>` +
            `<td>${pluginName}</td>` +
            `<td>${status}</td>` +
            `</td>`;
        tBody.append(element)
    });
}

function formatCapsWordToStandard(text) {
    return text.charAt(0) + text.toLowerCase().slice(1)
}