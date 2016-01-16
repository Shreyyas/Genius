/**
 * On document ready, load the the main screen and all the ui components
 */
$(document).ready(function () {
    // Fade in the header and hide the actual view
    $("body").fadeIn(1000);
    $('.pusher').hide();

    // Intialize the dataset
    init();

    // Load the sidebar with the alphabet
    load_sidebar();

    // Initialize the Range Slider
    $("#slider").ionRangeSlider({
        type: "single",
        min: 5,
        max: 30,
        step: 5,
        grid: true,
        grid_snap: true,
        onFinish: function (data) {
            NEW_NUM_WORDS_TO_DISPLAY = +data.from;
            numWordsChanged = true;
            loadUIWithData("BASE");
        }
    });

    // Initialize a nice scrollbar for the body
    $("body").niceScroll({
        cursorcolor: "#888888",
        cursorborder: "#444444",
        bouncescroll: true,
        horizrailenabled: false
    });

    // Initialize a nice scrollbar for the sidebar
    $(".ui.sidebar").niceScroll({
        cursorcolor: "#888888",
        cursorborder: "#444444",
    });

    // Set the width of the container fluid element
    $('.container-fluid').css({
        'width': ($(window).width() - 250) + "px"
    })

    // Scrolls to the top if necessary
    $("body").getNiceScroll(0).doScrollTop(0, 10);
});

/**
 * On button ready click, show the main view
 */
$("#button_ready").click(function () {
    $("header").fadeOut(500);
    $(".pusher").fadeIn(500);
    $('.ui.sidebar').fadeIn(1000);
    readyClicked = true;
    loadUIWithData("BASE");
});

/**
 * On button next click, load the UI with the next set of words
 */
$("#button_next").click(function () {
    loadUIWithData("NEXT");
});

/**
 * On button back click, load the UI with the previous set of words
 */
$("#button_back").click(function () {
    loadUIWithData("BACK");
});

/**
 * On button in order click, load the UI with words in order
 */
$("#button_inOrder").click(function () {
    // If the in order button is already on
    if ($('#button_inOrder').hasClass('active')) {

        // Toggle in order off and randomize on
        $('#button_inOrder').removeClass('active');
        $('#button_randomize').addClass('active');
        $('#button_randomize').css({
            opacity: 1
        });
        $('#button_inOrder').css({
            opacity: 0.5
        });

        // Update state
        NUM_WORDS_TO_DISPLAY = NEW_NUM_WORDS_TO_DISPLAY;
        start = 0;
        end = NUM_WORDS_TO_DISPLAY;
        previousEnd = start;
        numBack = 0;
        randomize = true;

        // Update data and load UI
        if (isletterFilterClicked && isSearched) {
            filterDataByLetter(currentFilterLetter);
        }
        isSearched = false;
        loadUIWithData("BASE");

    } else {

        // Toggle randomize off and in order on 
        $('#button_randomize').removeClass('active');
        $('#button_inOrder').addClass('active');
        $('#button_inOrder').css({
            opacity: 1
        });
        $('#button_randomize').css({
            opacity: 0.5
        });

        // Update state
        NUM_WORDS_TO_DISPLAY = NEW_NUM_WORDS_TO_DISPLAY;
        start = 0;
        end = NUM_WORDS_TO_DISPLAY;
        previousEnd = start;
        numBack = 0;
        randomize = false;

        // Update data and load UI
        if (isletterFilterClicked && isSearched) {
            filterDataByLetter(currentFilterLetter);
        }
        isSearched = false;
        loadUIWithData("BASE");
    }
});
$("#button_randomize").click(function () {
    // If the randomize button was already on
    if ($('#button_randomize').hasClass('active')) {

        // Toggle randomize off and in order on
        $('#button_randomize').removeClass('active');
        $('#button_inOrder').addClass('active');
        $('#button_inOrder').css({
            opacity: 1
        });
        $('#button_randomize').css({
            opacity: 0.5
        });

        // Update state
        NUM_WORDS_TO_DISPLAY = NEW_NUM_WORDS_TO_DISPLAY;
        start = 0;
        end = NUM_WORDS_TO_DISPLAY;
        previousEnd = start;
        numBack = 0;
        randomize = false;

        // Update data and load UI
        if (isletterFilterClicked && isSearched) {
            filterDataByLetter(currentFilterLetter);
        }
        isSearched = false;
        loadUIWithData("BASE");

    } else {

        // Toggle in order off and randomize on
        $('#button_inOrder').removeClass('active');
        $('#button_randomize').addClass('active');
        $('#button_randomize').css({
            opacity: 1
        });
        $('#button_inOrder').css({
            opacity: 0.5
        });

        // Update state
        NUM_WORDS_TO_DISPLAY = NEW_NUM_WORDS_TO_DISPLAY;
        start = 0;
        end = NUM_WORDS_TO_DISPLAY;
        previousEnd = start;
        numBack = 0;
        randomize = true;

        // Update data and load UI
        if (isletterFilterClicked && isSearched) {
            filterDataByLetter(currentFilterLetter);
        }
        isSearched = false;
        loadUIWithData("BASE");
    }
});

/**
 * On mouseenter, highlight the current card. 
 * On mouseleave, unhighlight the current card.
 * On click, display the backside of the current card.
 */
$('#metro-container').on({
    mouseenter: function () {
        $(this).css('border-color', 'black');
        $('.word_panel').css('opacity', 0.5);
        $(this).css('opacity', 1);
    },
    mouseleave: function () {
        $(this).css('border-color', 'transparent');
        $('.word_panel').css('opacity', 1);
    },
    click: function () {
        if (!$(this).attr('data-toggled') || $(this).attr('data-toggled') == 'off') {
            /* currently it's not been toggled, or it's been toggled to the 'off' state,
               so now toggle to the 'on' state: */
            $(this).attr('data-toggled', 'on');
            $(this).css('transform', 'rotateY(180deg)');
        } else if ($(this).attr('data-toggled') == 'on') {
            /* currently it has been toggled, and toggled to the 'on' state,
               so now turn off: */
            $(this).attr('data-toggled', 'off');
            $(this).css('transform', 'rotateY(360deg)');
        }
    }
}, ".word_panel");

/**
 * On hover, smoothly open dropdown of the letters.
 */
$('div.item').on({
    mouseenter: function (e) {
        e.preventDefault();
        $(this).children().stop().slideDown(300);
    },
    mouseleave: function (e) {
        e.preventDefault();
        if (!$(this).hasClass('setDown')) {
            $(this).children().stop().slideUp(250);
        }
    }
}, '.letterGroup');

/** 
 * Clicking a letter filter the data by that letter.
 * Hovering over a letter smoothly highlights its color
 */
$('div.item').on({
    click: function (e) {
        e.preventDefault();
        isletterFilterClicked = true;
        filterDataByLetter(this.text);
        if (!$(this).parent().hasClass('setDown')) {
            $(this).parent().addClass('setDown');
            if (previousSelectedDropdown != "") {
                $(previousSelectedDropdown).removeClass('setDown');
                $(previousSelectedDropdown).children().stop().slideUp(250);

            }
            previousSelectedDropdown = $(this).parent();
        }
    },
    mouseenter: function (e) {
        e.preventDefault();
        $(this).css('-moz-transition', 'color .2s ease-in');
        $(this).css('-o-transition', 'color .2s ease-in');
        $(this).css('-webkit-transition', 'color .2s ease-in');
        $(this).css('transition', 'color .2s ease-in');
        $(this).css('color', 'rgba(255, 255, 255, 0.9)');

    },
    mouseleave: function (e) {
        e.preventDefault();
        $(this).css('-moz-transition', 'color .2s ease-in');
        $(this).css('-o-transition', 'color .2s ease-in');
        $(this).css('-webkit-transition', 'color .2s ease-in');
        $(this).css('transition', 'color .2s ease-in');
        $(this).css('color', 'rgba(255, 255, 255, 0.5)');
    }
}, '.letter');


/** 
 * Pressing enter on the search box, performs a search on the user's input
 */
$("#search").keyup(function (e) {
    if (e.keyCode == 13) {
        search();
    }
});

/** 
 * Clicking on the search icon, performs a search on the user's input
 */
$(".search.icon").click(function () {
    search();
});

/**
 * Update the view on window resize
 */
$(window).resize(function () {
    loadUIWithData("BASE");
});

/**
 * Clicking a letter filter the data by that letter. (Old Version, see old_load_sidebar() in load_data.js)
 */
/*$('.alphabet.menu').on({
    click: function (e) {
        e.preventDefault();
        isletterFilterClicked = true;
        filterDataByLetter(this.text);
    }
}, '.letter');*/
