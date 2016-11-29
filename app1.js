//Global Variables
var moviesList = {};
var sortedMoviesList = [];
var tasteKidAPI = 'https://www.tastekid.com/api/similar?callback=?';
var imdbAPI = 'http://www.omdbapi.com/?callback=?';
var counter = 0;

//String/title modifiers
function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

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

//---------
//The guts: Getting search results from TasteKid, then requesting those movies in IMDB,
//then rendering the results to the page.
function searchButton() {
    $('.js-search-button').on('click', function(e) {
        e.preventDefault();
        counter = 0;
        $('.search-results-area').empty();
        for (var member in moviesList) delete moviesList[member];
        sortedMoviesList = [];
        var query = $('.search-form').find('.ajax-search').val();
        getTasteKidResults(query, createMovieList);
    });
}

function createMovieList(data) {
    if (data.Similar.Info[0].Type == 'unknown') {
        alert('No movies found. Please try a different search.');
    } else {
        for (i = 0; i < data.Similar.Results.length; i++) {
            data.Similar.Results[i].Name = data.Similar.Results[i].Name.trim();
            data.Similar.Results[i].Name = data.Similar.Results[i].Name.replace(/[&]+/g, "and");
            data.Similar.Results[i].Name = data.Similar.Results[i].Name.toLowerCase();
        }
        for (i = 0; i < data.Similar.Results.length; i++) {
            var movieName = data.Similar.Results[i].Name;

            moviesList[data.Similar.Results[i].Name] = {};
            moviesList[data.Similar.Results[i].Name].yUrl = data.Similar.Results[i].yUrl;
        }
        for (var movie in moviesList) {
            movie.replace(/['.]+/g, "");
            movie.replace('and', "");
            getIMDBResults(movie, addMovieInfoToList);
        }
    }
}

function addMovieInfoToList(data) {
    if (data.Response == "False") {
        counter++;
    } else {
        var titles = data.Title.toLowerCase().replace(/["]+/g, '');
        counter++;
        moviesListLength = Object.keys(moviesList);
        moviesList[titles].plot = data.Plot;
        moviesList[titles].score = data.tomatoMeter;
        moviesList[titles].poster = data.Poster;
        moviesList[titles].consensus = data.tomatoConsensus;
    }
    if (counter >= moviesListLength.length) {
        sortMoviesByRating(moviesList);
    }
}

function sortMoviesByRating(list) {
    var movieNamesAndScores = {};
    var moviesWithNoScores = [];
    for (var movie in list) {
        if (list[movie].score == "N/A") {
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

function renderList() {
    var itemsToRender = [];
    for (i = 0; i < sortedMoviesList.length; i++) {
        upperName = sortedMoviesList[i].replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        itemsToRender[i] = '<div class=\"movie-result-box\">' +
            '<span class=\"name-image-trailer-box\">' +
            '<div>' + upperName + '</div>' +
            '<img src=\"' + moviesList[sortedMoviesList[i]].poster + '\" alt=\"Movie Poster Image\">' +
            '<div><a href=' + moviesList[sortedMoviesList[i]].yUrl + '>Trailer Link</a>  </div>' +
            '</span>' +
            '<span class=\"plot-score-box\">' +
            '<div>' + moviesList[sortedMoviesList[i]].plot + '</div>' +
            '<div>Crtic Consensus: "' + moviesList[sortedMoviesList[i]].consensus + '"</div>' +
            '<div>Rotten Score: ' + moviesList[sortedMoviesList[i]].score + '% </div>' +
            '</span>';
    }
    $('.search-results-area').html(itemsToRender);
}

$(document).ready(searchButton());
