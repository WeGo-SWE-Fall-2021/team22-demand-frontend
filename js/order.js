/* Global Variables */
let cloud = window.location.hostname.split('.')[0]
let cloudURL = `https://${cloud}.team22.sweispring21.tk`

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const pluginName = urlParams.get('name');

mapboxgl.accessToken = 'pk.eyJ1IjoibmRhbHRvbjEiLCJhIjoiY2tsNWlkMHBwMTlncDJwbGNuNzJ6OGo2ciJ9.QbcnC4OnBjZU6P6JN6m3Pw';

// General main func once documents finished loading
$(() => {
    // Check if uri has valid parameters
    if (pluginName == '' || pluginName == null) {
        // Redirect to dashboard because order plugin is invalid
        window.location.replace(cloudURL + '/demand-front-end/dashboard.html');
    } else {
        let name = pluginName.toLowerCase().replace('_', " ");
        name = name.charAt(0).toUpperCase() + name.slice(1) + " Order";
        $('#orderTitle').text(name)
        fetchPlugin(pluginName)
    }

    // This function checks to see if there is credentials saved. If so just direct them to the dashboard
    fetchLoggedInUser(cloud).then(response => {
        // Success getting user
        if (response.status == 200) {
            $("#usernameLabel").text(response.body.user.username);
            $('#firstName').text(response.body.user.firstName);
            $('#lastName').text(response.body.user.lastName);
            $('#phoneNumber').text(response.body.user.phoneNumber);
            $('#email').text(response.body.user.email);
        } else {
            console.log("Was unable to get user using cookies.")
            // Failed to get user with token, route them back to login
            window.location.replace(cloudURL + '/login.html')
        }
    }).catch(error => {
        // Error fetching
        console.error("Error fetching: " + error)
        showAlert("There was an error getting user information.")
    });
});

async function fetchPlugin(name) {
    fetch(`https://demand.team22.sweispring21.tk/api/v1/demand/plugins?name=${name}`, {
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
        let plugin = json.plugin
        let name = plugin.name.toLowerCase().replace('_', ' ');
        let pluginName = name.charAt(0).toUpperCase() + name.slice(1);
        // TODO add extra options based on order
    }).catch(error => {
        console.error("Error: error fetching plugin.")
        showAlert("There was an error getting plugin: " + error)
    });
}

// Button on click handler
$(() => {
    $("#orderButton").click(() => {
        showSpinner();
        let cardType = $('#creditCardRadio').val() ? "CREDIT_CARD" : "DEBIT_CARD"
        let streetAddress = $('.mapboxgl-ctrl-geocoder--input').val();
        let city = $('#city').val();
        let state = $('#state').val();
        let zipCode = $('#zipCode').val();
        let completeAddress = `${streetAddress} ${city} ${state} ${zipCode}`;

        if (city == "" | state == "" | zipCode == "" | streetAddress == "") {
            console.log("Fields cannot be empty")
            stopSpinner();
            return;
        }

        let data = {
            'cloud': cloud,
            'paymentType': cardType,
            'plugin': pluginName,
            'destinationLocation': completeAddress,
            'items': []
        };

        fetch(`https://demand.team22.sweispring21.tk/api/v1/demand/order`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response)
        }).then(data => {
            console.log(data)
            alert("Successfully created order! Tracking Number:" + data.tracking)
        }).catch(error => {
            stopSpinner();
            // Handle error here
            console.error("There was an error with sending order: " + error);
            showAlert("There was an error sending order: " + error);
        })
    })
});

// Geocoder API
$(() => {
    var geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        types: 'address'
    });

    geocoder.addTo('#geocoder');

    geocoder.on('result', function (data) {
        const result = data.result;
        let address = result.address + " " + result.text
        $('.mapboxgl-ctrl-geocoder--input').val(address);
        let context = result.context
        for (var i = 0; i < context.length; i++) {
            let property = context[i];
            let propertyText = property.text
            if (property.id.includes("place")) {
                $('#city').val(propertyText);
            } else if (property.id.includes("region")) {
                $('#state').val(propertyText);
            } else if (property.id.includes("postcode")) {
                $("#zipCode").val(propertyText);
            }
        }
    })

    geocoder.on('clear', function () {
        $('.mapboxgl-ctrl-geocoder--input').val("");
        $('#city').val("");
        $('#state').val("");
        $('#zipCode').val("");
    });
});

function showSpinner() {
    $("#spinner").removeClass('d-none');
}

function hideSpinner() {
    $("#spinner").addClass('d-none');
}

function showAlert(text) {
    $("#main").removeClass('nav-height-padding').addClass('alert-height-with-nav-padding');
    $("#mainAlert").removeClass('d-none').text(text);
}

function hideAlert(text) {
    $("#main").addClass('nav-height-padding').removeClass('alert-height-with-nav-padding');
    $("#mainAlert").removeClass('d-none').text(text);
}

