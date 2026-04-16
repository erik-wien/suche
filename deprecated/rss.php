<?php
/**
 * index.php
 * 
 * Version 2.2 26.09.2023
 
 * RSS Reader
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
 * @package	search
 * @author	 Erik R. Huemer <erik.huemer@jardyx.com>
 * @copyright  2023 Erik R. Huemer
 * @license	http://www.php.net/license/3_01.txt  PHP License 3.01
 * @version	SVN: $Id$
 * @link	   https://www.jardyx.com/s/rss.php
 * @see		https://www.jardyx.com/s/rss.php
 * @since	  File available since Release 2.2
 * @deprecated not depreciated
 */
$scriptPath = '/home/.sites/765/site679/web/jardyx.com/wlmonitor/';

header('Content-Type: text/html; charset=utf-8');

?><!doctype html>
<html itemscope="" itemtype="https://schema.org/WebPage" lang="de-AT">
<head>

	<title>Search </title> 
	
	<meta content="IE=edge" http-equiv="X-UA-Compatible">
	<meta content="text/html; charset=UTF-8" http-equiv="content-type">
	
	<meta name="viewport" content="width=200, initial-scale=1.5">
	<meta http-equiv="X-UA-Compatible" content="ie=edge">

	<meta name="application-name" content="Eriks RSS Reader">
	<meta name="mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-title" content="Eriks RSS Reader">
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
	

	<!-- Bootstrap -->
	<meta name="viewport"							content="width=device-width, initial-scale=1">
	<link rel="stylesheet"							href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
	<link rel="stylesheet" 							href="./lib/suche.css">
	<link rel="stylesheet" 							href="https://use.fontawesome.com/releases/v5.5.0/css/all.css" integrity="sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU" crossorigin="anonymous">

	<body id="myPage">
		
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


        <!-- Back2Top -->
	
	    <button onclick="topFunction()" id="topBtn" title="Go to top"><span class="fas fa-arrow-alt-circle-up"></span></button>

		<!--  Footer -->
       <nav class="navbar navbar-expand-sm bg-dark text-light navbar-dark" id="foot">
            <div class="col-md-4 text-left small"><? echo(round((microtime(true)-$_SERVER['REQUEST_TIME_FLOAT']),2)); ?> s</div>
            <div class="col-md-4 text-center">V.3.3 &copy; 2016-2023 Erik R. Huemer </div>
            <div class="col-md-4 text-right"><a class="text-light" href="mailto:suche@2me.org?subject=Anfrage" title="suche@2me.org">suche@2me.org</a></div>
        </nav>

        <!--  javaScript libraries -->

        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
        <script src="lib/moment.min.js"></script> 
        <script src="lib/jquery.cookie.js"></script>
	
        <!--  initiate javaScript when ready  -->
        <script language="javascript" type="text/javascript">
        
            $(document).ready(function(){
                
                    
                $(".linkButton").click(function () {
                    window.open($(this).attr('url'), "News");
                });
                            
                window.onscroll = function() {scrollFunction()};
            });
        </script>
	</body>
</html>