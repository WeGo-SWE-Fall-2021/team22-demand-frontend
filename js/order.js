$(function () {
    $("#orderButton").click(() => {
        let originLocation = $("#origin").val();
        let destinationLocation = $("#destination").val();

        let cloud = window.location.hostname.split('.')[0]

        let data = {
            'cloud': cloud,
            'originLocation': originLocation,
            'destinationLocation': destinationLocation
        };

        fetch(`https://${cloud}.team22.sweispring21.tk/api/v1/demand/order`, {
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
        }).catch(error => {
            // Handle error here
        })
    })
})
