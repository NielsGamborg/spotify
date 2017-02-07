<?php

// App name: spotify test
// App description: a test of the spotify API
//Client ID: 9e8cd001ead7439e8350c3195dc20add
//Client Secret: 504d73b1b6be44bf84fc7b37ec135494	

$clientId = "9e8cd001ead7439e8350c3195dc20add";
$clientSecret = "504d73b1b6be44bf84fc7b37ec135494";
$responseType = "code";
$redirectUri = urlencode("http://localhost/spotify/index.php");
$scope = urlencode("user-top-read");



// Create a stream
/*$opts = array(
  'http'=>array(
    'method'=>"GET",
    'header'=>"Host: api.spotify.com\r\n" .
"Accept: application/json\r\n" .
"Content-Type: application/json\r\n" .
"Accept-Encoding: gzip, deflate, compress\r\n" .
"Authorization: Bearer BQB9cTROTRf0ounFLa7Z_6jCcQgdceyTLsepEgIEp4x5djvMZsfVSw-lBdgPyAle8p7WylOzdzxpKgDM6_B0iacwl9uFUjomAdqpFlwupUfgQJ0vcv4hzu2Jx1X2pchCieOFwOgD086NDOUtXsJaT-DIm4_kI_0U7u8BYDKEQJjVodQ79dgETRVq7YDOYS9HAQ \r\n" .
"User-Agent: Spotify API Console v0.1\r\n" 
  )
);*/

$opts = array(
  'http'=>array(
    'method'=>"GET",
    'header'=>" \r\n"

  )
);

$context = stream_context_create($opts);

// Open the file using the HTTP headers set above		 	
$url = "https://accounts.spotify.com/authorize/?client_id=" . $clientId . "&response_type=" . $responseType . "&redirect_uri=" . $redirectUri . "&scope=" . $scope ; 

$result = @file_get_contents($url,false,$context);

//$json = json_decode($result,true);
			
?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Spotify login</title>
	
	<link type="text/css" href="spotify.css" rel="stylesheet">
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
	
    <script type="text/javascript">	
	
	var result = "<?=$result ?>";
	
	
		
		//document.getElementById('topTracks').innerHTML = tableString;

		console.log("result",result);
		//console.log("result.items",result.items);
		//console.log("result.items[0]",result.items[0]);
		//console.log("result",result.items.album);
		//console.log("result.items[1].name",result.items[1].name);
	}
	  
	</script>

	
</head>
<body onload="getTopTracks()">
	<div id="wrapper">
		<h1>Spotify Login</h1>
		
		<?=$url ?>
		
		<form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="get">
			
			<input type="submit" value="Go">
		</form>
		
		<div id="content">

			<table id="topTracks">
				
			</table>
		</div>		
		<a href="#" onclick="$('#varDump').toggle();return false">Show Var dump</a>
		
		
		<?php
			
			echo "<div id='varDump' style='display:block'>";
			
			if($result !=''){
				var_dump(json_decode($result, true));
			}
			
			echo "</div>";
			
		?>	
			
	
	</div>
</body>
</html>	