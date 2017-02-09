<?php
	session_start();
	
	/* Getting access token */
	if (isset($_SESSION['accessToken'])) {
	  $accessToken = ($_SESSION['accessToken']);
	}
	
	/* Getting top 50 tracks or artists */
	if (isset($_GET["toptype"])){
		if (isset($_GET["toptype"])){
			$topType = $_GET["toptype"];
			$_SESSION["toptype"] = $topType;
		}else{
			$topType = "topartists";
		}	
		
		if(isset($_GET["timerange"]) && $_GET["timerange"] != ""){
			$timeRange = ($_GET["timerange"]);
			//$_SESSION["timerange"] = $timeRange;
		}else{
			$timeRange = "short_term";				
		}
		
		$options = array(
		  'http'=>array(
			'method'=>"GET",
			'header'=>"Authorization: Bearer " . $accessToken . "\r\n"
		  )
		);
		// Create a stream
		$context = stream_context_create($options);

		if($topType=="toptracks"){
			$urlTop50 = "https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=" . $timeRange; 
		}else{	
			$urlTop50 = "https://api.spotify.com/v1/me/top/artists?limit=50&time_range=" . $timeRange; 
		}
		
		$resultTop50 = @file_get_contents($urlTop50,false,$context);
		echo $resultTop50;
		
	}
	
	
	/* Getting tracks from Spotify playlists */
	if(isset($_GET["listid"]) || isset($_GET["userid"]) || isset($_GET["listpage"])){
		if(isset($_GET["listid"])){
			$listId = $_GET["listid"];
			$_SESSION["listid"] = $listId;			
		}else{
			$listId = $_SESSION["listid"] ;
		}	
		if(isset($_GET["userid"])){
			$userId = $_GET["userid"];
			$_SESSION["userid"] = $userId;
		}else{
			$userId = $_SESSION["userid"];
		}		
		if(isset($_GET["offset"])){
			$offset = $_GET["offset"];
		}else{
			$offset = 0;
		}
		
	
		$options = array(
		  'http'=>array(
			'method'=>"GET",
			'header'=>"Authorization: Bearer " . $accessToken . "\r\n"
		  )
		);
		
		// Create a stream
		$context = stream_context_create($options);	

		// Open the file using the HTTP headers set above	
		$urlListTracks = "https://api.spotify.com/v1/users/" . $userId . "/playlists/" . $listId . "/tracks/?limit=100&offset=" . $offset; 
		
		$resultListTracks = @file_get_contents($urlListTracks,false,$context);	
		echo $resultListTracks;	
				
		
	}
	
	/* Getting artist data from Spotify */	
	if(isset($_GET["artistid"])){	
		$artistId = $_GET["artistid"];
	
		$options = array(
		  'http'=>array(
			'method'=>"GET",
			'header'=>"Authorization: Bearer " . $accessToken . "\r\n"
		  )
		);
		
		// Create a stream
		$context = stream_context_create($options);	

		// Open the file using the HTTP headers set above		
		$urlArtistData = "https://api.spotify.com/v1/artists/" . $artistId;  
		$resultArtistData = @file_get_contents($urlArtistData,false,$context);
		
		echo $resultArtistData;			
	} 
		
	
	/* Getting audio features for multiple ID's */		
	if(isset($_GET["trackids"])){	
		$trackIds = $_GET["trackids"];
		
		$options = array(
		  'http'=>array(
			'method'=>"GET",
			'header'=>"Authorization: Bearer " . $accessToken . "\r\n"
		  )
		);
		
		// Create a stream
		$context = stream_context_create($options);		
		$urlAudioFeaturesMulti = "https://api.spotify.com/v1/audio-features/?ids=" . $trackIds;  
		$resultAudioFeaturesMulti = @file_get_contents($urlAudioFeaturesMulti,false,$context);

		echo $resultAudioFeaturesMulti;
	
	}

	
	
	
	/* Search */
	if(isset($_GET["query"]) || isset ($_GET["searchurl"])){	
		$query = "";
		$offset = 0;
		if(isset($_GET["offset"])){
			$offset = $_GET["offset"];
		} 
		
		$urlSearch = "";
		if(isset($_GET["query"])){
			$query = urlencode($_GET["query"]);
			$urlSearch = "https://api.spotify.com/v1/search/?type=track&q=" . $query . "&offset=" . $offset; 
			$_SESSION["query"] = $query;
						
		}
		
		if(isset($_GET["searchurl"])){
			$urlSearch = $_GET["searchurl"];
			$_SESSION["searchurl"] = $urlSearch;
		}
	
		$options = array(
		  'http'=>array(
			'method'=>"GET",
			'header'=>"Authorization: Bearer " . $accessToken . "\r\n" // Authorization gives different search result because local market parameter is included 
		  )
		);		
		// Create a stream
		$context = stream_context_create($options);	
		
		$resultSearch = @file_get_contents($urlSearch,false,$context);
		echo $resultSearch;
		

		//var_dump($resultSearch);
		//var_dump(json_decode($resultSearch, true));
	}	
			
	
?>