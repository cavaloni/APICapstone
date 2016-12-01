#WatchTonight
Thinkful (https://www.thinkful.com/) API Capstone final project to integrate AJAX requests into a functional and useful web application.

![Screenshots](https://drive.google.com/uc?export=view&id=0B4WuvBhzCho_b0x6ZWU5Uk9MNVU)

##Introduction
WatchTonight is an easy way to search for a new movie to watch that you are likely to like. It does this by searching for similar movies to one that the user inputs using the TasteKid algorithm/API. It then takes all of these movies and grabs some info from IMDB to make just the pertinent information available to search for a good move to watch next, and sorts them by their Rotten Tomatos score.

##Use Case
This is most useful when you are really in the mood for a movie like that one particular movie you really like but have seen too many times. This will find all of the good movies similar to that and display them simply, easily and attractively.

##UX

Wireframes were made prior to any code being written. Some minimal user feedback was obtained through questions about the display and flow, though mostly this kind of feedback was obtained during the release of the minimum viable product useable wireframe.

The app has been tailored to fit mobile devices, as well as the Apple iPad. User feedback was obtained from different devices and the feedback was implemented in the final product. 

##Live Site
You can access the live site at https://cavaloni.github.io/WatchTonight/

##Technical
*The app uses two different API's and getJSON requests from each. These API's are from TasteKid and IMDB, the Internet Movie Database.
*The results from the TasteKid API are normalized using RegEx functions and then sent to IMDB API individually one by one in order to obtain a more precise set of information from the API.
*There are no external plug-in's or libraries used other than JQuery, which is used for some of the visual animations.
*The APP does rely heavily on the JQuery library for rendering most of the DOM elements used to display the results.
*The loading animation, as well as the lightbox are done by CSS from scratch.
*The background is manipulated via CSS as well and the color pallette is maintained throughout.
