/* Global Variables */
let cloudURL = `https://wego.madebyerikb.com`

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const pluginName = urlParams.get('name');

// General main func once documents finished loading
$(() => {
    // Check if uri has valid parameters
    if (pluginName == '' || pluginName == null) {
        // Redirect to dashboard because order plugin is invalid
        window.location.replace('/demand/dashboard.html');
    } else {
        let name = pluginName.toLowerCase().replace('_', " ");
        name = name.charAt(0).toUpperCase() + name.slice(1) + " Order";
        $('#orderTitle').text(name)
        fetchPlugin(pluginName)
    }

    // This function checks to see if there is credentials saved. If so just direct them to the dashboard
    fetchLoggedInUser().then(response => {
        // Success getting user
        if (response.status == 200) {
            $("#usernameLabel").text(response.body.user.username);
            $('#firstName').val(response.body.user.firstName);
            $('#lastName').val(response.body.user.lastName);
            $('#phoneNumber').val(response.body.user.phoneNumber);
            $('#email').val(response.body.user.email);
        } else {
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
    fetch(`${cloudURL}/demand/api/plugins?name=${name}`, {
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
    $('#city').on('input', function() { validateString(charactersOnlyRegex, this) });
    $('#state').on('input', function() { validateString(charactersOnlyRegex, this) });
    $('#zipCode').on('input', function() { validateString(zipCodeRegex, this) });
    $('#cardholderName').on('input', function() { validateString(nameRegex, this) });
    $('#cardNumber').on('input', function() { validateString(stringEmpty, this) });
    $('#expiration').on('input', function() { validateString(stringEmpty, this) });
    $('#cvv').on('input', function() { validateString(stringEmpty, this) });

    $(document).on('click', '#orderButton', () => {
        $('#orderButtonSpinner').removeClass('d-none');
        $("#orderButton").prop('disabled', true).text("Submitting Order...")

        $('input').trigger('input');
		let errorVisible = $('.invalid-feedback:visible').length
		if (errorVisible !== 0) {
			console.log("There are currently errors in validation. User needs to fix those errors before proceeding.")
            $('#orderButtonSpinner').addClass('d-none');
            $("#orderButton").prop('disabled', false).text("Submit Order")    
            return
		}

        let cardType = $('#creditCardRadio').val() ? "CREDIT" : "DEBIT"
        let streetAddress = $('#streetAddress').val();
        let city = $('#city').val();
        let state = $('#state').val();
        let zipCode = $('#zipCode').val();

        if (streetAddress == ""){
            $('#orderButtonSpinner').addClass('d-none');
            $("#orderButton").prop('disabled', false).text("Submit Order");
            showAlert("You must have an address.");
            return
        }

        let completeAddress = `${streetAddress}, ${city}, ${state} ${zipCode}, United States`;

        let data = {
            'paymentType': cardType,
            'plugin': pluginName,
            'orderDestination': completeAddress,
            'items': []
        };

        fetch(`${cloudURL}/demand/api/order`, {
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
            console.log("Successfully created order! Order Id:" + data.orderId);
            window.location.replace(`/demand/success.html?orderId=${data.orderId}`);
        }).catch(error => {
            $('#orderButton').prop('disabled', false).text("Submit Order");
            // Handle error here
            console.error("There was an error with sending order: " + error);
            showAlert("There was an error sending order: " + error);
        });
    });
});

// Geocoder API
$(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibmRhbHRvbjEiLCJhIjoiY2tsNWlkMHBwMTlncDJwbGNuNzJ6OGo2ciJ9.QbcnC4OnBjZU6P6JN6m3Pw';
    var geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        countries: 'us',
        types: 'address'
    });

    geocoder.addTo('#geocoder');

    // Style search input
    $(".mapboxgl-ctrl-geocoder--input").addClass("form-control").removeClass('mapboxgl-ctrl-geocoder--input').attr('id', 'streetAddress');
    $('.mapboxgl-ctrl-geocoder--icon-search').addClass('d-none');
    let newIcon = $('<span class="input-group-text" id="basic-addon1"><i class="bi bi-search"></i></span>');
    $('.mapboxgl-ctrl-geocoder').addClass('input-group').prepend(newIcon)

    geocoder.on('result', function (data) {
        const result = data.result;
        let numberAddress = result.address;
        let address = numberAddress != undefined ? numberAddress + " " + result.text : result.text;
        $('#streetAddress').val(address);
        let context = result.context
        for (var i = 0; i < context.length; i++) {
            let property = context[i];
            let propertyText = property.text
            if (property.id.includes("place")) {
                $('#city').val(propertyText).trigger("input");
            } else if (property.id.includes("region")) {
                $('#state').val(propertyText).trigger("input");
            } else if (property.id.includes("postcode")) {
                $("#zipCode").val(propertyText).trigger("input");
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