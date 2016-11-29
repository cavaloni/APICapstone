var moviesList = {};
var sortedMoviesList = {};
var tasteKidAPI = 'https://www.tastekid.com/api/similar?callback=?';
var imdbAPI = 'http://www.omdbapi.com/?callback=?';


function keysToLowerCase(obj) {
    Object.keys(obj).forEach(function(key) {
        var k = key.toLowerCase();
        if (k !== key) {
            obj[k] = obj[key];
            delete obj[key];
        }
    });
    return (obj);
}

function getTasteKidResults(searchTerm, callback) {
    var params = {
        q: searchTerm,
        type: 'movies',
        info: 1,
        k: '248912-WatchTon-7SFM2O3H',
    };
    $.getJSON(tasteKidAPI, params, callback);
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

function sortMoviesByRating(list) {
    //(moviesList);
    //(list.bedazzled.yUrl);
    keysToLowerCase(list);
    var moviesListKeys = Object.keys(list);
    var moviesListKeysNames = moviesListKeys.map(function(elem) {
        var lower = elem.toLowerCase();
        return lower;
    });
    var currentHighScoreKey = moviesListKeys[0];
    var currentHighScore = list['evan almighty'].score;
    for (var movie in list) {
        var scores = movie.score;
        if (scores > currentHighScore) {
            currentHighScoreKey = moviesListKeys.indexOf(movie);
            //(moviesListKeys.indexOf(movie));
        }
    }
    //(currentHighScoreKey);
    //(currentHighScore);
    //(list.bedazzled.score);
}

function createMovieList(data) {
    for (i = 0; i < data.Similar.Results.length; i++) {
        var movieName = data.Similar.Results[i].Name;
        moviesList[data.Similar.Results[i].Name] = {};
        moviesList[data.Similar.Results[i].Name].yUrl = data.Similar.Results[i].yUrl;
    }
    //(moviesList);
    sortMoviesByRating(moviesList);
    wrapper();
}

function getDeferredRequests() {
        var keys = Object.keys(moviesList);
        var requests = [];
        var movieMovie = [];
        for (i = 0; i < keys.length; i++) {
            requests.push(getIMDBResults(keys[i], function(callback) {
                movieMovie.push(callback);
            }));
        }
        return requests;
    }

function wrapper () {
  //(moviesList);
  var deferreds = getDeferredRequests();
  //(deferreds);
  $.when.apply(null, deferreds).done(addMovieInfoToList(movieMovie));
}



function addMovieInfoToList(data) {
    //(moviesList);
    //(data);
    keysToLowerCase(moviesList);
    for (i = 0; i < data.length; i++) {
        var titles = data[i].Title.toLowerCase();
        //(titles);
        moviesList[titles].plot = data.Plot;
        moviesList[titles].score = data.tomatoMeter;
        moviesList[titles].poster = data.Poster;
        moviesList[titles].consensus = data.tomatoConsensus;
    }
    //(moviesList);
    sortMoviesByRating(moviesList);

}

function searchButton() {
    $('.js-search-button').on('click', function(e) {
        e.preventDefault();
        var query = $('.search-form').find('.ajax-search').val();
        getTasteKidResults(query, createMovieList);
    });
}

$(document).ready(searchButton());
