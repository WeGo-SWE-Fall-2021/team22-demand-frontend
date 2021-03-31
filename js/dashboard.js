$(() => {
    let cloudURL = "https://demand.team22.sweispring21.tk"

    // Handle user data if there is someone is logged in, else redirect them to login page

    fetchLoggedInUser().then(data => {
        if (data.status === 200) {
            // Success in fetching data now update dashboard with the new data
        } else {
            // Was not able to fetch user
            window.location.replace(cloudURL)
        }
    })

    // If a user clicks on the logout button, cookies will be empty and will be taken to main page
    $('#logoutButton').click(() => {
        fetch(cloudURL + "/api/v1/common-services/logout", {
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response);
        }).then(data => {
            window.location.replace(cloudURL);
        }).catch(error => {
            // Handle error
        })
    });
});