let cloud = window.location.hostname.split('.')[0]
let cloudURL = `https://${cloud}.team22.sweispring21.tk`

$(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const orderId = urlParams.get('orderId');

    if (orderId == undefined) {
        window.location.replace('./dashboard.html');
    }

    fetchLoggedInUser(cloud).then(response => {
        if (response.status == 200) {
            $("#usernameLabel").text(response.body.user.username);
            $("#orderId").text(orderId)
        } else {
            // Failed to get user with token, route them back to login
            window.location.replace('../login.html')
        }
    }).catch(error => {
        if (error.status != undefined) {
            if (error.status == 401) {
                console.error("You need to be authenticated before proceeding");
                window.location.replace('../login.html');
            } else {
                console.error("Error fetching: " + error)
                showAlert("There was an error communicating with the server.");  
            }
        }
    });
});