// var e = jQuery.Event("keydown");
// e.which = 18; // # Some key code value
// init Masonry

var $grid = $('.grid').masonry({
    // options...
    columnwidth: '.grid-sizer',
    gutter: '.grid-gutter',
    itemSelector: '.grid-item',
    percentPosition: true
});

$('#small').on('click', function(e) {
    e.preventDefault();

    if (!($(this).hasClass('currGrid'))) {
        $('.currGrid').removeClass('currGrid');
        $(this).addClass('currGrid');
        $('main').removeClass('big');
        $grid.masonry('layout');
    };
});

$('#big').on('click', function(e) {
    e.preventDefault();
    if (!($(this).hasClass('currGrid'))) {
        $('.currGrid').removeClass('currGrid');
        $(this).addClass('currGrid');
        $('main').addClass('big');
        $grid.masonry('layout');
    };
});

$('#light').on('click', function(e) {
    e.preventDefault();
    if (!($(this).hasClass('currLight'))) {
        $('.currLight').removeClass('currLight');
        $(this).addClass('currLight');
        $('body').removeClass('dark');

    };
});

$('#dark').on('click', function(e) {
    e.preventDefault();
    if (!($(this).hasClass('currLight'))) {
        $('.currLight').removeClass('currLight');
        $(this).addClass('currLight');
        $('body').addClass('dark');
    };
});



$grid.imagesLoaded().done(function() {});
// $grid.imagesLoaded().progress( function() {
//   $grid.masonry('layout');
// });
// layout Masonry after each image loads


function getBig(url) {
    return url.replace('237x', '736x');
}

function openSlide(photo) {
    $('#full img').attr('src', getBig(photo.attr('src')));
    $('#full').fadeIn(250);
    // setTimeout(function(){$('#full').trigger('focus').trigger('scroll');console.log('hej')}, 260);


}
$('#full').click(function() {
    $('html').css('overflow', 'auto');
    $(this).fadeOut();
});

$(document).keydown(function(e) {
    switch (e.which) {
        case 37: // left
            curr = $('.current').first().closest('.grid-item').prev().find('img');
            if (!(curr.length == 0)) {
                $('.current').removeClass('current')
                $(curr).addClass('current');
                $('#full img').attr('src', getBig(curr.attr('src')));
            }
            break;

        case 38: // up
            break;

        case 39: // right

            curr = $('.current').first().closest('.grid-item').next().find('img');
            if (!(curr.length == 0)) {
                $('.current').removeClass('current')
                $(curr).addClass('current');
                $('#full img').attr('src', getBig(curr.attr('src')));
            }
            break;

        case 40: // down
            break;

        case 17: //ctrl
            $('body').addClass('colour');
            break;

        default:
            return; // exit this handler for other keys
    }
    // e.preventDefault(); // prevent the default action (scroll / move caret)
});

$(document).keyup(function(e) {
    switch (e.which) {
        case 17: // cstrl
            $('body').removeClass('colour');

        default:
            return
    }
})

$('main').on('click', 'img', function() {
    openSlide($(this));

    $('.current').removeClass('current')
    $(this).addClass('current');
    $('html').css('overflow', 'hidden');
});


function getPins() {
    username = $('#username').val();
    boardname = $('#boardname').val();
    var $url = 'https://api.pinterest.com/v3/pidgets/boards/' + username + '/' + boardname + '/pins';
    $.ajax({
        method: "GET",
        url: $url,
        dataType: "jsonp",
        jsonp: "callback",
        success: function(response) {

            var pins = response.data.pins;
            for (x in pins) {
                pin = pins[x];
                pinImage = pin.images['237x'];
                div = $('<div class="grid-item"/>');
                imgDiv = $('<div class="grid-div-image"/>');
                img = $('<img class="grid-image"/>');
                img.attr('src', getBig(pinImage.url));
                // img.css('visibility', 'hidden');
                img.attr('width', pinImage.width);
                img.attr('height', pinImage.height);
                // img.css('max-height', pinImage.height);
                div.attr('data-ratio', pinImage.height * 1.0 / pinImage.width);
                div.css('background-color', pin.dominant_color);
                // div.css('max-height', pinImage.height);

                imgDiv.append(img);
                div.append(imgDiv);
                $grid.append(div).masonry('appended', div, true).imagesLoaded().progress(function() {
                    $grid.masonry('layout');
                });


            }


        },
        error: function(error) {
            console.log(error);
        }

    });
};

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
    return false;
};

$('#boardname').on('keypress', function(e) {
    if (e.which === 13) {

        //Disable textbox to prevent multiple submit
        base = window.location.href.split('?')[0];
        newURL = base + '?u=' + $('#username').val() + '&b=' + $('#boardname').val();
        window.location.href = newURL;

        //Do Stuff, submit, etc..
    }
});

if ((getUrlParameter('u') != false) && (getUrlParameter('b') != false)) {
    $('#username').val(getUrlParameter('u'));
    $('#boardname').val(getUrlParameter('b'));
} else {
    $('#username').val('fridamysqvist');
    $('#boardname').val('insp');
}
getPins();



// Hide Header on on scroll down
var didScroll;
var lastScrollTop = 0;
var delta = 5;
var navbarHeight = $('header').outerHeight();

$(window).scroll(function(event){
    didScroll = true;
});

setInterval(function() {
    if (didScroll) {
        hasScrolled();
        didScroll = false;
    }
}, 250);

function hasScrolled() {
    var st = $(this).scrollTop();
    
    // Make sure they scroll more than delta
    if(Math.abs(lastScrollTop - st) <= delta){
        
        lastScrollTop = st;
        return;
    }
    // If they scrolled down and are past the navbar, add class .nav-up.
    // This is necessary so you never see what is "behind" the navbar.
    if (st > lastScrollTop && st > navbarHeight){
        // Scroll Down
        $('header').addClass('nav-down');
        
    } else {
        // Scroll Up
        if (lastScrollTop - st > 0){
        //if(st + $(window).height() < $(document).height()) {
            $('header').removeClass('nav-down');
            
            
        }
    }
    lastScrollTop = st;
}