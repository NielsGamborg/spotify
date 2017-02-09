<?php

session_start();

include 'config.php';

$loggedIn = false;
$responseType = "code";
$scope = urlencode("user-top-read");
$grantType = "authorization_code";

$loginurl = "https://accounts.spotify.com/authorize/?client_id=" . $clientId . "&response_type=" . $responseType . "&redirect_uri=" . $redirectUri . "&scope=" . $scope ;
$logouturl = "https://accounts.spotify.com/authorize/?show_dialog=true&client_id=" . $clientId . "&response_type=" . $responseType . "&redirect_uri=" . $redirectUri . "&scope=" . $scope ;  



/* Logging out */
if(isset($_GET["logout"])){
	$loggedIn = false;
	session_unset();
	header('Location:' . $logouturl); 
}

/* Checking session for auth token */
if (isset($_SESSION['accessToken'])) {
  $loggedIn = true;
  $accessToken = ($_SESSION['accessToken']);
  $refreshToken = ($_SESSION["refreshToken"]);
	$loginTime = $_SESSION["loginTime"];
}


/* Getting auth token based on the returned access code from Spotify*/
if(!$loggedIn && isset($_GET["code"])){
	$code = ($_GET["code"]);
	$tokennurl = "https://accounts.spotify.com/api/token"; 
	$data = array("grant_type" => $grantType ,"code" => $code , "redirect_uri" => $redirectUri);
	
	$options = array(
	  'http'=>array(
		'method'=>"POST",
		'header'=>"Authorization: Basic " . $clientStringB64 . "\r\n",
		'content'=> http_build_query($data)
	  )
	);

	$context = stream_context_create($options);

	$result = @file_get_contents($tokennurl,false,$context);
	
	$json = json_decode($result,true);
	$accessToken = $json['access_token']; 
	$refreshToken = $json['refresh_token'];
	$loginTime = time();
	$_SESSION["accessToken"] = $accessToken;
	$_SESSION["refreshToken"] = $refreshToken;
	$_SESSION["loginTime"] = 	$loginTime;
	$loggedIn = true;
}



/* Getting user data and user lists from Spotify */
if($loggedIn){		
	$options = array(
	  'http'=>array(
		'method'=>"GET",
		'header'=>"Authorization: Bearer " . $accessToken . "\r\n"
	  )
	);
	// Create a stream
	$context = stream_context_create($options);	

	$urlUser = "https://api.spotify.com/v1/me"; 
	$urlUserLists = "https://api.spotify.com/v1/me/playlists/?limit=10";

	$resultUser = @file_get_contents($urlUser,false,$context);
	$resultUserListsRaw = @file_get_contents($urlUserLists,false,$context); 

	

	/* Checking for and removing other users playlists */
	
    if($resultUser){
        $resultUserLists=[];
        $userName = json_decode($resultUser) -> id;
        $json = json_decode($resultUserListsRaw);
        foreach ($json -> items as $key => $value) {
            if($userName == $value -> owner -> id){
            array_push ($resultUserLists,$value);			
            //echo $value -> owner -> id;
		}
	}
	$resultUserLists = json_encode($resultUserLists);
    }
	
}


/* Getting new acces token based on the refresh token */
if($loggedIn && $accessToken && $resultUser == ""){
	$refreshTokennUrl = "https://accounts.spotify.com/api/token"; 
	$refreshData = array("grant_type" => "refresh_token" ,"refresh_token " => $refreshToken);
	
	$options = array(
	  'http'=>array(
		'method'=>"POST",
		'header'=>"Authorization: Basic " . $clientStringB64 . "\r\n",
		'content'=> http_build_query($refreshData)
	  )
	);

	$context = stream_context_create($options);

	$result = @file_get_contents($refreshTokennUrl,false,$context);
	
	$json = json_decode($result,true);
	$accessToken = $json['access_token']; 
	$refreshToken = $json['refresh_token'];
	$_SESSION["accessToken"] = $accessToken;
	$_SESSION["refreshToken"] = $refreshToken;
	$message = "<p class='alert'><a href='" . $loginurl . "'>Din Spotify session er udløbet. Klik her eller på log ind knappen for at hente en ny ticket!</a></p>";
	$_SESSION["message"] = $message;
}
			
?>