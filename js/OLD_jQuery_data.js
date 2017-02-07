	/* Old javascript file from the first Spotify Appp version 1.0 written in jquery. Not in use anymore */

	function getTop() {
	    /*Getting user*/
	    if (resultUser.id) {
	        var userName = resultUser.id;
	        var playlistsString;
	        /* Making playlists */
	        if (resultPlaylists.items.length > 0) {
	            playlistsString = "<ul>";
	            for (var i = 0; i < resultPlaylists.items.length; i++) {
	                //console.log('resultPlaylists.items[i].owner.id: ',resultPlaylists.items[i].owner.id);
	                if (resultPlaylists.items[i].owner.id == userName) { //checking it's not a spotify or another users playlist
	                    var listName = resultPlaylists.items[i].name;
	                    var listId = resultPlaylists.items[i].id;
	                    var tracksTotal = resultPlaylists.items[i].tracks.total;
	                    playlistsString += "<li data-listId='" + listId + "'>" + listName + "</li>";
	                }
	            }
	            playlistsString += "</ul>";
	        } else {
	            playlistsString = "<p class='alert'>Husk at kun dine offentlige playlister vises her i appen! Åben din Spotify app og publicér de playlister, du gerne vil se data for.</p>"
	        }

	        /* DOM Insertions  */
	        $('#userName').html(userName);
	        $('#playlistNav').html(playlistsString);
	    }
	}



	$(document).ready(function() {

	    google.charts.load('current', { 'packages': ['table'] }); //Setting up Google charts

	    $("#timerangeForm").change(function() {
	        if ($('#showTracks').hasClass('active')) {
	            $('#showTracks').trigger('click');
	        } else {
	            $('#showArtists').trigger('click');
	        }

	    });

	    getTop();

	    /**********************************************************************    Top 50   ****************************************************************************/

	    $("#showTracks,#showArtists").click(function() {
	        $("#spinner,#overlay").show();
	        var topType = $(this).attr("data-page");
	        var timerange = $(".timerangeSelect").val();
	        $.ajax({
	            url: "ajax.php",
	            method: "GET",
	            data: { "toptype": topType, "timerange": timerange }
	        }).done(function(data) {
	            if (!data) {
	                location.reload();
	            }
	            if (topType == "tracks") {
	                var top50Obj = JSON.parse(data);

	                var trackIds = ""
	                for (var i = 0; i < top50Obj.items.length; i++) { //collecting the id of all the tracks to request for AUdio features
	                    trackIds += top50Obj.items[i].id + ",";
	                }
	                $.ajax({ //New Ajax call inside Ajax call to get Audio Features with multiple ID's
	                    url: "ajax.php",
	                    method: "GET",
	                    data: { "trackids": trackIds }
	                }).done(function(data) {
	                    sendTop50TrackData(data); // Using function to send data to control the timing
	                });

	                function sendTop50TrackData(afdata) {
	                    makeTop50TracksTable(data, afdata);
	                }
	            } else {
	                makeTop50ArtistsTable(data);
	                //console.log("JSON.parse(data)",JSON.parse(data));
	            }
	        });
	    });


	    /*  Top 50 Tracks table*/
	    function makeTop50TracksTable(trackData, audioFeatureData) {

	        //Setting up vars for stats
	        var popularityTotal = 0;
	        var popularityTotal10 = 0;
	        var tempoTotal = 0;
	        var tempoTotal10 = 0;
	        var energyTotal = 0;
	        var energyTotal10 = 0;
	        var valenceTotal = 0;
	        var valenceTotal10 = 0;
	        var danceabilityTotal = 0;
	        var danceabilityTotal10 = 0;
	        var majorTotal = 0;
	        var majorTotal10 = 0;

	        var top50TracksObj = JSON.parse(trackData);
	        var audioFeatureObj = JSON.parse(audioFeatureData);
	        var top50TrackTableArray = [];
	        for (var i = 0; i < top50TracksObj.items.length; i++) {
	            var no = i + 1;
	            var title = top50TracksObj.items[i].name;
	            var url = top50TracksObj.items[i].external_urls.spotify;
	            var titleString = "<a href='" + url + "'>" + title + "</a>";
	            var artistSort = top50TracksObj.items[i].artists[0].name; /* For sorting purpose */
	            var artistsString = ""; //reseting artist before new loop
	            for (var j = 0; j < top50TracksObj.items[i].artists.length; j++) {
	                var artist = top50TracksObj.items[i].artists[j].name;
	                var artistsString = artistsString + "<span class='nobreak link' data-artistid='" + top50TracksObj.items[i].artists[j].id + "'>" + artist + "</span>";
	                if (j + 1 < top50TracksObj.items[i].artists.length) {
	                    artistsString += ", "
	                }
	            }
	            var popularity = top50TracksObj.items[i].popularity;
	            popularityTotal += popularity;
	            var id = top50TracksObj.items[i].id;
	            var more = "<span data-trackName=\"" + title + "\" data-trackId='" + id + "'> + </span>";

	            var audioFeature = audioFeaturesHelper(audioFeatureObj.audio_features[i]); //calling helper function for Audio Features
	            var tempo = audioFeature.tempo;
	            tempoTotal += tempo;
	            var rawKey = audioFeature.rawKey
	            var key = audioFeature.key;
	            var mode = audioFeature.mode;
	            if (mode != 'm') {
	                majorTotal++;
	            }
	            var energy = audioFeature.energy;
	            energyTotal += energy;
	            var valence = audioFeature.valence;
	            valenceTotal += valence;
	            var danceability = audioFeature.danceability;
	            danceabilityTotal += danceability;


	            if (i < 10) { //Counting for Top 10 Stats
	                popularityTotal10 = popularityTotal10 + popularity;
	                tempoTotal10 = tempoTotal10 + tempo;
	                energyTotal10 = energyTotal10 + energy;
	                danceabilityTotal10 = danceabilityTotal10 + danceability;
	                valenceTotal10 = valenceTotal10 + valence;
	                if (audioFeatureObj.audio_features[i].mode == 1) {
	                    majorTotal10++
	                }

	            }

	            var tempArray = [no, { v: title, f: titleString }, { v: artistSort, f: artistsString }, { v: popularity, f: popularity + '%' }, tempo, { v: rawKey, f: key },
	                { v: energy, f: energy + '%' }, { v: valence, f: valence + '%' }, { v: danceability, f: danceability + '%' },
	                more
	            ];
	            top50TrackTableArray.push(tempArray);
	        }


	        google.charts.setOnLoadCallback(drawTop50TracksTable);

	        function drawTop50TracksTable() {
	            var data = new google.visualization.DataTable();
	            data.addColumn('number', 'Nr');
	            data.addColumn('string', 'Titel');
	            data.addColumn('string', 'Kunstnere');
	            data.addColumn('number', 'Popularitet');
	            data.addColumn('number', 'Tempo');
	            data.addColumn('number', 'Tone');
	            data.addColumn('number', 'Energi');
	            data.addColumn('number', 'Positiv');
	            data.addColumn('number', 'Dans');
	            data.addColumn('string', 'Mere');


	            data.addRows(top50TrackTableArray);

	            var top50TracksTable = new google.visualization.Table(document.getElementById('topTracks'));
	            top50TracksTable.draw(data, {
	                showRowNumber: false,
	                width: '100%',
	                height: '100%',
	                allowHtml: true,
	                sortColumn: 0
	            });


	            showAudioFeatures('#topTracks table tr td:last-child');
	            showArtistsData('#topTracks table tr td:nth-child(3) span');
	            $("#spinner,#overlay").hide();

	            /* Re-adding click events to table after sort */
	            google.visualization.events.addListener(top50TracksTable, 'sort', selectHandlerToptracks);

	            function selectHandlerToptracks(e) {
	                showAudioFeatures('#topTracks table tr td:last-child');
	                showArtistsData('#topTracks table tr td:nth-child(3) span');
	            }
	        }

	        /* Stats for Top 50 tracks */
	        popularityTotal = Math.round(popularityTotal / top50TracksObj.items.length);
	        popularityTotal10 = Math.round(popularityTotal10 / 10);
	        tempoTotal = Math.round(tempoTotal / top50TracksObj.items.length);
	        tempoTotal10 = Math.round(tempoTotal10 / 10);
	        energyTotal = Math.round(energyTotal / top50TracksObj.items.length);
	        energyTotal10 = Math.round(energyTotal10 / 10);
	        valenceTotal = Math.round(valenceTotal / top50TracksObj.items.length);
	        valenceTotal10 = Math.round(valenceTotal10 / 10);
	        danceabilityTotal = Math.round(danceabilityTotal / top50TracksObj.items.length);
	        danceabilityTotal10 = Math.round(danceabilityTotal10 / 10);
	        majorTotal = majorTotal + "/" + (top50TracksObj.items.length - majorTotal);
	        majorTotal10 = majorTotal10 + "/" + (10 - majorTotal10);

	        var statsTopArray = []
	        var statsTop10Array = ["Top 10 Tracks", { v: popularityTotal10, f: popularityTotal10 + '%' }, tempoTotal10, { v: energyTotal10, f: energyTotal10 + '%' }, { v: valenceTotal10, f: valenceTotal10 + '%' }, { v: danceabilityTotal10, f: danceabilityTotal10 + '%' }, majorTotal10];
	        var statsTop50Array = ["Top 50 Tracks", { v: popularityTotal, f: popularityTotal + '%' }, tempoTotal, { v: energyTotal, f: energyTotal + '%' }, { v: valenceTotal, f: valenceTotal + '%' }, { v: danceabilityTotal, f: danceabilityTotal + '%' }, majorTotal];
	        statsTopArray.push(statsTop10Array);
	        statsTopArray.push(statsTop50Array);

	        google.charts.setOnLoadCallback(drawStatsTrackTable);

	        function drawStatsTrackTable() {
	            var data = new google.visualization.DataTable();
	            data.addColumn('string', 'Gennemsnit for');
	            data.addColumn('number', 'Popularitet');
	            data.addColumn('number', 'Tempo');
	            data.addColumn('number', 'Energi');
	            data.addColumn('number', 'Positivitet');
	            data.addColumn('number', 'Dansevenlighed');
	            data.addColumn('string', 'Dur/mol');


	            data.addRows(statsTopArray);

	            var top50StatsTable = new google.visualization.Table(document.getElementById('averageTop'));
	            top50StatsTable.draw(data, {
	                showRowNumber: false,
	                width: '100%',
	                height: '100%',
	                sort: 'disable',
	                sortColumn: 0
	            });

	            $("#spinner,#overlay").hide();
	        }
	        //console.log("tracksObj",tracksObj);							
	    }



	    /*  Top 50 artists table */
	    function makeTop50ArtistsTable(artistData) {
	        var top50ArtistObj = JSON.parse(artistData);
	        var top50ArtistsTableArray = [];
	        for (var i = 0; i < top50ArtistObj.items.length; i++) {
	            var no = i + 1;
	            var artist = top50ArtistObj.items[i].name;
	            var url = top50ArtistObj.items[i].external_urls.spotify;
	            var artistString = "<a href='" + url + "'>" + artist + "</a>";
	            var popularity = top50ArtistObj.items[i].popularity;
	            var followers = top50ArtistObj.items[i].followers.total;
	            var genres = ""; // reset string
	            for (var j = 0; j < top50ArtistObj.items[i].genres.length; j++) {
	                genres = genres + "<span class='nobreak'>" + top50ArtistObj.items[i].genres[j] + "</span>";
	                if (j + 1 < top50ArtistObj.items[i].genres.length) {
	                    genres = genres + ", "
	                }
	            }
	            var tempArray = [no, { v: artist, f: artistString }, genres, { v: popularity, f: popularity + '%' }, followers];
	            top50ArtistsTableArray.push(tempArray);
	        }

	        google.charts.setOnLoadCallback(drawTop50ArtistTable);

	        function drawTop50ArtistTable() {
	            var data = new google.visualization.DataTable();
	            data.addColumn('number', 'Nr');
	            data.addColumn('string', 'Kunstner');
	            data.addColumn('string', 'Genrer');
	            data.addColumn('number', 'Popularitet');
	            data.addColumn('number', 'Followers');


	            data.addRows(top50ArtistsTableArray);

	            var top50ArtistsTable = new google.visualization.Table(document.getElementById('topArtists'));
	            top50ArtistsTable.draw(data, {
	                showRowNumber: false,
	                width: '100%',
	                height: '100%',
	                allowHtml: true,
	                sortColumn: 0
	            });

	            $("#spinner,#overlay").hide();
	        }
	        //console.log("tracksObj",tracksObj);
	        //console.log("audioFeatureObj",audioFeatureObj);				

	    }



	    /***********************************************************************  PLAYLISTS    *********************************************************************/

	    /* Get users playlist data on click */
	    $("#playlistNav ul li").click(function() {
	        $("#spinner,#overlay").show();
	        $("#playlistNav li").removeClass('active');
	        $('#audioFeaturesPopUp').hide();
	        $(this).addClass('active');
	        var listName = $(this).html();
	        var userId = resultUser.id;
	        var listId = $(this).attr("data-listId");
	        $('#playlisth2').html(listName);
	        $.ajax({
	            url: "ajax.php",
	            method: "GET",
	            data: { "listid": listId, "userid": userId }
	        }).done(function(data) {
	            /* This one is causing eternal reloads??? */
	            if (!data) {
	                location.reload();
	            };
	            var listTracksObj = JSON.parse(data);
	            var trackIds = ""
	            for (var i = 0; i < listTracksObj.items.length; i++) { //collecting the id of all the tracks to request for AUdio features
	                trackIds += listTracksObj.items[i].track.id + ",";
	            }
	            $.ajax({ //New Ajax call inside Ajax call to get Audio Features with multiple ID's
	                url: "ajax.php",
	                method: "GET",
	                data: { "trackids": trackIds }
	            }).done(function(data) {
	                //console.log("DATATA", data);
	                sendPlaylistData(data);
	            });

	            function sendPlaylistData(afdata) { // Using function to send data to control the timing
	                makePlaylistPaging(data);
	                makePlaylistTable(data, afdata);
	            }

	        });
	    });

	    /* Playlist paging */
	    $("#playlistPaging").on("click", '.pageLink', function() {
	        $("#spinner,#overlay").show();
	        $("#playlistPaging .pageLink").removeClass('active');
	        $('#audioFeaturesPopUp').hide();
	        $(this).addClass('active');
	        $listpage = $(this).text();
	        $.ajax({
	            url: "ajax.php",
	            method: "GET",
	            data: { "listpage": $listpage - 1 }
	        }).done(function(data) {
	            if (!data) {
	                location.reload();
	            }
	            var listTracksObj = JSON.parse(data);
	            var trackIds = ""
	            for (var i = 0; i < listTracksObj.items.length; i++) { //collecting the id of all the tracks to request for AUdio features
	                trackIds += listTracksObj.items[i].track.id + ",";
	            }
	            $.ajax({ //New Ajax call inside Ajax call to get Audio Features with multiple ID's
	                url: "ajax.php",
	                method: "GET",
	                data: { "trackids": trackIds }
	            }).done(function(data) {
	                sendPlaylistData(data);
	            });

	            function sendPlaylistData(afdata) {
	                makePlaylistTable(data, afdata);
	            }
	        });
	    });

	    /* Playlist paging making buttons */
	    function makePlaylistPaging(trackdata) {
	        var tracksObj = JSON.parse(trackdata);
	        $('#playlisth2 span').html("");
	        $('#playlisth2').append(" <span class='fontweightNormal'>(" + tracksObj.total + " tracks)</span>");
	        var playlistPagingHtml = "";
	        for (var j = 0; j < tracksObj.total; j += 100) {
	            if (j == 0) {
	                playlistPagingHtml += "<div class='pageLink active'>" + ((j / 100) + 1) + "</div>"
	            } else {
	                playlistPagingHtml += "<div class='pageLink'>" + ((j / 100) + 1) + "</div>"
	            }
	        }
	        $('#playlistPaging').html(playlistPagingHtml);
	    }


	    /* Playlists table. Processing data and setting up table */
	    function makePlaylistTable(trackdata, audioFeaturedata) {
	        var tracksObj = JSON.parse(trackdata);
	        var audioFeatureObj = JSON.parse(audioFeaturedata);
	        //console.log('tracksObj',tracksObj);
	        var playlistTableArray = [];

	        //Setting up vars for stats
	        var popularityTotal = 0;
	        var tempoTotal = 0;
	        var energyTotal = 0;
	        var valenceTotal = 0;
	        var danceabilityTotal = 0;
	        var majorTotal = 0;

	        for (var i = 0; i < tracksObj.items.length; i++) {
	            var no = i + 1 + tracksObj.offset;
	            var title = tracksObj.items[i].track.name;
	            var id = tracksObj.items[i].track.id;
	            var titleUrl = "https://open.spotify.com/track/" + id;
	            var titleString = "<a href='" + titleUrl + "'>" + title + "</a>";
	            var popularity = tracksObj.items[i].track.popularity;
	            popularityTotal += popularity;
	            var more = "<span data-trackName=\"" + title + "\" data-trackId='" + id + "'> + </span>";
	            var artistId = tracksObj.items[i].track.artists[0].id;
	            var firstArtist = tracksObj.items[i].track.artists[0].name; // Used for sorting on artist
	            var trackArtists = ""; // reseting artist before new loop 
	            for (var j = 0; j < tracksObj.items[i].track.artists.length; j++) {
	                var artist = tracksObj.items[i].track.artists[j].name;
	                trackArtists = trackArtists + "<span class='nobreak link' data-artistid='" + tracksObj.items[i].track.artists[j].id + "'>" + artist + "</span>";
	                if (j + 1 < tracksObj.items[i].track.artists.length) {
	                    trackArtists += ", "
	                }
	            }
	            var audioFeature = audioFeaturesHelper(audioFeatureObj.audio_features[i]); //calling helper function for Audio Features
	            var tempo = audioFeature.tempo;
	            tempoTotal += tempo;
	            var rawKey = audioFeature.rawKey
	            var key = audioFeature.key;
	            var mode = audioFeature.mode;
	            if (mode != 'm') {
	                majorTotal++;
	            }
	            var energy = audioFeature.energy;
	            energyTotal += energy;
	            var valence = audioFeature.valence;
	            valenceTotal += valence;
	            var danceability = audioFeature.danceability;
	            danceabilityTotal += danceability;

	            var tempArray = [no, { v: title, f: titleString }, { v: firstArtist, f: trackArtists }, { v: popularity, f: popularity + '%' },
	                audioFeature.tempo, { v: audioFeature.rawKey, f: audioFeature.key },
	                { v: audioFeature.energy, f: audioFeature.energy + '%' }, { v: audioFeature.valence, f: audioFeature.valence + '%' },
	                { v: audioFeature.danceability, f: audioFeature.danceability + '%' },
	                more
	            ];
	            playlistTableArray.push(tempArray)
	        }

	        google.charts.setOnLoadCallback(drawPlaylistTable);

	        function drawPlaylistTable() {
	            var data = new google.visualization.DataTable();
	            data.addColumn('number', 'Nr');
	            data.addColumn('string', 'Title');
	            data.addColumn('string', 'Kunstnere');
	            data.addColumn('number', 'Popularitet');
	            data.addColumn('number', 'Tempo');
	            data.addColumn('number', 'Tone');
	            data.addColumn('number', 'Energi');
	            data.addColumn('number', 'Positiv');
	            data.addColumn('number', 'Dans');
	            data.addColumn('string', 'Mere');

	            data.addRows(playlistTableArray);

	            var playlistTable = new google.visualization.Table(document.getElementById('playlistTracks'));
	            playlistTable.draw(data, {
	                showRowNumber: false,
	                width: '100%',
	                height: '100%',
	                allowHtml: true,
	                sortColumn: 0
	            });

	            $("#spinner,#overlay").hide();
	            showAudioFeatures('#playlistTracks table tr td:last-child');
	            showArtistsData('#playlistTracks table tr td:nth-child(3) span');

	            /* Re-adding click events to table after sort */
	            google.visualization.events.addListener(playlistTable, 'sort', selectHandlerPlaylist);

	            function selectHandlerPlaylist(e) {
	                showAudioFeatures('#playlistTracks table tr td:last-child');
	                showArtistsData('#playlistTracks table tr td:nth-child(3) span');
	            }
	        }




	        /* Stats for playlist tracks */
	        popularityTotal = Math.round(popularityTotal / tracksObj.items.length);
	        tempoTotal = Math.round(tempoTotal / tracksObj.items.length);
	        energyTotal = Math.round(energyTotal / tracksObj.items.length);
	        valenceTotal = Math.round(valenceTotal / tracksObj.items.length);
	        danceabilityTotal = Math.round(danceabilityTotal / tracksObj.items.length);
	        majorTotal = majorTotal + "/" + (tracksObj.items.length - majorTotal);

	        /* Calculating numbers of the tracks covered by the stats */
	        var tracksCoveredStart = (1 + tracksObj.offset); // + "-" +  (tracksObj.offset + 100); 
	        var tracksCoveredEnd = ""
	        if (tracksCoveredStart + 99 < tracksObj.total) {
	            tracksCoveredEnd = tracksCoveredStart + 99;
	        } else {
	            tracksCoveredEnd = (tracksCoveredStart) + (tracksObj.total - tracksCoveredStart);
	        }
	        var tracksCovered = tracksCoveredStart + "-" + tracksCoveredEnd;

	        /* Making array and table */
	        var statsArray = [
	            ["For track " + tracksCovered, { v: popularityTotal, f: popularityTotal + '%' }, tempoTotal, { v: energyTotal, f: energyTotal + '%' },
	                { v: valenceTotal, f: valenceTotal + '%' }, { v: danceabilityTotal, f: danceabilityTotal + '%' },
	                majorTotal
	            ]
	        ];
	        google.charts.setOnLoadCallback(drawStatsTrackTable);

	        function drawStatsTrackTable() {
	            var data = new google.visualization.DataTable();
	            data.addColumn('string', 'Gennemsnit');
	            data.addColumn('number', 'Popularitet');
	            data.addColumn('number', 'Tempo');
	            data.addColumn('number', 'Energi');
	            data.addColumn('number', 'Positivitet');
	            data.addColumn('number', 'Dansevenlighed');
	            data.addColumn('string', 'Dur/mol');


	            data.addRows(statsArray);

	            var playlistStatsTable = new google.visualization.Table(document.getElementById('averagePlaylist'));
	            playlistStatsTable.draw(data, {
	                showRowNumber: false,
	                width: '100%',
	                height: '100%',
	                sort: 'disable',
	                sortColumn: 0
	            });

	            $("#spinner,#overlay").hide();
	        }




	    }





	    /**********************************************************************    SEARCH    **************************************************************************/

	    /* Get Search result data on click */
	    $("#searchButton").click(function() {
	        if ($("#query").val() != '') {
	            $("#spinner,#overlay").show();
	            var searchString = $("#query").val();
	            $.ajax({
	                url: "ajax.php",
	                method: "GET",
	                data: { "query": searchString }
	            }).done(function(data) {
	                if (!data) {
	                    location.reload();
	                }
	                var searchResObj = JSON.parse(data);
	                var trackIds = ""
	                for (var i = 0; i < searchResObj.tracks.items.length; i++) { //collecting the id of all the tracks to request for AUdio features
	                    trackIds += searchResObj.tracks.items[i].id + ",";
	                }
	                $.ajax({ //New Ajax call inside Ajax call to get Audio Features with multiple ID's
	                    url: "ajax.php",
	                    method: "GET",
	                    data: { "trackids": trackIds }
	                }).done(function(data) {
	                    sendSearchResData(data); // Using function to send data to control the timing
	                });

	                function sendSearchResData(afdata) {
	                    makeSearchResTable(data, afdata);
	                    //console.log("searchResObj ",searchResObj);
	                }
	            });
	        }
	    });


	    /* Running search on enter */
	    $("#searchContainer").keypress(function(event) {
	        if (event.which == 13) {
	            $("#searchButton").click();
	        }
	    });


	    /* Get Search result data on paging */
	    $("#searhResPagingTop,#searhResPagingBottom").on("click", 'button', function() {
	        $("#spinner,#overlay").show();
	        var searchUrl = $(this).attr("data-searchurl");
	        if (searchUrl) {
	            $.ajax({
	                url: "ajax.php",
	                method: "GET",
	                data: { "searchurl": searchUrl }
	            }).done(function(data) {
	                if (!data) {
	                    location.reload();
	                }
	                var searchResObj = JSON.parse(data);
	                var trackIds = ""
	                for (var i = 0; i < searchResObj.tracks.items.length; i++) { //collecting the id of all the tracks to request for AUdio features
	                    trackIds += searchResObj.tracks.items[i].id + ",";
	                }
	                $.ajax({ //New Ajax call inside Ajax call to get Audio Features with multiple ID's
	                    url: "ajax.php",
	                    method: "GET",
	                    data: { "trackids": trackIds }
	                }).done(function(data) {
	                    sendSearchResData(data);
	                });

	                function sendSearchResData(afdata) {
	                    makeSearchResTable(data, afdata);
	                }
	            });
	        }
	    });

	    /* Searchresult table. Processing data and setting up table */
	    function makeSearchResTable(trackdata, audioFeaturedata) {
	        var tracksObj = JSON.parse(trackdata);
	        var audioFeatureObj = JSON.parse(audioFeaturedata);
	        var previousUrl = tracksObj.tracks.previous;
	        var nextUrl = tracksObj.tracks.next;
	        var prevButtonHtml = "<button class='prevButn' data-searchUrl='" + previousUrl + "'>Previously</button>";
	        var nextButtonHtml = "<button class='nexButn' data-searchUrl='" + nextUrl + "'>Next</button>";
	        if (!previousUrl) {
	            prevButtonHtml = "<button class='prevButn inactive' >Previously</button>";
	        }
	        if (!nextUrl) {
	            nextButtonHtml = "<button class='nextButn inactive' >Next</button>";
	        }
	        var searchResTableArray = [];
	        for (var i = 0; i < tracksObj.tracks.items.length; i++) {
	            var no = i + 1 + tracksObj.tracks.offset;
	            var title = tracksObj.tracks.items[i].name;
	            var id = tracksObj.tracks.items[i].id;
	            var titleUrl = "https://open.spotify.com/track/" + id;
	            var titleString = "<a href='" + titleUrl + "'>" + title + "</a>";
	            var popularity = tracksObj.tracks.items[i].popularity;
	            var id = tracksObj.tracks.items[i].id;
	            var more = "<span data-trackName=\"" + title + "\" data-trackId='" + id + "'> + </span>";

	            var audioFeature = audioFeaturesHelper(audioFeatureObj.audio_features[i]); //calling helper function 
	            var firstArtist = tracksObj.tracks.items[i].artists[0].name; // Used for sorting artists
	            var trackArtists = ""; // reseting artist before new loop 			
	            for (var j = 0; j < tracksObj.tracks.items[i].artists.length; j++) {
	                var artist = tracksObj.tracks.items[i].artists[j].name;
	                trackArtists = trackArtists + "<span class='nobreak link' data-artistid='" + tracksObj.tracks.items[i].artists[j].id + "'>" + artist + "</span>";
	                if (j + 1 < tracksObj.tracks.items[i].artists.length) {
	                    trackArtists += ", "
	                }
	            }
	            var tempArray = [no, { v: title, f: titleString }, { v: firstArtist, f: trackArtists }, { v: popularity, f: popularity + '%' },
	                audioFeature.tempo, { v: audioFeature.rawKey, f: audioFeature.key },
	                { v: audioFeature.energy, f: audioFeature.energy + '%' }, { v: audioFeature.valence, f: audioFeature.valence + '%' },
	                { v: audioFeature.danceability, f: audioFeature.danceability + '%' },
	                more
	            ];

	            searchResTableArray.push(tempArray)
	        }
	        google.charts.setOnLoadCallback(drawSearchResTable);

	        function drawSearchResTable() {
	            var data = new google.visualization.DataTable();
	            data.addColumn('number', 'Nr');
	            data.addColumn('string', 'Titel');
	            data.addColumn('string', 'Kunstnere');
	            data.addColumn('number', 'Popularitet');
	            data.addColumn('number', 'Tempo');
	            data.addColumn('number', 'Tone');
	            data.addColumn('number', 'Energi');
	            data.addColumn('number', 'Positiv');
	            data.addColumn('number', 'Dans');
	            data.addColumn('string', 'Mere');

	            data.addRows(searchResTableArray);

	            var searchResTable = new google.visualization.Table(document.getElementById('searchResult'));
	            searchResTable.draw(data, {
	                showRowNumber: false,
	                width: '100%',
	                height: '100%',
	                allowHtml: true,
	                sortColumn: 0
	            });

	            $("#spinner,#overlay").hide();
	            $('#searhResPagingTop').html(prevButtonHtml + nextButtonHtml);
	            $('#searhResPagingBottom').html(prevButtonHtml + nextButtonHtml);
	            showAudioFeatures('#searchResult table tr td:last-child');
	            showArtistsData('#searchResult table tr td:nth-child(3) span');

	            /* Re-adding click events to table after sort */
	            google.visualization.events.addListener(searchResTable, 'sort', selectHandlerSearch);

	            function selectHandlerSearch(e) {
	                showAudioFeatures('#searchResult table tr td:last-child');
	                showArtistsData('#searchResult table tr td:nth-child(3) span');
	            }
	        }
	        //console.log("tracksObj",tracksObj);
	    }





	    /****************************************************************  Audio Features and Artits Data at click   ************************************************************/


	    /* Helper Function for processing Audio Features Data */
	    function audioFeaturesHelper(x) {
	        var audioFeatureObj = x;
	        var keyArray = ["C", "C&#9839;", "D", "E&#9837;", "E", "F", "F&#9839;", "G", "G&#9839;", "A", "B&#9837;", "B"];
	        var key = keyArray[audioFeatureObj.key];
	        var mode = "";
	        if (audioFeatureObj.mode === 0) {
	            mode = "m";
	        }
	        var audioFeatureMYObj = {
	                tempo: Math.round(audioFeatureObj.tempo),
	                energy: Math.round(audioFeatureObj.energy * 100),
	                valence: Math.round(audioFeatureObj.valence * 100),
	                danceability: Math.round(audioFeatureObj.danceability * 100),
	                rawKey: audioFeatureObj.key,
	                key: key + mode,
	                mode: mode
	            }
	            //console.log("audioFeatureMYObj ",audioFeatureMYObj)												
	        return audioFeatureMYObj;
	    }


	    /* Getting and showing Audio Features at Click*/
	    function showAudioFeatures(elem) {
	        $(elem).click(function(event) {
	            event.stopPropagation(); //preventing 'close' click to bubble through to window click listener to remove active class
	            $('#audioFeaturesPopUp,#artistDataPopUp').hide();
	            $(elem).parent().removeClass('active'); // Removing active class from tr	
	            $("#pages td span.link.active").removeClass('active'); // Removing active class from artist span		
	            $(this).parent().addClass('active');
	            var trackId = $(this).children().attr("data-trackId");
	            var trackName = $(this).children().attr("data-trackName");
	            var audioFeaturesHtml = "";
	            $.ajax({
	                url: "ajax.php",
	                method: "GET",
	                data: { "trackid": trackId },
	                error: function(xhr, status, error) {
	                    alert(xhr.responseText);
	                },

	            }).done(function(data) {
	                if (!data) {
	                    location.reload();
	                }
	                audioFeaturesObj = JSON.parse(data);
	                var timeSignature = audioFeaturesObj.time_signature + "/4";
	                var loudness = audioFeaturesObj.loudness;
	                var speechiness = audioFeaturesObj.speechiness;
	                var acousticness = audioFeaturesObj.acousticness;
	                var instrumentalness = audioFeaturesObj.instrumentalness;
	                var liveness = audioFeaturesObj.liveness;

	                /* PopupHTML */
	                audioFeaturesHtml = "<thead><tr><th colspan='2'>" + trackName + "</th></tr></thead>" +
	                    "<tr><td>Time signature</td><td>" + timeSignature + "</td></tr>" +
	                    "<tr><td>Loudness</td><td>" + loudness + " dB</td></tr>" +
	                    "<tr><td>Speechiness</td><td>" + speechiness + "</td></tr>" +
	                    "<tr><td>Acousticness</td><td>" + acousticness + "</td></tr>" +
	                    "<tr><td>Instrumentalness</td><td>" + instrumentalness + "</td></tr>" +
	                    "<tr><td>Liveness</td><td>" + liveness + "</td></tr></tbody>";

	                $('#audioFeaturesTable').html(audioFeaturesHtml);
	                $('#audioFeaturesPopUp').fadeIn(200);

	            });
	            var position = $(this).offset();
	            $('#audioFeaturesPopUp').css({ "top": (position.top + 35) + "px", "left": (position.left - 308) + "px" });

	        });
	    }


	    /* Getting and showing Artist Genres and popularity at Click*/
	    function showArtistsData(elem) {
	        $(elem).click(function(event) {
	            event.stopPropagation(); //preventing click to bubble through to window click listener to remove active class
	            $('#artistDataPopUp,#audioFeaturesPopUp').hide();
	            $(elem).parent().parent().removeClass('active'); // Removing active class from tr	
	            $(elem).removeClass('active'); // Removing active class from artist span
	            $(this).addClass('active');
	            var artistId = $(this).attr("data-artistid");
	            var artistDataHtml = "";
	            $.ajax({
	                url: "ajax.php",
	                method: "GET",
	                data: { "artistid": artistId },
	            }).done(function(data) {
	                if (!data) {
	                    location.reload();
	                }
	                artistDataObj = JSON.parse(data);
	                var name = artistDataObj.name;
	                var popularity = artistDataObj.popularity;
	                var genreString = "";
	                //console.log("artistDataObj", artistDataObj);
	                for (var i = 0; i < artistDataObj.genres.length; i++) {
	                    genreString += artistDataObj.genres[i];
	                    if (i + 1 < artistDataObj.genres.length) {
	                        genreString += ", "
	                    }
	                }

	                artistDataHtml = "<thead><tr><th colspan='2'>" + name + "</th></tr></thead>" +
	                    "<tbody><tr><td>Popularity</td><td>" + popularity + "%</td></tr>" +
	                    "<tr><td>Genres</td><td>" + genreString + "</td></tr></tbody>";

	                $('#artistDataTable').html(artistDataHtml);
	                $('#artistDataPopUp').fadeIn(200);

	            });
	            var position = $(this).offset();
	            $('#artistDataPopUp').css({ "top": (position.top + 25) + "px", "left": (position.left - 315) + "px" });

	        });
	    }


	    /* Closing Audio Feature and Artist Data pop up  */
	    $("#audioFeaturesPopUp .hidePopUp, #artistDataPopUp .hidePopUp").click(function(event) {
	        $('#audioFeaturesPopUp,#artistDataPopUp').fadeOut(100);
	        $("tr.active, tr .link.active").removeClass('active');
	    });


	    /* Preventing window click inside the PopUp*/
	    $("#audioFeaturesPopUp, #artistDataPopUp").click(function(event) {
	        event.stopPropagation();
	    });

	    /* Closing Data PopUps on click outside the PopUp */
	    $(window).click(function() {
	        $('#audioFeaturesPopUp,#artistDataPopUp').fadeOut(100);
	        $("tr.active, tr .link.active").removeClass('active');
	    });





	    /**********************************************************************  Menu - Tabs  *************************************************************************/




	    /* Tabs */
	    $("#tabs li a").click(function() {
	        var timerange = $(".timerangeSelect").val();
	        var linkText = $(this).html();
	        $('#audioFeaturesPopUp, #artistDataPopUp, .topTracks,.topArtists,.playLists,.search,#timerangeForm').hide();
	        $("#tabs li a").removeClass('active');
	        if (linkText.indexOf('Tracks') !== -1) {
	            page = "showTracks";
	            $('.topTracks,#timerangeForm').show();
	            $("#showTracks").addClass('active');
	        }
	        if (linkText.indexOf('Artists') !== -1) {
	            page = "showArtists";
	            $('.topArtists,#timerangeForm').show();
	            $("#showArtists").addClass('active');
	        }
	        if (linkText.indexOf('Playlists') !== -1) {
	            page = "showPlaylists";
	            $('.playLists').show();
	            $("#showPlaylists").addClass('active');
	            $("#playlistNav>ul>li:first-child").trigger('click');
	        }
	        if (linkText.indexOf('Søg') !== -1) {
	            page = "showSearch";
	            $('.search').show();
	            $("#showSearch").addClass('active');
	        }
	        $.ajax({
	            url: "ajax.php",
	            method: "GET",
	            data: { "page": page, "timerange": timerange }
	        });
	    });


	    /*   Showing page on load   */
	    var htmlPage = "#" + page;
	    $("#" + page).addClass('active');

	    $('.topArtists,.playLists,.topTracks,.search,#timerangeForm').hide();
	    if (page == "showTracks") {
	        $('.topTracks,#timerangeForm').show();
	        $('#showTracks').trigger('click');
	    }
	    if (page == "showArtists") {
	        $('.topArtists,#timerangeForm').show();
	        $('#showArtists').trigger('click');
	    }
	    if (page == "showPlaylists") {
	        $('.playLists').show();
	        setTimeout(function() {
	            $("#playlistNav>ul>li:first-child").trigger('click');
	        }, 10);
	    }
	    if (page == "showSearch") {
	        $('.search').show();
	        $('#searchButton').trigger('click');
	        $('.backTopLink.top').hide();
	    }



	    /* Tabs when logged out  */
	    $("#tabsOut li a").click(function() {
	        $("#loginReminder").slideToggle(200);
	    });


	    /* Show / Hide stats */
	    $(".showHideStats > span").click(function() {
	        $('#averagePlaylist,#averageTop,.showHideStats > span').toggle();
	    });



	});