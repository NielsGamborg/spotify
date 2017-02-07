var app = angular.module('spotify', ['ngRoute']);

app.config(['$routeProvider', function($routeprovider) {
    $routeprovider
        .when('/top50', {
            template: '<top50-box show-track-data="showTrackData(trackid,tracks)" call-get-artist-data="callGetArtistData(artistid)"></top50-box>'
        })
        .when('/playlists', {
            template: '<playlists-box user-lists="userLists" user-obj="userObj" show-track-data="showTrackData(trackid,tracks)" call-get-artist-data="callGetArtistData(artistid)"></playlists-box>'
        })
        .when('/search', {
            template: '<search-box show-track-data="showTrackData(trackid,tracks)" call-get-artist-data="callGetArtistData(artistid)"></search-box>'
        })
        .when('/', {
            redirectTo: '/top50'
        })
        .otherwise({
            redirectTo: '/top50'
        });
}]);

/* Getting data from Spotify */
app.service('GetSpotifyData', function($http, SpinnerService) {
    return {
        getData: function(type, param1, param2, param3) {
            SpinnerService.setSpinner();
            if (type == "audiofeatures") {
                params = { 'trackids': param1 };
            }
            if (type == "search") {
                params = { 'query': param1, 'offset': param2 };
            }
            if (type == "toptracks" || type == "topartists") {
                params = { 'toptype': type, 'timerange': param1 };
            }
            if (type == "list") {
                params = { 'listid': param1, 'userid': param2, 'offset': param3 };
            }
            if (type == "artist") {
                params = { 'artistid': param1 };
            }
            return $http({
                method: 'GET',
                params: params,
                url: 'ajax.php'
            })

        }
    };
});


/* Merging 2 objects and adding a static index number to the merged objects */
app.service('MergeObjects', function() {
    return {
        merge: function(object1, object2) {
            extendedObjs = [];
            for (var i = 0; i < object1.length; i++) {
                if (object1[i].id === object2[i].id) {
                    tempObj = angular.extend({}, object1[i], object2[i], { staticIndex: i });
                    extendedObjs.push(tempObj);
                }
            }
            return extendedObjs;
        }
    };
});


app.service('SortData', function($http) {
    return {
        getSortParams: function(oldProperty, property, reverse) {
            if (oldProperty === property) {
                reverse = !reverse;
            } else {
                reverse = false;
            }
            return [{ reverse: reverse, sortProperty: property }]
        }
    };
});

app.service('SpinnerService', function($http) {
    return {
        setSpinner: function() {
            if (1 == 1) {
                angular.element("#spinner").show();
                angular.element("#overlay").fadeIn(200);
            }
        },
        closeSpinner: function() {
            angular.element("#spinner").hide();
            angular.element("#overlay").fadeOut(200);
        },
        openModal: function(modalId) {
            if (modalId == '#loginModal') {
                angular.element("#spinner").hide();
                angular.element("#overlay").removeClass('modalOverlay');
                angular.element("#overlay, " + modalId).fadeIn(400);
            } else {
                angular.element("#spinner").hide();
                angular.element(modalId).fadeIn(400);
                angular.element("#overlay").addClass('modalOverlay');
            }
        },
        closeModal: function() {
            angular.element("#overlay.modalOverlay,.dataModal").fadeOut(200);
            angular.element("#overlay.modalOverlay").removeClass('modalOverlay');
        }
    };
});


app.directive('spotifyWrapper', function() {
    return {
        restrict: 'E',
        scope: {
            loginTime: '@',
            userObj: '<',
            userLists: '<'
        },
        templateUrl: 'js/spotifywrapper.html',
        link: function(scope, element, attrs) {
            var activePage = angular.element(location).attr('hash').substring(2);
            if (activePage == "") {
                activePage = "top50";
            }
            angular.element(document).ready(function() {
                $('#show' + activePage).addClass('active');
            });
        },
        controller: function($scope, $timeout, GetSpotifyData, SpinnerService) {
            /* Getting track data out of the trackobjects to show in modal*/
            $scope.showTrackData = function(trackid, tracks) {
                SpinnerService.setSpinner();
                angular.forEach(tracks, function(value, key) {
                    if (trackid == value.id) {
                        $scope.track = value
                    }
                });
                SpinnerService.openModal("#trackModal");
                console.log("$scope.track", $scope.track);
            }

            /* Getting artist data on click to show in modal*/
            $scope.callGetArtistData = function(artistid) {
                SpinnerService.setSpinner();
                GetSpotifyData.getData("artist", artistid).then(function(response) {
                    $scope.artistsdata = response.data;
                    SpinnerService.openModal("#artistModal");
                }, function errorCallback(response) {
                    console.log("Error");
                });
            }

            /* Modal close etc*/
            $scope.closeModal = function() {
                SpinnerService.closeModal();
            }

            /* Menu */
            $scope.menu = function(page) {
                angular.element('#showtop50,#showplaylists,#showsearch').removeClass('active');
                angular.element('#' + page).addClass('active');
            }

            /* Watching the when accesstoken runs out */
            sessionStorage.setItem('loginTime', $scope.loginTime); // Saving login time to session storage to save if page is refreshed before accestoken runs out
            var checkLogin = function() {
                var loginTime = sessionStorage.getItem('loginTime') * 1000;
                var now = new Date().getTime();
                //console.log('Time since login: ', Math.floor((now - loginTime) / (1000 * 60)) + ' minutes');
                $timeout(function() {
                    if (now - loginTime > 3600000 && angular.element('#loginModal').is(":hidden")) {
                        SpinnerService.openModal("#loginModal");
                    }
                    checkLogin();
                }, 30000);
            };
            checkLogin();
        }
    }
});


app.directive('playlistsBox', function() {
    return {
        restrict: 'E',
        scope: {
            callGetArtistData: '&',
            showTrackData: '&',
            userLists: '<',
            userObj: '<'
        },
        templateUrl: 'js/playlists.html',
        controller: function($scope, GetSpotifyData, MergeObjects, SortData, SpinnerService) {
            /* Getting playlist tracks based on listid */
            $scope.callGetSpotifyData = function(offset, listid, listname) {
                $scope.offset = offset;
                if (listid) {
                    $scope.listid = listid;
                }
                if (listname) {
                    $scope.playlistName = listname;
                }
                if (!offset) {
                    index = 0;
                } else {
                    index = offset / 100;
                }
                GetSpotifyData.getData("list", $scope.listid, $scope.userObj.id, offset).then(function(response) {
                    tracksObj = response.data.items;
                    $scope.playlistTotal = response.data.total;
                    var trackids = "";
                    var tracksObjNew = [];
                    angular.forEach(tracksObj, function(value, key) {
                        trackids = trackids + value.track.id + ','; //	Getting track ids. 
                        tracksObjNew.push(value.track); // Getting trackObjects ready to merge			
                    });

                    GetSpotifyData.getData("audiofeatures", trackids).then(function(response) { // Getting Audio Features with track ids
                        auFeatObj = response.data.audio_features;
                        $scope.tracks = MergeObjects.merge(tracksObjNew, auFeatObj); //Sending objects to extend service to get tracks and audio features merged
                        SpinnerService.closeSpinner();
                        angular.element('#playlistNav li').removeClass('active'); // removing active class from playlistmenu						
                        angular.element('#' + $scope.listid).addClass('active'); //active class on clicked playlist
                    }, function errorCallback(response) {
                        console.log("Error", response);
                    });
                }, function errorCallback(response) {
                    console.log("Error");
                });
                $scope.selected = index; //using $index to control active class on playlist paging
            }
            if ($scope.userLists.length > 0) {
                $scope.callGetSpotifyData(0, $scope.userLists[0].id, $scope.userLists[0].name); // Calling function on load with user first playlist id and name
            }



            /* Sorting */
            $scope.propertyName = "";
            $scope.reverse = false;
            $scope.callSortBy = function(property) {
                $scope.sortData = SortData.getSortParams($scope.propertyName, property, $scope.reverse);
                $scope.propertyName = $scope.sortData[0].sortProperty;
                $scope.reverse = $scope.sortData[0].reverse;
            }

        }
    }
});



app.directive('top50Box', function() {
    return {
        restrict: 'E',
        scope: {
            showTrackData: '&',
            callGetArtistData: '&'
        },
        templateUrl: 'js/top50.html',
        controller: function($scope, GetSpotifyData, MergeObjects, SortData, SpinnerService) {
            if (!$scope.top50type) {
                $scope.top50type = 'toptracks';
            }

            /* Getting all table data for top50 tables */
            $scope.callGetSpotifyData = function(type, range) {
                $scope.top50type = type;
                if (range) {
                    $scope.range = range;
                } else {
                    $scope.range = "short_term";
                }

                GetSpotifyData.getData(type, range).then(function(response) {
                    if ($scope.top50type == "toptracks") {
                        tracksObj = response.data.items;
                        var trackids = "";
                        angular.forEach(tracksObj, function(value, key) { //	Getting track ids
                            trackids = trackids + value.id + ',';
                        });
                        GetSpotifyData.getData("audiofeatures", trackids).then(function(response) {
                            auFeatObj = response.data.audio_features;
                            $scope.tracks = MergeObjects.merge(tracksObj, auFeatObj); //Sending objects to extend service to get toptraks merged		
                            SpinnerService.closeSpinner();
                        }, function errorCallback(response) {
                            console.log("Error", response);
                        });
                    } else {
                        topartistsRaw = response.data.items;
                        $scope.topartists = [];
                        angular.forEach(topartistsRaw, function(value, key) {
                            var tempObj = angular.extend({}, value, { staticIndex: key }); // extending the tracks objects with a static indexnumber
                            $scope.topartists.push(tempObj); // Artist objects ready to use in template					
                        });
                        SpinnerService.closeSpinner();
                    }
                }, function errorCallback(response) {
                    console.log("Error");
                });
            }
            $scope.callGetSpotifyData($scope.top50type);

            /* Sorting */
            $scope.propertyName = "";
            $scope.reverse = false;
            $scope.callSortBy = function(property) {
                $scope.sortData = SortData.getSortParams($scope.propertyName, property, $scope.reverse);
                $scope.propertyName = $scope.sortData[0].sortProperty;
                $scope.reverse = $scope.sortData[0].reverse;
            }

        }
    }
});


app.directive('searchBox', function() {
    return {
        restrict: 'E',
        scope: {
            showTrackData: '&',
            callGetArtistData: '&'
        },
        templateUrl: 'js/search.html',
        controller: function($scope, GetSpotifyData, MergeObjects, SortData, SpinnerService) {
            /* Getting search result */
            $scope.callGetSpotifyData = function(query, offset) {
                if (typeof offset == "undefined" || offset > -1) { //checking if offset is NOT negative to prevent negative paging
                    $scope.offset = offset;
                    GetSpotifyData.getData("search", query, offset).then(function(response) {
                        $scope.searchObj = response.data.tracks;
                        $scope.totalResults = $scope.searchObj.total;
                        tracksObj = response.data.tracks.items;
                        var trackids = "";
                        angular.forEach(tracksObj, function(value, key) { //	Getting track ids
                            trackids = trackids + value.id + ',';
                        });
                        GetSpotifyData.getData("audiofeatures", trackids).then(function(response) {
                            auFeatObj = response.data.audio_features;
                            $scope.tracks = MergeObjects.merge(tracksObj, auFeatObj); //Sending objects to extend service to get toptraks merged
                            SpinnerService.closeSpinner();
                        }, function errorCallback(response) {
                            console.log("Error", response);
                        });
                    }, function errorCallback(response) {
                        console.log("Error", response);
                    });
                }
            }

            /* Sorting */
            $scope.propertyName = "";
            $scope.reverse = false;
            $scope.callSortBy = function(property) {
                $scope.sortData = SortData.getSortParams($scope.propertyName, property, $scope.reverse);
                $scope.propertyName = $scope.sortData[0].sortProperty;
                $scope.reverse = $scope.sortData[0].reverse;
            }


        }
    }
});



app.directive('loginBox', function() {
    return {
        restrict: 'E',
        scope: {
            loginUrl: '@'
        },
        templateUrl: 'js/login.html',
        controller: function($scope) {
            console.log('$scope.loginUrl', $scope.loginUrl);
        }
    }
});


/* Animated scroll directive */
app.directive('smoothScroll', function() {
    return {
        restrict: 'A',
        scope: {},
        template: '{{ text }}',
        link: function($scope, element, attrs) {
            $scope.text = attrs.scrolltext;
            element.on('click', function() {
                $('html,body').animate({ scrollTop: $(attrs.scrolltarget).offset().top }, 400); //html for Firefox, body for Chrome and IE
            });
        },
        controller: function($scope) {}
    }
});


/* Filter to translate integer to musical key */
app.filter('keyFilter', function() {
    return function(keyInt) {
        var keyArray = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "G♯", "A", "B♭", "B"];
        var output = keyArray[keyInt];
        return output;
    }
});

/* Filter to make time range human readable */
app.filter('rangeFilter', function() {
    return function(range) {
        var translation;
        if (range == "short_term") {
            translation = "the last 4 weeks"
        }
        if (range == "medium_term") {
            translation = "the last 6 months"
        }
        if (range == "long_term") {
            translation = "the last couple of years"
        }
        return translation;
    }
});