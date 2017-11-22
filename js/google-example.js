/**
 * Customise product click throughs here
 */
var STANDARD_BANNER_URL = 'http://playground.xyz';
var SUPER_SKIN_HERO_URL = 'http://playground.xyz';

/** ************************ DO NOT EDIT BELOW **************************/
var superSkin = new xyz.superSkin({
  version: 2
});
var docs = superSkin.docs;

var bannerClickUrl = xyzContext.tokens.bannerClick || STANDARD_BANNER_URL;
var fullscreenClickUrl = xyzContext.tokens.fullscreenClick || SUPER_SKIN_HERO_URL;
/** ************************ DO NOT EDIT ABOVE **************************/

var API_KEY = "AIzaSyAkaBFESkhK3w_hwoprEYDTmy2hmRfm4aA";

// You can convert a CSV file like this:
// ... to a downloadable JSON file using this form
// include it below as MAP_LOCATIONS_OBJECT to create a list-populated map. No need to include SEARCH_TERMS.

// var MAP_LOCATIONS_OBJECT = {};

// Array of searches

var SEARCH_TERMS = [{
  name: "",
  type: "",
  keyword: "pub",
  pinURL: "https://assets.playground.xyz/robt/pin2.png_288256ab",
  required: [],
  excluded: []
}];





// Works out what you are using to create your locations - search or list...

var locationSource = function() {
  if (typeof MAP_LOCATIONS_OBJECT !== 'undefined' && MAP_LOCATIONS_OBJECT !== "") {
    return 'LIST';
  } else if (typeof SEARCH_TERMS !== 'undefined' && SEARCH_TERMS !== "") {
    return 'SEARCH';
  } else {
    console.log('You must supply SEARCH_TERMS or a processed MAP_LOCATIONS_OBJECT');
  }
}();

// Create some global variables to load Google API objects into for re-use in different functions. Not certain this is completely necessary, but there it is.
var googleAPIScriptLoaded = false;
var map;
var service;
var infowindow;
var geocoder;

// variables used for map rendering
var userLocation = {};
var zoneBounds;
var searches;
var mapLocations = []; // container for processed location objects, which will be used to generate map markers

// div elements below will be defined as the ad parts are available (docs.hero, docs.expand)
var resetButton;
var mapDivID;
var tickerDiv;
var tickerContainer;
var storeNames;
var tickerPosition = 0;
var tickerInterval;
var deviceWidth = $(window).width();

// couple of flags for later use
var markerClicksActive = false;
var locationReset = false;

// get the Maps API script using our API Key
function loadAPI() {
  if (!googleAPIScriptLoaded) {
    var url = "https://maps.googleapis.com/maps/api/js?key=" + API_KEY + "&libraries=places";
    $.getScript(url, function() {
      console.log('SCRIPT LOADED');
      // let's do this...
      runMap();
      googleAPIScriptLoaded = true;
    });
  } else {
    runMap();
  }
}

function runMap() {
  geocoder = new google.maps.Geocoder();

  if (navigator.geolocation) {

    $.post("https://www.googleapis.com/geolocation/v1/geolocate?key=" + API_KEY, function(data) {
      console.log('USER GENERAL LOCATION');
      // sendTrackingEvent(false, "User Located");
      userLocation.lat = data.location.lat;
      userLocation.lng = data.location.lng;
      userLocation.latLng = function() {
        return new google.maps.LatLng(this.lat, this.lng);
      };
      // render the map - we'll update it with markers, change location etc, as needed

      initMap();
      // Get details about user general location
      getAddress(userLocation, function(results, status) {
        console.log('USER GENERAL LOCATION: CITY LAT LONG', results);
        userLocation.capCity = results.city;
        userLocation.state = results.state;

        if (locationSource === 'LIST') {
          runList();
        } else if (locationSource === 'SEARCH') {
          searches = SEARCH_TERMS;
          runSearch();
        }

      });

    }); // end post

  } else {
    // geolocation off, alert user
    alert('Unable to retrieve your geolocation from browser, please enable your browser location services');
  }

}

function getAddress(location, callback) {
  // geocoder already defined
  var address = {};
  var capitalCities = {
    'NSW': {
      lat: -33.8479715,
      lng: 150.6510829
    },
    'QLD': {
      lat: -27.470701,
      lng: 153.023396
    },
    'VIC': {
      lat: -37.9712304,
      lng: 144.4913007
    },
    'SA': {
      lat: -35.0004435,
      lng: 138.3303075
    },
    'TAS': {
      lat: -42.8823399,
      lng: 147.3197753
    },
    'WA': {
      lat: -32.0388251,
      lng: 115.3996863
    },
    'NT': {
      lat: -12.4258916,
      lng: 130.8630971
    },
    'ACT': {
      lat: -35.2813043,
      lng: 149.1204231
    }
  };
  geocoder.geocode({
    'location': location.latLng()
  }, function(results, status) {
    if (status === 'OK') {
      if (results !== "") {
        console.log("GEOCODE RESULTS", results);
        var state = results[0].address_components[4].short_name;
        address.state = state;
        address.city = capitalCities[state];
      } else {
        address.state = "";
        address.city = "";
      }

    } else { // Geocoder failed
      console.log('Geocoder failed due to: ' + status);
    }
    callback(address, status);
  });
}

// function render the map. userLocation global variable is dynamic and gets updated a few times in the course of this script...

function initMap() {
  infowindow = new google.maps.InfoWindow();
  zoneBounds = new google.maps.Circle({
    center: userLocation,
    radius: 15000
  }).getBounds();

  var noPoi = [{
    featureType: "poi",
    stylers: [{
      visibility: "off"
    }]
  }];
  map = new google.maps.Map(mapDiv[0], {
    zoom: 12, // zoom gets reset to 14 on superSkin.expand (essential for making map the :focus so user can immediately interact with it...)
    center: userLocation,
    mapTypeControl: false,
    streetViewControl: false,
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.LEFT_BOTTOM
    },
    styles: noPoi
  });
  map.setCenter(userLocation);
  console.log('map', map);
}


function runSearch() {
  // reset global mapLocations in case this is not the first time the search has been run
  mapLocations = [];
  var service = new google.maps.places.PlacesService(map);

  // searches is an array of searches, in case you need different-styled marker pins on the map

  searches.forEach(function(search, index) {

    // construct callback dynamically for each search in the array, this gets run at nearbySearch below...

    var searchCallback = function(results, status) {
      console.log('Search: "' + searches[index].name + '"" successful');
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        // VALIDATE search results using the search REQUIRED and EXCLUDED fields - see validate() below
        var validResults = validate(results, searches[index]);
        // add pinURL to each result
        validResults.forEach(function(result) {
          result.pinURL = searches[index].pinURL;
        });
        mapLocations.push.apply(mapLocations, validResults);
      } else {
        console.log('Search callback - search wasnt successful');
      }
      // if this is the last search that needs to be run/validated
      if (index === searches.length - 1) {
        // console.log('VALID MAP LOCATIONS', mapLocations);
        // render mapLocations to the map
        render(mapLocations);
      }
    };

    // add boundary to the search (using global zoneBounds - same area for all searches)
    search.bounds = zoneBounds;
    // now run the search with
    service.nearbySearch(search, searchCallback);
  });
}

function validate(results, searchTerms) {

  var searchResults = $.extend(true, [], results);

  if (searchTerms.required !== undefined && searchTerms.required.length > 0) {
    // Flag locations not containing required text for removal
    searchResults.forEach(function(result, index) {
      console.log('Checking ' + (index + 1) + '/' + searchResults.length + ' ' + result.name);
      var validResults = [];
      var invalids = 0;
      var remove = false;
      searchTerms.required.forEach(function(term) {
        if (result.name.indexOf(term) == -1) {
          console.log(term + " did not match " + result.name);
          invalids++;
        } else {
          console.log(term + " matched " + result.name);
        }
      });
      // console.log('invalids', invalids,'required terms length', searchTerms.required.length)
      if (invalids >= searchTerms.required.length) {
        // tag item for removal
        result.remove = true;
      }

    });
  } else {
    console.log('searchTerms.required is undefined. All results will be marked as valid');
  }

  if (searchTerms.excluded !== undefined && searchTerms.excluded.length > 0) {
    // Flag locations containing excluded text for removal
    searchTerms.excluded.forEach(function(term) {
      if (result.name.indexOf(term) >= 1) {
        console.log(term + " was found in " + result.name + ". Will remove.");
        result.remove = true;
      }
    });
  } else {
    console.log('excludedTerms.required is undefined. All results will be marked as valid');
  }

  // remove all invalids

  searchResults = searchResults.filter(function(item) {
    // console.log(item.remove);
    return !("remove" in item);
  });

  // newly filtered results
  searchResults.forEach(function(validResult, index) {
    var loc = createLocationFromSearch(validResult);
    searchResults.splice(index, 1, loc);
  });

  return searchResults;
}

function createLocationFromSearch(searchResult) {
  var locationObject = {};
  location.placeId = searchResult.place_id;
  locationObject.location = searchResult.geometry.location;
  locationObject.lat = searchResult.geometry.location.lat();
  locationObject.lng = searchResult.geometry.location.lng();
  locationObject.name = searchResult.name;
  locationObject.vicinity = searchResult.vicinity;
  return locationObject;
}

// working with a LIST is much simpler. We know our locations. We also know they are valid. So we just populate the map with markers.

function runList() {
  $.getJSON(MAP_LOCATIONS_OBJECT, function(data) {
    mapLocations = data;
    render(mapLocations);
  });
}

// Whichever method you use to build your your global mapLocations, here is where they are rendered to the map as markers!!
// we also set up the ticker in the Super Skin

function render(locationsArray) {
  // Create markers
  locationsArray.forEach(function(locationObject) {
    locationObject.latLng = function() {
      return new google.maps.LatLng(this.lat, this.lng);
    };
    locationObject.marker = createMarker(locationObject);
  });

  console.log('Markers are on map');

  // reorder Location proximity for ticker
  locationsArray.forEach(function(locationObject) {
    locationObject.userDistance = function() {
      return google.maps.geometry.spherical.computeDistanceBetween(this.latLng(), userLocation.latLng());
    };
  });
  locationsArray.sort(function(a, b) {
    return a.userDistance() - b.userDistance();
  });

  // console.log('SORTED LOCATIONS', locationsArray);

  map.setCenter(locationsArray[0].location);
  google.maps.event.trigger(locationsArray[0].marker, 'click');
  markerClicksActive = true;

  // sendTrackingEvent(false, "Locations Loaded");

  // mpa rendered, now make ticker in Super Skin hero

  makeTicker('ticker', locationsArray);
}

function createMarker(locationObj) {
  var image = {
    url: locationObj.pinURL,
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(20, 40),
    scaledSize: new google.maps.Size(40, 40)
  };

  var html = '<p style="text-align: center;">' + locationObj.name + '</p><p style="text-align: center;"><a class="get-directions-click" href="https://maps.google.com/?saddr=Current+Location&daddr=' + locationObj.vicinity + '" target="_blank" onclick="sendTrackingEvent(true, \'Get Directions Click\')">Get directions</a>';

  var marker = new google.maps.Marker({
    map: map,
    position: locationObj.location,
    icon: image
  });

  // add an infowindow to the marker object

  google.maps.event.addListener(marker, 'click', function() {
    if (markerClicksActive) {
      sendTrackingEvent(true, 'Map Marker Clicked');
    }
    infowindow.setContent(html);
    infowindow.open(map, this);
  });

  // add the marker to the location

  return marker;
}

function makeTicker(tickerID, locations) {

  tickerDiv = $('#' + tickerID, docs.hero);
  tickerContainer = tickerDiv.find('#ticker-container');
  storeNames = tickerDiv.find('.store-names');

  // console.log(tickerDiv, tickerContainer, storeNames);

  var placeLimit = 99;

  // Make a long strip of ticker locations. CSS will make this a horizontal list with non-wrapping text

  mapLocations.forEach(function(location, index) {
    if (index > placeLimit) {
      return;
    } else {
      storeNames.append('<li>' + location.name  + '</li>');
    }
  });
  tickerDiv.transition({
    y: '-100%'
  }, 500);

  if (mapLocations.length > 1) {
    // if there's more than one location, set the ticker going infinitely
    // refresh storenames jQuery object
    tickerWidth = tickerContainer.width();
    appendDistance = (tickerWidth - deviceWidth) * -1;
    setTimeout(function() {
      // console.log('we tickin');
      tickerInterval = setInterval(ticker, 30);
    }, 1500);
  }
}

// set Interval to update ticker position

function ticker() {
  tickerPosition--;
  tickerContainer.css('transform', 'translateX(' + tickerPosition + 'px)');
  //         console.log(tickerPosition, appendDistance);
  if (tickerPosition <= (appendDistance + 50)) {
    //       console.log('Clone storenames');
    storeNames.clone().appendTo(tickerContainer);
    appendDistance -= (tickerWidth - 50);
  }
}

function resetTicker() {
  tickerPosition = 0;
  tickerContainer.css('transform', 'translateX(' + tickerPosition + 'px)');
  // haven't bothered resetting appendDistance - cloned storenames remain
}

// User clicks resetButton to share actual location

function resetLocation() {
  markerClicksActive = false;
  locationReset = true;
  // sendTrackingEvent(true, "Reset Location");

  if (!navigator.geolocation) {
    // console.log("Geolocation is not supported by your browser");
    return;
  }

  function success(position) {

    //       alert('USER GEO LOCATION SUCCESS' + position.coords.latitude + ', ' + position.coords.longitude);
    console.log('USER SHARED POSITION', position);
    userLocation.lat = position.coords.latitude;
    userLocation.lng = position.coords.longitude;

    if (locationSource === 'LIST') {
      render(mapLocations);
    } else {
      runSearch();
    }
    resetButton.css('display', 'none');
  }

  function error(error) {

    //       alert('USER GEO LOCATION FAILED - NOT SHARED');

    resetButton.css('display', 'none');

    console.log('navigation.geolocation ERROR(' + error.code + '): ' + error.message);
    if (error.code === 1 && (userLocation.state !== undefined)) {
      // sets user location to capital city and runs the map anyway
      console.log('USER LOCATION REQUEST DENIED, DEFAULTING TO CAPITAL CITY (userLocation.capCity)');
      console.log(userLocation);
      userLocation.lat = userLocation.capCity.lat;
      userLocation.lng = userLocation.capCity.lng;
      if (locationSource === 'LIST') {
        render(mapLocations);
      } else {
        runSearch();
      }
    } else {
      // sendTrackingEvent(false, "Reset Location Failed");
      // alert user
      alert("Sorry, unable to retrieve your location");
    }
  }

  navigator.geolocation.getCurrentPosition(success, error);

}

superSkin.on('banner', function() {
  superSkin.clickArea($('body', docs.banner), bannerClickUrl, 'Banner click');
});




superSkin.on('launch', function() {

  // Set up hero frame to launch full screen container on click.
  superSkin.expandArea($('body', docs.hero), 'top', 'hero');

  // to get ticker working, we have to load the map into the superSkin.hero, hidden

  mapDiv = $('#googlemap', docs.hero);
  loadAPI();

});

superSkin.on('fullscreenExpandEnd', function() {

});

superSkin.on('fullscreenExpandBegin', function() {

});

superSkin.on('fullscreenExpandEnd', function() {

  // define reset button and set click to reset location
  resetButton = $('#getLocation', docs.expand);
  $('#getLocation', docs.expand).click(resetLocation);

  // MOVE map from superSkin Hero to Expanded Frame
  var mapHero = $('#googlemap', docs.hero);
  $('#fullscreen-container', docs.expand).append(mapHero);

  // Click area for fullscreen frame
  superSkin.clickArea($('.cta', docs.expand), fullscreenClickUrl, 'Fullscreen click');

  // important: sets focus to map on expand
  setTimeout(function() {
    map.setZoom(14);
  }, 1000);

});

superSkin.init({
  fullscreenOpts: {
    foregroundColor: '#fff',
    backgroundColor: '#000'
  }
});

//# sourceURL=dynamicScript.js
