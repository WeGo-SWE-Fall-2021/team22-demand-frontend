/* Global Variables */
let cloud = window.location.hostname.split('.')[0]
let cloudURL = `https://${cloud}.team22.sweispring21.tk`
var intervalVehicleUpdate = undefined;

var orders = [];
let mapMarkers = []

mapboxgl.accessToken = 'pk.eyJ1IjoibmRhbHRvbjEiLCJhIjoiY2tsNWlkMHBwMTlncDJwbGNuNzJ6OGo2ciJ9.QbcnC4OnBjZU6P6JN6m3Pw';

let map = new mapboxgl.Map({
    container: 'orderMap', // container id
    style: 'mapbox://styles/mapbox/streets-v11',// style URL
    center: [0, 0],
    zoom: 9 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

// General main func once documents finished loading
$(() => {
    // This function checks to see if there is credentials saved. If so just direct them to the dashboard
    fetchLoggedInUser(cloud).then(response => {
        // Success getting user
        if (response.status == 200) {
            $("#usernameLabel").text(response.body.user.username);
        } else {
            // Failed to get user with token
            window.location.replace(cloudURL + "/login.html")
        }
    }).catch(error => {
        console.error("Error fetching: " + error)
        showAlert("There was an error getting user information.")
    });

    fetchOrders();

    // Handle click events on table rows
    $("#ordersTable tbody").on("click", "tr", function () {
        let tableRow = $(this);
        let tableDataObjectId = tableRow.find(".orderId");
        let orderId = tableDataObjectId.text();

        updateOrderDetails(orderId);
    });
});

function fetchOrders() {
    $('#spinner').removeClass('d-none');
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
        orders = json.orders;
        populateTable();
        updateOrderDetails(undefined);
        $('#spinner').addClass('d-none');
    }).catch(err => {
        orders = [];
        $('#noOrdersAvailabeText').removeClass('d-none')
        console.error(err);
        $('#spinner').addClass('d-none');
    });

    // We should use set Timeout rather than setInterval due to if it takes a while longer to get data, we can wait
    setTimeout(fetchOrders, 5000);
}

function updateOrderDetails(orderIdClicked) {
    if (orders == null || orders == {} || orders == undefined) {
        return
    }

    let orderId = orderIdClicked == undefined ? $("#orderId").text() : orderIdClicked;

    if (orderId == null || orderId == "" || orderId == undefined) {
        return
    }

    order = undefined;
    for (var i = 0; i < orders.length; i++) {
        if (orders[i].orderId == orderId) {
            order = orders[i];
            break
        }
    }

    if (order == undefined) {
        $("#orderDetails").parent().addClass("d-none")
        return
    }

    $('#orderId').text(order.orderId);
    $('#orderName').text(formatCapsWordToStandard(order.plugin));
    $('#shippingAddress').text(order.orderDestination);
    $('#paymentType').text(formatCapsWordToStandard(order.paymentType));
    $('#status').text(formatCapsWordToStandard(order.orderStatus));
    $('#eta').text(order.eta + " minutes");
    $("#items").parent().addClass('d-none')
    $("#items").text("");

    if (order["items"] !== undefined && order.items.length != 0) {
        try {
            $("#items").text(string);
            $("#items").parent().removeClass('d-none')
        } catch(e) {
            console.error("Could not parse json items: " + e)
        }
    }

    // Remove route
    if (map.getLayer('route') != undefined) {
        map.removeLayer('route');
    }

    if (map.getSource('route') != undefined) {
        map.removeSource('route');
    }

    if (map.getLayer('vehiclePoint') != undefined) {
        map.removeLayer('vehiclePoint');
    }

    if (map.getSource('vehicleLocation') != undefined) {
        map.removeSource('vehicleLocation');
    }

    mapMarkers.forEach((marker) => { marker.remove(); })
    mapMarkers = []

    if (order.orderStatus != "PROCESSING" && order.orderStatus != "ERROR") {
        var geojson = {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: adjust_coordinate(order.destinationCoordinate)
                },
                properties: {
                    title: 'WeGo',
                    description: 'Destination Location'
                }
            }]
        };

        if (order.orderStatus == "DELIVERED") {
            if ($("#orderId").text() == orderId) {
                map.flyTo({
                    center: adjust_coordinate(order.destinationCoordinate),
                    zoom: 15
                });
            }
            $('#eta').parent().parent().addClass("d-none");
        } else {
            geojson.features.push({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: adjust_coordinate(order.dock)
                },
                properties: {
                    title: 'WeGo',
                    description: "Starting Location"
                }
            });

            if (map.loaded()) {
                loadVehicleRoute(order.vehicleLocation, order.geometry)
            } else {
                map.on('load', loadVehicleRoute(order.vehicleLocation, order.geometry));
            }

            if ($("#orderId").text() == orderId) {
                map.flyTo({
                    center: adjust_coordinate(order.vehicleLocation),
                    zoom: 12
                });
            }
            $('#orderMap').parent().removeClass('d-none');
            $('#eta').parent().parent().removeClass("d-none");
        }

        geojson.features.forEach((marker) => {
            // create a HTML element for each feature
            var el = document.createElement('div');
            el.className = 'marker';

            // make a marker for each feature and add to the map
            mapMarkers.push(new mapboxgl.Marker(el)
                .setLngLat(marker.geometry.coordinates)
                .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
                    .setHTML('<h3>' + marker.properties.title + '</h3><p>' + marker.properties.description + '</p>'))
                .addTo(map));
        });
    } else {
        $('#orderMap').parent().addClass('d-none');
        $('#eta').parent().parent().addClass("d-none");
    }

    $("#orderDetails").parent().removeClass("d-none");

    if ($("#orderId").text() == orderId) {
        $("html").animate({
            scrollTop: $("#orderDetails").offset().top
        }, 800);
    }
}

function populateTable() {
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

    if (orders.length == 0) {
        $('#noOrdersAvailabeText').removeClass('d-none')
    } else {
        $('#noOrdersAvailabeText').addClass('d-none')
    }
}

function formatCapsWordToStandard(text) {
    return text.charAt(0) + text.toLowerCase().slice(1)
}

function adjust_coordinate(loc) {
    var array_strings = loc.split(",");
    var array_floats = [parseFloat(array_strings[0]), parseFloat(array_strings[1])];
    return array_floats;
}

function loadVehicleRoute(vehicleLocation, geometry) {
    map.loadImage('https://cdn3.iconfinder.com/data/icons/transport-02-set-of-vehicles-and-cars/110/Vehicles_and_cars_12-512.png', (error, image) => {
        if (error) throw error;

        // Add the image to the map style.
        map.addImage('vehicle', image);

        // Add a data source containing one point feature.
        map.addSource('vehicleLocation', {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': [{
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': adjust_coordinate(vehicleLocation)
                    }
                }]
            }
        });

        // Add a layer to use the image to represent the data.

        map.addLayer({
            'id': 'vehiclePoint',
            'type': 'symbol',
            'source': 'vehicleLocation', // reference the data source
            'layout': {
                'icon-image': 'vehicle', // reference the image
                'icon-size': 0.25
            }
        });    
    });

    // Add route
    map.addSource('route', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': geometry,
        }
    });

    // Add line route style
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
}