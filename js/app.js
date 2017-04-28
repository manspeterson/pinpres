// # FUNCTIONS

function getUrlParameter(sParam) {
    // var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    //     sURLVariables = sPageURL.split('&'),
    //     sParameterName,
    //     i;

    // for (i = 0; i < sURLVariables.length; i++) {
    //     sParameterName = sURLVariables[i].split('=');

    //     if (sParameterName[0] === sParam) {
    //         return sParameterName[1] === undefined ? true : sParameterName[1];
    //     }
    // }
    // return false;


    if (sParam == 'u') {
       return window.location.pathname.substring(1,window.location.pathname.length).split(/\/(.+)/)[0].replace('/','');
    } else if (sParam == 'b') {
        return window.location.pathname.substring(1,window.location.pathname.length).split(/\/(.+)/)[1].replace(/\/+$/, "");;
    }
};

function authenticated(){
    if (Cookies.getJSON('session') != undefined) {
        return true;
    } else {
        return false;
    }
}

function givenParameters() {
    // return (getUrlParameter('u') != false) && (getUrlParameter('b') != false);
    return window.location.pathname.substring(1,window.location.pathname.length).split(/\/(.+)/).length > 1
}

function clearURL() {
    history.pushState(null,null,'/');
}

function logout(e){
    e.preventDefault();
    Cookies.remove('session');
    Cookies.remove('username');
    PDK.logout();
    history.pushState(null,null,'/');
    $('#logout').hide();
    $('#username').text('');
    $('#title').show();
    $('#login-left').show();
    $('.boardnames').html('');
    $grid.masonry('remove', $('.grid-item'));
    $('.grid-item').remove();
};

function goHome(e) {
    e.preventDefault();
    // clearURL();
    // $('#home').hide();
    // $('#logout').show();
    getMyBoards();

}

function addBoard(name, user = '', urlSafe = '') {
    div = $('<div class="boardname"/>');
    a = $('<a href="/' + user + '/' + urlSafe +'"/>');
    a.text(name);
    a.attr('data-user', user);
    a.attr('data-urlBoard', urlSafe);
    div.append(a);
    $('.boardnames').first().append(div);
}

function addBoardListeners() {
        $('.boardnames a').on('click', function(e){
            e.preventDefault();
            $('.currentBoard').removeClass('currentBoard');
            $(this).addClass('currentBoard');
            getPins($(this).attr('data-user'),$(this).attr('data-urlBoard'));
            fetchMore = true;
            next = 'first';
        });
        $('.boardnames a').first().trigger('click');
}

function getMyBoards(){
    username = Cookies.get('username');
    $('#username').text(username);
    $('#login-left').hide();
    $('#login-right').hide();
    $('#title').hide();
    $('#home').hide();
    $('#logout').show();
    $('.boardnames').first().html('');
    clearURL();
    PDK.me('boards', function(response){

        for (x in response.data) {
            urlList = response.data[x].url.split('/');
            user = urlList[3]         
            urlSafe = decodeURI(urlList[4]);
            addBoard(response.data[x].name.toLowerCase(), user, urlSafe);
            
        }
        addBoardListeners();

    });

}
function login(e){
        self.item = $(this);
        e.preventDefault();
        prevURL = window.location.pathname;
        clearURL();

        PDK.init({
            appId: "4897004159634521129",
            cookie: true
        });

        //login
        PDK.login({ scope : 'read_relationships,read_public,read_private' }, function(response){
            if (!response || response.error) {
              //  alert('Error occurred');
            } else {
               // console.log(JSON.stringify(response));
            }
        //get board info
        var pins = [];
        PDK.me(function(response){
            if (!response || response.error) {
                alert('Error occurred');
            } else {
                Cookies.set('session', PDK.getSession());
                Cookies.set('username', response.data.url.replace("https://www.pinterest.com/", '').replace('/',''));
                if (self.item.attr('id') == 'login-left') {
                    getMyBoards();
                } else {
                    self.item.hide();
                    $('#home').show();
                    $('#login-right').hide();
                    if (self.item.attr('id') == 'login-for-more'){
                        getMorePins();
                    } else {
                        history.pushState(null,null, prevURL);
                    }
                }
            }
        });
        //end get board info
        });
        //end login

   

}

function getBig(url) {
    return url.replace('237x', '736x').replace('http://', 'https://');
}

function openSlide(photo) {
    $('#full img').attr('src', getBig(photo.attr('src')));
    $('#full').fadeIn(250);
    // setTimeout(function(){$('#full').trigger('focus').trigger('scroll');console.log('hej')}, 260);
}

function getPins(username, boardname) {
    $grid.masonry('remove', $('.grid-item'));
    $('.grid-item').remove();

    // history.pushState(null,null,'?u=' + username + '&b=' + boardname);
    document.title = 'pinpres / ' + username;
    history.pushState(null,null,'/' + username + '/' + boardname);
    var $url = 'https://api.pinterest.com/v3/pidgets/boards/' + username + '/' + boardname + '/pins';
    $.ajax({
        method: "GET",
        url: $url,
        dataType: "jsonp",
        jsonp: "callback",
        success: function(response) {
            if (!$.trim(response.data)){ 
                $grid.html("Ooops. Pinterest doesn't seem to respond. <br/>Please reload the page and try again");
                return;
            }
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
                $grid.append(div).masonry('appended', div, true).imagesLoaded().done(function() {
                    $grid.masonry('layout');
                });


            }
        },
        error: function(error) {
            console.log(error);
        }

    });
};

function getMorePins(){
    $('#login-for-more').hide();
     prevURL = window.location.pathname;
                clearURL();
                fetchMore = false;
                PDK.request('/v1/boards/' + $('#username').text() + '/' + $('.currentBoard').first().attr('data-urlBoard') + '/pins', {fields: 'image,url', limit : (next == 'first' ? 100 : 50), cursor : (next == 'first' ? '' : next)}, function(response){

                    // if (!$.trim(response.data)){ 
                    //     $grid.html("Ooops. Pinterest doesn't seem to respond. <br/>Please reload the page and try again");
                    //     return;
                    // }

                    var x = 0;
                    if (next == 'first') {
                        x = 50;
                    }
                    
                    
                    if (response.page.next != null){
                        setTimeout(function(){fetchMore = true}, 5000);
                        // next = response.page.next;
                        next = response.page.cursor;

                    }
                    var pins = response.data;

                    for (x; x < pins.length; x++) {
                        pin = pins[x];
                        pinImage = pin.image.original;
                        div = $('<div class="grid-item"/>');
                        imgDiv = $('<div class="grid-div-image"/>');
                        img = $('<img class="grid-image"/>');
                        img.attr('src', pinImage.url.replace('originals', '736x').replace('.png','.jpg').replace('.gif','.jpg'));
                        // img.css('visibility', 'hidden');
                        img.attr('width', pinImage.width);
                        img.attr('height', pinImage.height);
                        // img.css('max-height', pinImage.height);
                        div.attr('data-ratio', pinImage.height * 1.0 / pinImage.width);
                        div.css('background-color', 'gray');
                        // div.css('max-height', pinImage.height);

                        imgDiv.append(img);
                        div.append(imgDiv);
                        $grid.append(div).masonry('appended', div, true).imagesLoaded().done(function() {
                            $grid.masonry('layout');
                        });



                    }
                }); 
                history.pushState(null,null, prevURL);
}

function showPrevPhoto(){
    curr = $('.current').first().closest('.grid-item').prev().find('img');
    if (!(curr.length == 0)) {
        $('.current').removeClass('current')
        $(curr).addClass('current');
        $('#full img').attr('src', getBig(curr.attr('src')));
    }
}

function showNextPhoto(){
    curr = $('.current').first().closest('.grid-item').next().find('img');
    if (!(curr.length == 0)) {
        $('.current').removeClass('current')
        $(curr).addClass('current');
        $('#full img').attr('src', getBig(curr.attr('src')));
    }
}



// # LISTENERS


$('#logout').on('click', logout);
$('.login').on('click', login);
$('#home').on('click', goHome);
$('#login-for-more').on('click', login);
$('#infoBtn').on('click',function(e){e.preventDefault();$('#info').toggle();$(this).toggleClass('currentInfo');});
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

$('#full').click(function() {
    $('html').css('overflow', 'auto');
    $('body').css('overflow', 'auto');
    $('body').unbind('touchmove');
    $(this).fadeOut();
});

var hammer = new Hammer($('#full')[0]);
hammer.on('swipeleft', showNextPhoto);
hammer.on('swiperight', showPrevPhoto);
// $(document).on('swipeleft', showNextPhoto);
// $(document).on('swiperight', showPrevPhoto);

$(document).keydown(function(e) {
    switch (e.which) {

        case 17: //ctrl
            $('body').addClass('colour');
            break;

        case 37: // left
            showPrevPhoto();
            break;

        case 39: // right

            showNextPhoto();
            break;
        case 77:
            if ($('body').hasClass('minimize')) {
                $('body').removeClass('minimize');
            } else {
                $('body').addClass('minimize');
            }

        default:
            return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});

$(document).keyup(function(e) {
    switch (e.which) {
        case 17: // cstrl
            $('body').removeClass('colour');

        default:
            return
    }
    e.preventDefault();
});

$('main').on('click', 'img', function() {
    openSlide($(this));
    $('body').bind('touchmove', function(e){e.preventDefault()});
    $('.current').removeClass('current')
    $(this).addClass('current');
    $('html').css('overflow', 'hidden');
    $('body').css('overflow', 'hidden');
});

$('#boardname').on('keypress', function(e) {
    if (e.which === 13) {
        // getPins();
        //Disable textbox to prevent multiple submit
        // base = window.location.href.split('?')[0];
        // newURL = base + '?u=' + $('#username').val() + '&b=' + $('#boardname').val();
        // window.location.href = newURL;

        //Do Stuff, submit, etc..
    }
});

// Hide Header on on scroll down
var didScroll;
var lastScrollTop = 0;
var delta = 5;
var navbarHeight = $('header').outerHeight();
var next = 'first';
var fetchMore = true;

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
        // $('header').addClass('nav-down');
        $('header').fadeOut(100);
        $('#info').fadeOut(100);
        $('#infoBtn').removeClass('currentInfo');
        
    } else {
        // Scroll Up
        if (lastScrollTop - st > 0){
        //if(st + $(window).height() < $(document).height()) {
            // $('header').removeClass('nav-down');
            $('header').fadeIn(100);
            
            
        }
    }
    lastScrollTop = st;
    
    var nearToBottom = 500;
    if (($(window).scrollTop() + $(window).height() > $(document).height() - nearToBottom) && fetchMore ){
        if  (PDK.getSession() != null) { 
                $('#login-for-more').hide();
                getMorePins();
        } else {
            $('#login-for-more').fadeIn();
        }

    }
}



// # INIT

// init Masonry
var $grid = $('.grid').masonry({
    // options...
    columnwidth: '.grid-sizer',
    gutter: '.grid-gutter',
    itemSelector: '.grid-item',
    percentPosition: true
});


// Check for url parameters
if (givenParameters()) {
    
    givenUsername = getUrlParameter('u');
    givenBoards = getUrlParameter('b').split(',');
    // history.pushState(null,null,'?u=' + givenUsername + '&b=' + getUrlParameter('b'));
    if (authenticated()) {
        PDK.setSession(Cookies.getJSON('session'));
        $('#home').show();
    } else {
        $('#login-right').show();
    }
    $('.boardnames').first().html('');
    $('#title').hide();
    $('#username').text(givenUsername);
    for (x in givenBoards) {
        addBoard(decodeURI(givenBoards[x]).replace(/\-/g, ' '), givenUsername, decodeURI(givenBoards[x]));
    }
    addBoardListeners();

} else {
    if (authenticated()) {
        PDK.setSession(Cookies.getJSON('session'));
        getMyBoards();
    } else {
        $('#login-left').show();
    }
}


