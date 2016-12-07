//Global Variables
var moviesList = {};
var sortedMoviesList = [];
var tasteKidAPI = 'https://www.tastekid.com/api/similar?callback=?';
var imdbAPI = 'https://www.omdbapi.com/?callback=?';
var counter = 0;
var movieSearched = '';
var firstSearchPerformed = false;

//String/title modifier

function keysToLowerCase(obj) {
    Object.keys(obj).forEach(
        function(key) {
            var k = key.toLowerCase();
            obj[k] = obj[key];
            delete obj[key];
        });
    return (obj);
}

//APIs
function getTasteKidResults(searchTerm) {
    var params = {
        q: searchTerm,
        type: 'movies',
        info: 1,
        k: '248912-WatchTon-7SFM2O3H',
    };
    $.getJSON(tasteKidAPI, params).done(function (data) {createMovieList(data);
});
}

function getIMDBResults(searchTerm, callback) {
    var params = {
        t: searchTerm,
        type: 'movie',
        plot: 'short',
        tomatoes: true,
    };
    $.getJSON(imdbAPI, params, callback);
}

//---------
//The guts: Getting search results from TasteKid, then requesting those movies in IMDB,
//then rendering the results to the page.
//---------

$(document).ready(firstSearchButton());

function firstSearchButton() {
    $('.js-first-search-button').on('click', function(e) {
        e.preventDefault();
        var query = $('.-first-ajax-search').val();
        movieSearched = query.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
        if (query === '') {
            $('.error-msg').text('Please enter a movie to search for.');
        }
          else {
        getTasteKidResults(query);
        $('.first-search-box').fadeOut('slow', function() {});
        $('.error-msg').empty();
      }
    });
}

function searchingAnimations() {
    $('.logo').animate({
        opacity: .4,
        left: '20px',
        top: '107px',
        height: "22px",
        width: "120px",
        fontSize: "18px"
    }, 'slow');
    $('.content').append('<div class="spinner"></div>');
    $('.content').addClass('blurred');
}

//Add the movies obtained from TasteKid into global object moviesList

function createMovieList(data) {
    if (data.Similar.Info[0].Type === 'unknown') {
      if (firstSearchPerformed === true) {
        $('.error-msg').text('No movies found. Please refine your search.');
      }
      else {
          $('.error-msg').text('No movies found. Please refine your search.');
        $('.first-search-box').fadeIn('fast', function() {
        });}
    } else {

        searchingAnimations();
        data.Similar.Results.forEach(function(elem) {
            var thisTitle = elem.Name.trim()
                .replace(/[&]+/g, 'and')
                .toLowerCase();
            moviesList[thisTitle] = {};
            moviesList[thisTitle].yUrl = elem.yUrl;
        });
    }
    for (var movie in moviesList) {
        movie.replace(/['.]+/g, "").replace('and', ""); // normalize the string to get results more effectively
        getIMDBResults(movie, addMovieInfoToList); //Get the IMDB movie information for each video in the list
    }
}

//Add movie info from IMDB to the moviesList object

function addMovieInfoToList(data) {
    moviesListLength = Object.keys(moviesList);
    if (data.Response == 'False') {
        counter++;
    } else {
        var titles = data.Title.toLowerCase().replace(/["]+/g, '');
        counter++;
        moviesList[titles].plot = data.hasOwnProperty('Plot') ? data.Plot : '';
        moviesList[titles].score = data.tomatoMeter;
        moviesList[titles].poster = data.Poster;
        moviesList[titles].consensus = data.tomatoConsensus;
    }
    if (counter >= moviesListLength.length) { //A loop to stop once all the movies obtained
        sortMoviesByRating(moviesList); //from tasteKidAPI have been searched
    }
}

//Sort the movies according to their RottenTomatoes score

function sortMoviesByRating(list) {
    var movieNamesAndScores = {};
    var moviesWithNoScores = [];
    for (var movie in list) {
        if (list[movie].score == 'N/A') {
            moviesWithNoScores.push(movie);
        } else if (list[movie].plot === undefined) {
            delete moviesList[movie];
        } else {
            movieNamesAndScores[movie] = list[movie].score;
        }
    }
    sortedMoviesList = Object.keys(movieNamesAndScores).sort(function(a, b) {
        return movieNamesAndScores[a] - movieNamesAndScores[b];
    });
    sortedMoviesList.reverse();
    for (i = 0; i < moviesWithNoScores.length; i++) {
        sortedMoviesList.push(moviesWithNoScores[i]);
    }
    renderList();
}

//------
//Render the results and prep lightbox clicking
//------

function renderList() {
    $('.spinner').remove();
    var itemsToRender = [];
    for (i = 0; i < sortedMoviesList.length; i++) {
        upperName = sortedMoviesList[i].replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
        itemsToRender[i] = '<div class=\"movie-result-box\">' +
            '<div class=\"row\">' +
            '<div class=\"col\">' +
            '<span class=\"name-image-trailer-box\">' +
            '<h3>' + upperName + '</h3>' +
            '<img src=\"' + moviesList[sortedMoviesList[i]].poster + '\" alt=\"Movie Poster Image\">' +
            '<div><a id=\"lightbox_trigger\" href=' + moviesList[sortedMoviesList[i]].yUrl + '>Watch Trailer</a>  </div>' +
            '</span>' +
            '</div>' +
            '</div>' +
            '<div class=\"row\">' +
            '<div class=\"col\">' +
            '<span class=\"plot-score-box\">' +
            '<div>' + moviesList[sortedMoviesList[i]].plot + '</div>' +
            '<div>Crtic Consensus: "' + moviesList[sortedMoviesList[i]].consensus + '"</div>' +
            '<div>Rotten Score: ' + moviesList[sortedMoviesList[i]].score + '% </div>' +
            '</span>' +
            '</div>' +
            '</div>';
    }
    $('.search-results-area').html(itemsToRender);
    if (firstSearchPerformed === true) {
        $('.search-results-area').fadeIn("slow");
        $('.search-box-area p').empty();
        $('.search-box-area p').text('Here are some movies similar to ' + movieSearched + ', in order of their Rotten Tomatoes score:');
        searchButton();
        lightbox();
    } else {
        renderSearchArea();
        lightbox();
    }
}

//lightbox

function lightbox() {
    $('.search-results-area').on('click', '#lightbox_trigger', function(e) {
        e.preventDefault();
        var videoHref = $(this).attr("href");
        var lightbox =
            '<div id=\"lightbox\">' +
            '<p>Click to close</p>' +
            '<div id=\"content\">' +
            '<iframe width=\"450\" height=\"400\" src=\"' + videoHref + '\" frameborder=\"0\" allowfullscreen></iframe>' +
            '</div>' +
            '</div>';
        $('body').append(lightbox);
    });
    $('body').on('click', '#lightbox', function() {
        $('#lightbox').remove();
    });
}

//render the search area on the results page along with the results and prepare search button

function renderSearchArea() {
    $('.search-box-area').append(
        '<form class=\"search-form\" action=\"#\">' +
        '<input type=\"text\" class=\"ajax-search\" placeholder=\"Search Again\">' +
        '<button type=\"submit\" class=\"js-search-button\">Search</button>' +
        '</form>' +
        '<div class=\"js-search-results\"></div>' +
        '<p class=\"intro\">Here are some movies similar to ' + movieSearched + ', in order of their Rotten Tomatoes score:');
    $('.search-results-area').fadeIn('slow');
    $('.search-box-area').fadeIn('slow');
    firstSearchPerformed = true;
    searchButton();
}

function searchButton() {
    $('.search-box-area').unbind('click').on('click', '.js-search-button', function(e) {
        e.preventDefault();
        counter = 0;
        $('.search-results-area').fadeOut('slow');
        $('.search-results-area').empty();
        $('.error-msg').empty();
        for (var member in moviesList) delete moviesList[member];
        sortedMoviesList = [];
        var query = $('.search-form').find('.ajax-search').val();
        movieSearched = query.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
        getTasteKidResults(query, createMovieList);
    });
}
