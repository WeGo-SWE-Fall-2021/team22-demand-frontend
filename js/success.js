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
            if (error.status == 502) {
                console.error("Error fetching: " + error)
                showAlert("There was an error communicating with the server.");  
            } else {
                console.error("You need to be authenticated before proceeding");
                window.location.replace('../login.html');
            }
        }
    });
});