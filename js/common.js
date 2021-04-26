/* Adds shadow on header once it passes height */
$(window).scroll(() => {
    let header = $("header")
    if (window.scrollY > 0) {
        header.addClass("header-scroll");
    } else {
        header.removeClass("header-scroll");
    }
});

// If the user resizes and the tab is still shown, we will need to hide it and show the navigation
$(window).resize(() => {
    let windowWidth = $(window).width();
    if (windowWidth > 991) {
        let navBar = $('#navbar');
        let hasMobileNavbar = navBar.hasClass('navbar-mobile');
        if (hasMobileNavbar) {
            navBar.removeClass('navbar-mobile');
            let mobileNavToggle = $('#mobile-nav-toggle');
            mobileNavToggle.removeClass('text-white');
            mobileNavToggle.addClass('text-secondary');
            mobileNavToggle.removeClass('bi-x');
            mobileNavToggle.addClass('bi-list');
        }
    }
});

// Switch from hamburger icon to x icon if pressed
$(() => {
    $('#mobile-nav-toggle').click(function () {
        let hasList = $(this).hasClass('bi-list');
        if (hasList) {
            $(this).removeClass('bi-list');
            $(this).addClass('bi-x');
            $(this).removeClass('text-secondary');
            $(this).addClass('text-white');
            $('#navbar').addClass('navbar-mobile');
        } else {
            $(this).removeClass('bi-x');
            $(this).addClass('bi-list');
            $(this).removeClass('text-white');
            $(this).addClass('text-secondary');
            $('#navbar').removeClass('navbar-mobile');
        }
    });
});

$(() => {
    $("#logoutButton").click(() => {
        logoutUser();
    });
});
