<?php
	include 'header.php';			
?>
<!DOCTYPE html>
<html ng-app="spotify">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Toplister og musikalske data fra Spotify</title>
	<meta name="description" content="Webapp der viser dine toplister og masser af musikalske data fra Spotifys eget data API">
	<meta name="keywords" content="toplister, spotify, audio features, musikalske data, metadata">
	
	<link type="text/css" href="spotify.css" rel="stylesheet">
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
	<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.7/angular-route.js"></script>
		
	<script type="text/javascript">
		//window.history.pushState("object or string", "Toplister og musikalske data fra Spotify", "/spotify/"); //rewrite 
		<?php
			if (isset($resultUser)) { ?>					
				var resultUser = <?=$resultUser ?>;
				var resultPlaylists = <?=$resultUserLists ?>; 
		<?php	}else{ ?>	
				var resultUser = {};
		<?php	} ?>	
				
	</script>

</head>
<body>
	<div id="header">
		<div class="center">
			<div class="user">		
				<?php if($loggedIn && $accessToken != null){ ?>
				
					<div class="userName logout" onclick="$('.logoutLink').toggle()">
						<strong>
							<span id="userName"><script>document.write(resultUser.id)</script></span>
							<span class="arrow"></span>
						</strong>
						<div class="logoutLink"><a href="?logout=true">Log ud</a></div>
					</div>	
							
				<?php }else{ ?>

					<div class="userName loggedOut"><a href="<?=$loginurl ?>">Log ind på Spotify</a></div>

				<?php } ?>
			</div>
			
			<h1>Spotify data for your favorite tracks and artists</h1>
		</div>
	</div>	
	<div id="wrapper">				
		
		<?php if(!$loggedIn || $accessToken == null){ ?>
		
			<div class="loginPage">			
				<?php if(isset($message)){echo $message;} ?>
				
			<login-box  login-url='<?=$loginurl ?>' ></login-box>
									
		<?php } ?>	
	
		
		<?php if($loggedIn && $accessToken != null){ ?>		
			
			
			<spotify-wrapper user-obj='<?=$resultUser ?>' user-lists='<?=$resultUserLists ?>' login-time='{{<?=$loginTime?> }}'></spotify-wrapper>
							
			
		<?php } ?>
			
	
				
				
				
		
		<div id="footer">		
			<a href="" onclick="$('#varDump').toggle();return false" id="showDump" ></a>
								
			<div id='varDump' style='display:none'>
		
			<?php
			
			
            /*
				
				echo "<pre><p>------------------------------------------<br/>";
				echo "Just raw data dumps.<br/>";
				echo "------------------------------------------</p>";
				

				echo "<pre><p>------------------------------------------<br/>";	
				echo "print_r(_SESSION): <br/>" ;
				print_r($_SESSION); 
				echo "<pre><p>------------------------------------------<br/>";
				echo "<br/><br/>" ;
				
				
				echo "<pre><p>------------------------------------------<br/>";
				echo "resultUserLists" . $resultUserLists;
				echo "<pre><p>------------------------------------------<br/>";
				
				echo "<pre><p>------------------------------------------<br/>";
				if($resultUser !=''){
					echo "User: (Just your publicly available information)<br/><br/>";
					var_dump(json_decode($resultUser, true));
					echo "<br/><br/><br/>" ;
				}
				echo "<pre><p>------------------------------------------<br/>";
				
			
				echo "<pre><p>------------------------------------------<br/>";
				if($loggedIn){
					echo "<br/><br/>accessToken: " . $accessToken . "<br/><br/>"; 				
					echo "_SESSION['accessToken']: " . $_SESSION["accessToken"]  . "<br/><br/>"; 
				}else{
					echo "<br/><br/> not logged in <br/><br/>";
				}
				echo "<pre><p>------------------------------------------<br/>";	
				
				echo "<pre><p>------------------------------------------<br/>";

					echo "<br/><br/>: "  . "<br/><br/>"; 				
					

				echo "<pre><p>------------------------------------------<br/>";	
				
				
			*/	
				
				//echo "<br/><br/>jsonResult['items'][0]['id']: " . $jsonResult['items'][0]['id'] . "<br/><br/>"; 				
				//echo "trackIds: " . $trackIds  . "<br/><br/>"; 
				
				/*foreach ($jsonResult->items as $item) {
				   var_dump($item->id);
				}*/
				
							
				/*				
				if($resultUser !=''){
					echo "User: (Just your publicly available information)<br/><br/>";
					var_dump(json_decode($resultUser, true));
					echo "<br/><br/><br/>" ;
				}
				
				if($resultAudioFeatures !=''){				
					echo "AudioFeatures: <br/><br/>";
					var_dump(json_decode($resultAudioFeatures, true));
					echo "<br/><br/><br/>" ;
				}		
				if($resultTracks !=''){
					echo "Tracks: <br/><br/>";
					var_dump(json_decode($resultTracks, true));
					echo "<br/><br/><br/>" ;
				}
				
				if($resultArtists){
					echo "Artists: <br/><br/>";
					var_dump(json_decode($resultArtists, true));
					echo "<br/><br/><br/>" ;
				}
				*/

				//echo "</pre>"	;			
			?>	
			</div>
		</div>	
	
	</div>

	<script src="js/app.js" ></script>
	
</body>
</html>	