<?php
/**
 * index.php
 * 
 * Version 2.1 28. Oct. 2019
 
 * Main document Search
 *
 * index.php consist of the following Parts:
 *		- Navigation
 *		- Search Boxes
 *		- Buttons
 *		- RSS Feeds
 *		- Footer
 *
 * Additionally there two alerts:
 *		- User errors (below the Navigation)
 *		- A cookie hint-Box 
 *
 * Dependencies:
 *		- Bootstrap V.4.3.1
 *		- Fontawesome V.5.7.0
 *		- Google Fonts: Roboto, Roboto Mono, Share Tech Mono
 *		- jQuery V.3.3.1
 *
 * 
 * PHP version 7.2
 *
 * LICENSE: This source file is subject to version 3.01 of the PHP license
 * that is available through the world-wide-web at the following URI:
 * http://www.php.net/license/3_01.txt.  If you did not receive a copy of
 * the PHP License and are unable to obtain it through the web, please
 * send a note to license@php.net so we can mail you a copy immediately.
 *
 * @category   geo-information
 * @package	search
 * @author	 Erik R. Huemer <erik.huemer@jardyx.com>
 * @copyright  2019 Erik R. Huemer
 * @license	http://www.php.net/license/3_01.txt  PHP License 3.01
 * @version	SVN: $Id$
 * @link	   https://www.jardyx.com/s
 * @see		https://www.jardyx.com/s/
 * @since	  File available since Release 1.2.0
 * @deprecated not depreciated
 */
ini_set("session.cookie_lifetime",60*60*24*365); // one year

session_start();
$scriptPath = '/home/.sites/765/site679/web/jardyx.com/wlmonitor/';
$_SESSION['debug'] = FALSE;

header('Content-Type: text/html; charset=utf-8');

?><!doctype html>
<html itemscope="" itemtype="https://schema.org/WebPage" lang="de-AT">
<head>

	<title>Search </title> 
	
	<meta content="IE=edge" http-equiv="X-UA-Compatible">
	<meta content="text/html; charset=UTF-8" http-equiv="content-type">
	
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="ie=edge">

	<meta name="application-name" content="Eriks Suche">
	<meta name="mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-title" content="Eriks Suche">
	<meta name="msapplication-TileColor" content="#000000">
	<meta name="theme-color" content="#000000">
	
	<link rel="apple-touch-icon"	sizes="57x57"	href="pix/favicon/apple-icon-57x57.png">
	<link rel="apple-touch-icon" 	sizes="60x60" 	href="pix/favicon/apple-icon-60x60.png">
	<link rel="apple-touch-icon" 	sizes="72x72" 	href="pix/favicon/apple-icon-72x72.png">
	<link rel="apple-touch-icon" 	sizes="76x76" 	href="pix/favicon/apple-icon-76x76.png">
	<link rel="apple-touch-icon" 	sizes="114x114" href="pix/favicon/apple-icon-114x114.png">
	<link rel="apple-touch-icon" 	sizes="120x120" href="pix/favicon/apple-icon-120x120.png">
	<link rel="apple-touch-icon" 	sizes="144x144" href="pix/favicon/apple-icon-144x144.png">
	<link rel="apple-touch-icon" 	sizes="152x152" href="pix/favicon/apple-icon-152x152.png">
	<link rel="apple-touch-icon" 	sizes="180x180" href="pix/favicon/apple-icon-180x180.png">
	<link rel="icon"				sizes="192x192" type="image/png" href="pix/favicon/android-icon-192x192.png">
	<link rel="icon"				sizes="32x32"	type="image/png" href="pix/favicon/favicon-32x32.png">
	<link rel="icon"				sizes="96x96"	type="image/png" href="pix/favicon/favicon-96x96.png">
	<link rel="icon"				sizes="16x16"	type="image/png" href="pix/favicon/favicon-16x16.png">
	<link rel="manifest"							href="pix/favicon/manifest.json">
	<meta name="msapplication-TileColor" 			content="#ffffff">
	<meta name="msapplication-TileImage"			content="pix/favicon/ms-icon-144x144.png">
	<meta name="theme-color"						content="#ffffff">
	
	<!--base target="_blank" /-->

	<!-- Bootstrap -->
	<meta name="viewport"							content="width=device-width, initial-scale=1">
	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet"							href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">

	<link rel="stylesheet" 							href="./lib/suche.css">

	<!-- Icons -->
    <link rel="stylesheet"                          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">


	<!-- private -->

	

	<!--
	Konfiguration
	===========================

		// Navigation: menue.xml
		
		
		// Buttons: buttons.xml
			Button Farben:
			Leer			Grau
			.btn-default	Weiss
			.btn-primary	Dunkelblau
			.btn-success	Grün
			.btn-info		HellBlau
			.btn-warning	Orange
			.btn-danger		Rot
			.btn-link		Link
			
		// User: suche.js
			
	-->
	
	
	<body id="myPage">
		
	<div id="wrapper" class="col-sm-12 col-md-9 col-lg-7 mx-auto">
		

	
	
	
	<!-- 
	===============================================
	           Suchfelder
	===============================================
	 -->



	<div class="d-flex flex-column shadow mt-3 p-3 bg-light rounded-sm">
		
		<!-- Google -->
		<form action="https://www.google.com/search" target="_blank" method="get" accept-charset="iso-8859-1" id="googlesearch" class="form-horizontal"> 

			<div class="input-group mt-2">
					<div class="input-group-prepend ">
						<div class="input-group-text">
							<span class="fab fa-google m-auto"></span>
						</div>
					</div>

					<input type="text" name="q" id="q" class="form-control border-0" value="" accesskey="g" title="Durchsuche Google [g]" placeholder="Auf Google suchen ..." autocomplete="on" autofocus="on" /> 
					
					
				    <button class="btn" type="reset"><span id="qclear" class="fas fa-times text-body"></span></button>
				    
					<div class="input-group-append">
						<span class="input-group-text"><button class="btn" type="submit"><span class="fas fa-search"></span></button></span>
					</div>
			</div>
		
			<div id="googlesearchDomains" class="mx-2 my-1 col-sm-10 col-md-10 col-lg-8 mx-auto px-1 mb-4">	
				
				<div class="input-group-text mx-auto">
					<div class="custom-control custom-radio custom-control-inline">
						<input type="radio" name="sitesearch" id="siteSearch" class="custom-control-input" value="" CHECKED="checked" />
						<label class="custom-control-label" for="siteSearch"> web </label> 
					</div>
					
					<div class="custom-control custom-radio custom-control-inline">
						<input type="radio" name="sitesearch" id="siteSearch2" class="custom-control-input" value="derstandard.at" />
						<label class="custom-control-label" for="siteSearch2"> Der Standard </label>
					</div> 
					
					<div class="custom-control custom-radio custom-control-inline">
						<input type="radio" name="sitesearch" id="siteSearch1" class="custom-control-input" value="w3schools.com" />
						<label class="custom-control-label" for="siteSearch1"> W3 School <span class="badge badge-warning">New</span></label> 
					</div>
				</div>
			</div>	
			
		</form>		
		
		
		
		
		<!-- Wikipedia-->
		<form name="searchform" id="wikipediasearch" action="https://de.wikipedia.org/wiki/Spezial:Suche" target="_blank" method="get" accept-charset="iso-8859-1" class="form-horizontal my-1" > 
			<div class="input-group">
				<div class="input-group-prepend">
					<span class="input-group-text"><span class="fab fa-wikipedia-w m-auto"></span></span>
				</div>
	
				<input name="search" type="text" class="form-control border-0" id="InputWikipedia" accesskey="w" title="Durchsuche die Wikipedia [w]" value="" placeholder="Auf Wikipedia suchen ..." autocomplete="on" /> 
	
				<div class="input-group-append">
					<span class="input-group-text"><button class="btn" type="submit"><span class="fas fa-search"></span></button></span>
				</div>
			</div>
		</form>


		<!-- Geizhals -->
		<form name="sform" id="geizhalssearch" action="https://geizhals.at/" target="_blank" method="get" accept-charset="iso-8859-1" class="form-horizontal mb-1 clearfix" >
			<div class="input-group">
				<div class="input-group-prepend">
					<span class="input-group-text" style="font-weight:bolder;">G</span></div>
				 
				<input name="fs" type="text" class="form-control border-0" id="fs" accesskey="z" title="Durchsuche Geizhals [z]" value="" placeholder="Auf Geizhals suchen ..." autocomplete="on" />
				
				<div class="input-group-append">
					<span class="input-group-text"><button class="btn" type="submit"><span class="fas fa-search"></span></button></span>
				</div>
			</div>
		</form>


		<!-- Amazon -->
		<form name="site-search" id="amazonsearch" role="search" action="https://amazon.de/s/ref=nb_sb_noss" target="_blank" method="GET" accept-charset="utf-8" class="form-horizontal mb-1" >
			<div class="input-group">
				<div class="input-group-prepend"><span class="input-group-text"><span class="fab fa-amazon ml-auto mr-auto"></span></span></div>
				
				<input class="form-control border-0" name="field-keywords" id="twotabsearchtextbox" type="text" accesskey="a" title="Durchsuche Amazon [a]" placeholder="Auf Amazon suchen ..." value="" autocomplete="off" />
				
				<div class="input-group-append">
					<span class="input-group-text"><button class="btn" type="submit"><span class="fas fa-search"></span></button></span>
				</div>
			</div>
				
				<input name="__mk_de_DE" type="hidden" value="ÅMÅŽÕÑ" />
		</form>
			

		<!-- Pons -->
		<form action="https://de.pons.com/übersetzung" target="_blank" id="ponssearch" role="search" method="get" accept-charset="utf-8" class="form-horizontal mb-1" >
			<div class="input-group">
				<div class="input-group-prepend">
					<span class="input-group-text"><span class="far fa-comment m-auto"></span></span></div>
					
				<input class="form-control border-0" name="q" id="q" type="text" placeholder="Mit Pons übersetzen ..." value="" autocomplete="off" accesskey="p" title="Mit Pons übersetzen [p]"/>
				
				<div class="input-group-append">
					<span class="input-group-text"><button class="btn" type="submit"><span class="fas fa-search"></span></button></span>
				</div>
				</div>

				<input name="l" type="hidden" value="deen" />
				<input name="lf" type="hidden" value="de" />
		</form>


		<!-- Adobe Stock (aka fotolia) -->
		<form action="https://stock.adobe.com/at/search" target="_blank" id="fotoliasearch" role="search" method="post" accept-charset="utf-8" class="form-horizontal mb-2" >
			<div class="input-group">
				<div class="input-group-prepend">
					
					<div class="input-group-text">
						<svg viewBox="5 10 95 90" height="30" width="30" class="ml-auto mr-auto">
							<image xlink:href="pix/iconfinder_Stock_2530777.svg" height="100" width="100" ></image> 
						</svg>
					</div>
				</div>
					
				<input class="form-control border-0" name="k" id="search-1-k" type="text" accesskey="f" placeholder="Auf Adobe Stock suchen ..." title="Auf Adobe Stock suchen [f]" value="" autocomplete="on" />
				
				<div class="input-group-append">
					<span class="input-group-text"><button class="btn" type="submit"><span class="fas fa-search"></span></button></span>
				</div>
			</div>
				
				<input name="filters[content_type:all]" id="search-1:content_type:all" type="hidden" checked="checked" value="1" data-content_type="all" />
		</form>
				
	</div> <!-- flex -->
			

	
	
	
		
	<!-- 
	===============================================
		Link-Buttons
	===============================================
	 -->
	
	<div class="card-columns card shadow mt-3 px-3 py-2 bg-light border border-0 rounded-sm" >
		<div class="card-body p-0 m-0 pb-2" id="buttons">
			<!--button class="button btn btn-primary btn-danger " onclick="openWin('https://www.tuv-elearning.at/')">	
				<img class="img-responsive" src="pix/moodle.png">
				Moodle
			</button-->
			
			<? include("lib/getButtons.php"); ?>
		</div>
	</div>





	<!-- 
	===============================================
	           RSS Feeds
	===============================================
	 -->
	

<div class="container shadow mt-3 p-0 bg-light rounded-sm mt-3" id="rss-feed">
	<nav class="navbar navbar-expand-md bg-secondary navbar-dark pb-0">
		
			<span class="navbar-brand text-light px-2">
				<i class="fas fa-rss-square mx-2>">&nbsp;</i>
			</span>
			
		<!-- Toggler/collapsibe Button -->
		<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#rssNavbar">
			<span class="navbar-toggler-icon"></span>
		</button>
		
		<div class="" >
			<ul class="nav nav-tabs border border-0" id="rssNavbar">

			
				<li class="nav-item ">
					<a class="nav-link active" data-toggle="tab" href="#home" >MacTechNews.de</a> </li>
				<li class="nav-item">
					<a class="nav-link" data-toggle="tab" href="#menu2">Standard</a> </li>
				<li class="nav-item">
					<a class="nav-link" data-toggle="tab" href="#menu3">Web</a> </li>
				<li class="nav-item">
					<a class="nav-link" data-toggle="tab" href="#menu4">Wissenschaft</a> </li>
					
			</ul>
		</div>
	</nav>


	<!-- Tab panes -->
	
	<?php include("lib/getRss.php"); ?>

	<div class="tab-content text-body">

		<div class="tab-pane card border border-0 active"	id="home" ><?=rss2html('https://www.mactechnews.de/Rss/News.x')?>			</div>
		<div class="tab-pane card border border-0 fade"		id="menu2"><?=rss2html('https://www.derstandard.at/rss')?>	</div>
		<div class="tab-pane card border border-0 fade"		id="menu3"><?=rss2html('https://www.derstandard.at/rss/web')?>	 </div>
		<div class="tab-pane card border border-0 fade"		id="menu4"><?=rss2html('https://rss.orf.at/science.xml')?>					</div>

	</div>

</div>




	
	<!-- 
	===============================================
	           Back2Top
	===============================================
	 -->
	
	<button onclick="topFunction()" id="topBtn" title="Go to top"><span class="fas fa-arrow-alt-circle-up"></span></button>

	
	
	<!-- 
	===============================================
	           Footer
	===============================================
	 -->
	
	
	<nav class="navbar navbar-expand-sm bg-dark text-light navbar-dark fixed-bottom" id="footer">
		
		<div class="col-md-4 text-left small"><? echo(round((microtime(true)-$_SERVER['REQUEST_TIME_FLOAT']),2)); ?> s</div>
		<div class="col-md-4 text-center">V.3.3 &copy; 2016-2023 Erik R. Huemer </div>
		<div class="col-md-4 text-right"><a class="text-light" href="mailto:suche@2me.org?subject=Anfrage" title="suche@2me.org">suche@2me.org</a></div>
	</nav>



	<!-- 
	===============================================
	           Info Boxes
	===============================================
	 -->
	
	<div id="modalAbout" class="modal fade" role="dialog">
		<div class="modal-dialog">

			<!-- Modal content-->
			<div class="modal-content">
			
				<div class="modal-header">
					<h4 class="modal-title">Über</h4>
					<button type="button" class="close" data-dismiss="modal">&times;</button>
				</div>
				
				<div class="modal-body">
					<p>Erik R. Huemer <br />
						Human Ressources Development<br />
										E-Learning - Recruiting - Knowledge Development</p>
					<p>
						<span class="fas fa-home"></span>		1120 Wien, Austria <br />
						<span class="far fa-address-card"></span>	https://about.me/erik.accart-huemer </span><br />
						<span class="far fa-envelope"></span>		info &lt;at> 2me &lt;dot> org </span></p>
				</div>
				
				<div class="modal-footer">
					<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
				</div>
			</div>
		</div>
	</div>



	<!-- Modal Help Box-->
	<div id="modalHelp" class="modal fade" role="dialog">
		<div class="modal-dialog">

			<!-- Modal content-->
			<div class="modal-content">
			
				<div class="modal-header">
					<h4 class="modal-title">Hilfe</h4> 
					<button type="button" class="close" data-dismiss="modal">&times;</button>
				</div>
				
				<div class="modal-body">
					<p>Diese Suchseite ist ein eher privates Projekt von mir. Deswegen gibts kein echtes Login, sondern nur zwei fix eingerichtete User.</p>
					<p>Die Suchformulare sind derzeit (noch) fix eingerichtet, Die Buttons und der erste RSS Feed ("My Feed") können mit XML-Dateien konfiguriert werden.</p>
					<p>Die ganze Seite (!) läuft lokal mit HTML, CSS (Bootstrap) und Javascript (jQuery). Bei Interesse, bitte Mail an <kbd>suchseite (at) 2me (dot) org</kbd>.</p>
				</div>
				
				<div class="modal-footer">
					<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
				</div>
			</div>
		</div>
	</div>
	
	
	<!-- Modal Version -->
	<div class="modal" id="modalVersion">
		<div class="modal-dialog">
			<div class="modal-content">
			
				<!-- Modal Header -->
				<div class="modal-header">
					<h4 class="modal-title">Versionsinfos</h4>
					<button type="button" class="close" data-dismiss="modal">&times;</button>
				</div>
				
				<!-- Modal body -->
				<div class="modal-body">
					<ul>
						<li>WL Monitor 3.2 </li>
						<li>Bootstrap 4.3.1</li>
						<li>jQuery 3.4.1</li>
					</ul>
				</div>
				
				<!-- Modal footer -->
				<div class="modal-footer">
					<button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
				</div>
				
			</div>
		</div>
	</div>

	<!-- 
	===============================================
				javaScript libraries
	===============================================
	 -->
	
	<!-- jQuery library -->
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
	
	<!-- Popper JS -->
	<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
	
	<!-- Latest compiled JavaScript -->
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
	
	<!-- https://momentjs.com Konvertieren von Datum -->
	<script src="lib/moment.min.js"></script> 
	
	<!-- cookies.js -->
	<script src="lib/jquery.cookie.js"></script>
	
	
	
	<!-- 
	===============================================
	           initiate javaScript when ready
	===============================================
	 -->
	<script language="javascript" type="text/javascript">
	
		$(document).ready(function(){
			// Add Buttons from XML

			// var q = loadButtons(xmlButtons);
			
				
			$(".linkButton").click(function () {
				window.open($(this).attr('url'), "News");
			});
			
			
			// load RSS and set automatic refresh to 10 mins
			// var RSSready = loadRSS(RSSFeedUrl);
			
			// setInterval(function(){RSSready = loadRSS(RSSFeedUrl);},600000);

			// Show Button "Top"
			// when the user scrolls down 20px from the top of the document
			
			window.onscroll = function() {scrollFunction()};
			
			
			
		});
	</script>
	
	</div>
	</body>
</html>							