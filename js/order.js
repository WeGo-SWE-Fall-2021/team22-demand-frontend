$(function () {
    $("#orderButton").click(() => {
        let originLocation = $("#origin").val();
        let destinationLocation = $("#destination").val();

        let cloud = window.location.hostname.split('.')[0]

        let data = {
            'cloud': cloud,
            'originLocation': originLocation
            'destinationLocation': destinationLocation
        };

        fetch(`https://${cloud}.team22.sweispring21.tk/api/v1/common-services/order`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => {
            if (response.ok) {
                var result = response.json();
                print (result.message)
            }
    })
})
