/* Number of words to display */
var NUM_WORDS_TO_DISPLAY = 10;
var NEW_NUM_WORDS_TO_DISPLAY = 10;

/* Keeps track of position in word list */
var start = 0;
var end = NUM_WORDS_TO_DISPLAY;
var previousEnd = start;

/* State variables */
var numBack = 0;
var randomize = false;
var numWordsChanged = false;
var readyClicked = false;
var isletterFilterClicked = false;
var isSearched = false;

/* Manage input from users */
var search_input = "";
var previousLetter = "";
var currentFilterLetter = "";
var previousSelectedDropdown = "";

/* Dataset variables */
var clean_dataset = []; // Full dataset
var filtered_dataset = []; // Filtered dataset based on user input
var dataset_length; // Global clean dataset size variable

/* Random Selection - Manages yet to be seen and already viewed words */
var potential_indices = [];
var viewed_indices = [];

/* Color palette for vocab cards */
var color_palette = ['#86269b', '#4d6684', '#7d4627', '#e62739', '#89bdd3', '#1fda9a', '#e05915', '#007034', '#004687', '#29aba4', '#fa9581'];
var color_picker = randomNoRepeats(color_palette);

/**
 *  Loads JSON from local storage
 */
function loadJSON(callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'data/GRE_words.json', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

/**
 *   Produces a cleaned version of the data 
 *   Filtered Dataset Format = [ {'word' : word, 'definition' : definition } ];
 */
function init(callback) {
    loadJSON(function (response) {
        // Parse JSON string into object
        var dataset = JSON.parse(response);

        // Get the keys and sort them
        var dataset_words = Object.keys(dataset);
        dataset_words.sort();

        // Preprocess the data into a [ { "word" : __word__ , "definition" : __definition__ }, ... ] format
        dataset_length = dataset_words.length;
        for (var i = 0; i < dataset_length; i++) {
            var word = dataset_words[i];
            var definition = dataset[word];

            clean_dataset[i] = {
                "word": word,
                "definition": definition
            };
            potential_indices.push(i);
        }
        filtered_dataset = clean_dataset;
    });
}

/**
 *   Loads UI with data based on the current state
 */
function loadUIWithData(state) {

    // When you click on this button, the previous panels are removed
    var myNode = document.getElementById('metro-container');
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }

    // Use filtered_dataset as the default dataset. Clean dataset is a copy of the full dataset.
    if (!isletterFilterClicked && clean_dataset.length != 0 && !isSearched) {
        filtered_dataset = clean_dataset;
        $("#not-found").remove();
        $('#buttons-container').show();

    } else if (filtered_dataset.length == 0) { // If there is no data found, set up variables to notify user data not found
        $("#not-found").remove();
        var $h2;
        var searchResults;
        if (isSearched) {
            $h2 = '<h2 id="not-found">Sorry ' + search_input + ' isn\'t in this dictionary! Please try another word!</h2>';
            searchResults = "Results for " + search_input.toLowerCase();
        } else if (isletterFilterClicked) {
            $h2 = '<h2 id="not-found">Sorry there aren\'t any ' + currentFilterLetter + ' letter words in this dictionary yet! Please try another letter!</h2>';
            if (randomize) {
                searchResults = "Random " + currentFilterLetter.toUpperCase() + "'s!";
            } else {
                searchResults = currentFilterLetter.toLowerCase();
            }
        }

        // Add the notification to the page
        $('#metro-container').after($h2);
        $('#buttons-container').hide();
        $('#word-deck').text(searchResults);
        previousLetter = "";

    } else {
        // Remove the not-found notification when there is data
        $("#not-found").remove();

        // Show the buttons
        $('#buttons-container').show();
    }

    // If ready is clicked
    if (readyClicked) {

        // Set the defualt state to base
        if (start == 0) {
            state == "BASE";
        }

        // If the dataset is smaller than the user's request, then display however many there are
        if (filtered_dataset.length <= NUM_WORDS_TO_DISPLAY) {
            NUM_WORDS_TO_DISPLAY = filtered_dataset.length;
        }

        // Update the data based on user selection
        var subset = setSubset(filtered_dataset, state); //choose the one based on the option selected

        // Set the number of rows based on number of words to display
        var numRows = Math.ceil(NUM_WORDS_TO_DISPLAY / 5);

        // Create the panels row by row
        var metro_level = 'metro';
        var $metro;
        var currentHeight = 250;
        var maxHeight = currentHeight;

        for (var i = 0; i < NUM_WORDS_TO_DISPLAY; i++) {

            // Create the row if necessary
            if (i % 5 == 0) {
                metro_level = 'metro_' + i;
                $metro = $('<div class="row" id="' + metro_level + '"></div>');
                $('#metro-container').append($metro);
            }

            // Create the panel
            var word_panel_id = 'word_panel_' + i;
            $('#' + metro_level).append('<div class="flip-container"><div class="col-xs-2 word_panel flipper" id="' + word_panel_id + '"></div></div>');

            // Append word and defintion to that panel
            var word = subset[i].word;
            var definition = subset[i].definition;
            var firstLetter = word.charAt(0);

            // Updates the page header based on the current words being displayed
            // e.g. If A words are displayed, page header will show A. If B words are displayed, page header will show B.
            if (!randomize && !isSearched) { // If you've selected in order option
                $('#word-deck').text(firstLetter);
                if (firstLetter != previousLetter) {
                    previousLetter = firstLetter;
                }
            } else if (randomize && !isSearched) { // If you've selected random option 
                if (isletterFilterClicked) {
                    $('#word-deck').text("Random " + firstLetter + "'s!");
                    previousLetter = firstLetter;
                } else {
                    $('#word-deck').text("Random!");
                    previousLetter = "Random!";
                }
            } else if (isSearched) { // If you're searching for something
                var searchResults = "Results for " + search_input.toLowerCase();
                $('#word-deck').text(searchResults);
                previousLetter = searchResults;
            }

            // Create front and back panels for each vocab card
            var $front = $('<div class="front"></div>');
            $front.append('<div class="word_wrap" id="word">' + word + '</div>');
            $front.append('<div id="definition">' + definition + '</div>');
            var $back = $('<div class="back"></div>');

            // Create links for web search and image search for each vocab card
            var searchLink = "https://www.google.co.in/search?&q=" + word.toLowerCase();
            var imageSearchLink = "https://www.google.co.in/search?&tbm=isch&q=" + word.toLowerCase();

            // Add the cards to the view
            $back.append('<a target="_blank" href="' + searchLink + '" class="circular ui blue icon button" id="google-search"><i class="icon google"></i></a>');
            $back.append('<a target="_blank" href="' + imageSearchLink + '" class="circular ui yellow icon button" id="google-image-search"><i class="icon file image outline"></i></a>');
            $('#' + word_panel_id).append($front);
            $('#' + word_panel_id).append($back);
            $('#' + word_panel_id).css('background-color', color_picker());

            // Set size of the card for terms with long definitions
            var panelHeight = $('#' + word_panel_id).innerHeight();
            var wordHeight = $('#' + word_panel_id + " #word").innerHeight();
            var definitionHeight = $('#' + word_panel_id + " #definition").innerHeight();

            currentHeight = wordHeight + definitionHeight;
            if (maxHeight < currentHeight) {
                maxHeight = currentHeight + 10;
            }

            // Add spacing to the top definitions for terms with short definitions
            if (definitionHeight + wordHeight < 0.6 * panelHeight) {
                $('#' + word_panel_id + " #definition").css({
                    'padding-top': '10px'
                });
            }
        }
    }

    // Update CSS of the word panel height so definitions are properly spaced
    $(".word_panel").css({
        'height': maxHeight + "px"
    });
    $(".row").css({
        'width': (5 * $('.word_panel').outerWidth(true)) + "px"
    });
}

/**
 * Loads the sidebar with ALL and alphabet under the alphabet menu
 */

function load_sidebar() {
    var $alphabetMenu = $('.ui.list').children();
    var menuSize = $alphabetMenu.length;
    for (var i = 0; i < menuSize; i++) {

        // Parse the group contents to find letter range
        var child = $alphabetMenu.eq(i);
        var alphabetRange = child[0].textContent.replace(/\s+/g, '');
        var startLetter = alphabetRange.charAt(0);
        var endLetter = alphabetRange.charAt(alphabetRange.length - 1);
        var letterDifference = Math.abs(startLetter.charCodeAt(0) - endLetter.charCodeAt(0)) + 1;

        // Set ID for group
        var groupId = alphabetRange;
        $(child).attr('id', groupId);
        $(child).css('padding-top', '10px');
        $(child).css('padding-bottom', '10px');

        // Set default to ALL
        if (i == 0) {
            $(child).append('<a class="item letter" id="ALL">ALL</a>');
        }

        // Add the alphabet in the current range under the current group
        for (var j = 0; j < letterDifference; j++) {
            var value = String.fromCharCode(startLetter.charCodeAt(0) + j);
            $(child).append('<a class="item letter" id="' + value + '">' + value + '</a>');
        }
        $(child).children().hide();
        $(child).children().css('color', 'rgba(255, 255, 255, 0.5)');
        $(child).children().css('padding-top', '5px');
        $(child).children().eq(0).css('padding-top', '10px');
        $(child).children().css('padding-bottom', '5px');
    }
}

/**
 *  Updates the filtered_dataset to filter the contents based on the letter
 */
function filterDataByLetter(data) {
    var filtered = [];

    // Update num words to display and current letter filter based on current state of user input
    NUM_WORDS_TO_DISPLAY = NEW_NUM_WORDS_TO_DISPLAY;
    currentFilterLetter = data;

    // Check if data is ALL or a Letter
    if (data != 'ALL') {

        // If data is a letter, go through the dataset and add the ones which
        // match that letter here (switching to hashmap would be better for larger datasets)
        for (var i = 0; i < dataset_length; i++) {
            var word_definition = clean_dataset[i];
            if (word_definition.word.charAt(0) == data) {
                filtered.push(word_definition);
            }
        }
        // Update the filtered dataset
        filtered_dataset = filtered;

        // Update Potential and Viewed Lists
        resetLists();

        // If the dataset is smaller than the user's request, then display however many there are
        if (filtered_dataset.length <= NUM_WORDS_TO_DISPLAY) {
            NUM_WORDS_TO_DISPLAY = filtered_dataset.length;
        }

    } else {
        // Since we are looking at all the data, set letter filter clicked false
        isletterFilterClicked = false;
    }

    // Highlight the user's selection active and turn off all the other letters
    $('.letter').removeClass('active');
    $('#' + data).addClass('active');

    // Reset the state
    start = 0;
    numBack = 0;
    isSearched = false;
    end = NUM_WORDS_TO_DISPLAY;
    loadUIWithData("BASE");
}

/**
 * Perform search on the words. It's a similar function to the 
 */
function search() {
    // Perform if only readyIsClicked
    if (readyClicked) {
        // Update the state
        NUM_WORDS_TO_DISPLAY = NEW_NUM_WORDS_TO_DISPLAY;

        // Get the search bar input
        search_input = $('#search input').val().toUpperCase();

        // Go through full dataset and recover the words containing the current string
        var length = clean_dataset.length;
        var filtered = [];
        for (var i = 0; i < length; i++) {
            var word_definition = clean_dataset[i];
            if (word_definition.word.startsWith(search_input)) {
                filtered.push(word_definition);
            }
        }
        // Update filtered dataset
        filtered_dataset = filtered;

        // If the dataset is smaller than the user's request, then display however many there are
        if (filtered_dataset.length <= NUM_WORDS_TO_DISPLAY) {
            NUM_WORDS_TO_DISPLAY = filtered_dataset.length;
        }

        // Reset the state
        resetLists();
        start = 0;
        numBack = 0;
        isSearched = true;
        end = NUM_WORDS_TO_DISPLAY;
        loadUIWithData("BASE");
    }
}

/**
 * Resets potential and viewed lists. Used whenever filtered dataset is changed.
 */
function resetLists() {
    // Reset potential indices based on new dataset
    potential_indices = [];
    var newLength = filtered_dataset.length;
    for (var i = 0; i < newLength; i++) {
        potential_indices.push(i);
    }
    // Reset viewed indices because we haven't seen anything yet
    viewed_indices = [];
}

/** 
 * Sets the subset based on the state
 */
function setSubset(obj, state) {
    var subset = [];
    var size = obj.length;

    // If state is BASE
    if (state == "BASE") {
        // Check if Randomize
        if (randomize) {
            // Check if NUM_WORDS_TO_DISPLAY has changed
            if (numWordsChanged) {
                // If we have seen things yet and the number of cards to view has changed, 
                // get the previous viewed words and the difference of the number of the words shown before and the 
                // number of words to show now. This will show the previous words AND a number of new words
                if (viewed_indices.length != 0) {
                    var currentSubset = getViewedRandomSubset(obj, start, end);
                    var difference = NEW_NUM_WORDS_TO_DISPLAY - NUM_WORDS_TO_DISPLAY;
                    subset = currentSubset.concat(getNewRandomSubset(obj, difference));
                    end += Math.abs(NEW_NUM_WORDS_TO_DISPLAY - NUM_WORDS_TO_DISPLAY);
                } else {
                    // Just get a new subset of data
                    subset = getNewRandomSubset(obj, NEW_NUM_WORDS_TO_DISPLAY);
                }

                // Update the NUM WORDS TO DISPLAY here because we wanted to know what the value was before
                NUM_WORDS_TO_DISPLAY = NEW_NUM_WORDS_TO_DISPLAY;
            } else {
                // Just get a new subset of data
                subset = getNewRandomSubset(obj, NUM_WORDS_TO_DISPLAY);
            }
        } else {
            // Account for a change in the number of words
            if (numWordsChanged) {
                end += Math.abs(NEW_NUM_WORDS_TO_DISPLAY - NUM_WORDS_TO_DISPLAY);
                NUM_WORDS_TO_DISPLAY = NEW_NUM_WORDS_TO_DISPLAY;
            }

            // Get a subset of the data in order
            subset = obj.slice(start, end);
        }
        numWordsChanged = false;
    }

    // If state is NEXT
    if (state == "NEXT") {

        // Update the start with the old ending and the end with the start + the number words to display
        start = previousEnd;
        end = start + NUM_WORDS_TO_DISPLAY;

        if (start >= 0 && end < size) { // Display new words on next
            if (randomize) {
                if (numBack > 0) { //just get previous random one
                    subset = getViewedRandomSubset(obj, start, end);
                } else { //get new random one
                    subset = getNewRandomSubset(obj, NUM_WORDS_TO_DISPLAY);
                }
            } else { //just get the next in order
                subset = obj.slice(start, end);
            }
            if (numBack > 0) { // We just went forward so decrease the number of places we went back
                numBack--;
            }
        } else if (Math.abs(end) - Math.abs(start) < NUM_WORDS_TO_DISPLAY || end >= size) { //display all remaining
            end = size;
            start = end - NUM_WORDS_TO_DISPLAY;

            // Get the current set (we've already seen this one before, since there's nothing new to show here)
            if (randomize) {
                subset = getViewedRandomSubset(obj, start, end);
            } else {
                subset = obj.slice(start, end);
            }
        }
    }

    // If state is BACK
    if (state == "BACK") {

        // Update end with old start and start with new end - num words to display
        end = start;
        start = end - NUM_WORDS_TO_DISPLAY;


        if (start >= 0 && end <= size) { // We've gone back!
            numBack++;
        } else if (end > size) { // We're at the end!
            end = size;
            start = end - NUM_WORDS_TO_DISPLAY;
        } else if (start < 0) { // We're at the beginning!
            start = 0;
            end = NUM_WORDS_TO_DISPLAY;
        }

        // Get the previous set (we've already seen this one before since we're going back)
        if (randomize) {
            subset = getViewedRandomSubset(obj, start, end);
        } else {
            subset = obj.slice(start, end);
        }
    }
    previousEnd = end;
    return subset;
}

/**
 * Gets a previously viewed subset for the random option. 
 * We take the start and end indices to select the data we're displaying from the dataset.
 */
function getViewedRandomSubset(obj, start, end) {
    var subset = [];
    for (var i = start; i < end; i++) {
        subset.push(obj[viewed_indices[i]]);
    }
    return subset;
}

/**
 * Gets a new random subset with size of displayAmount from the dataset.
 */
function getNewRandomSubset(obj, displayAmount) {
    var subset = [];
    var size = obj.length;

    // Adds elements to viewed indices and removes the same from potential indicies
    for (var i = 0; i < displayAmount; i++) {
        var index = Math.floor(Math.random() * size);
        viewed_indices.push(index);
        var location = potential_indices.indexOf(index); //remove the index from this list
        if (location > -1) {
            potential_indices.splice(location, 1);
        }
        subset.push(obj[index]);
    }
    return subset;
}

/**
 * Tries to select a random element without repetition
 */
function randomNoRepeats(array) {
    var copy = array.slice(0);
    return function () {
        if (copy.length < 1) {
            copy = array.slice(0);
        }
        var index = Math.floor(Math.random() * copy.length);
        var item = copy[index];
        copy.splice(index, 1);
        return item;
    };
}


/**
 * Loads sidebar with letters vertically in order. No dropdown.
 */
/*function old_load_sidebar() {
    //Default to show All again
    $('.alphabet.menu').append('<a class="item letter" id="ALL">ALL</a>');

    for (var i = 0; i < 26; i++) {
        var value = String.fromCharCode(65 + i);
        $('.alphabet.menu').append('<a class="item letter" id="' + value + '">' + value + '</a>');
    }
}*/
