<!doctype html>
<html itemscope="" itemtype="http://schema.org/WebPage" lang="de-AT">
<head>

	<title><?php echo $title; ?></title> 
	
	<meta content="IE=edge" http-equiv="X-UA-Compatible">
	<meta content="text/html; charset=UTF-8" http-equiv="content-type">
	
	<link rel="apple-touch-icon" sizes="57x57" href="../pix/favicon/apple-icon-57x57.png">
	<link rel="apple-touch-icon" sizes="60x60" href="../pix/favicon/apple-icon-60x60.png">
	<link rel="apple-touch-icon" sizes="72x72" href="../pix/favicon/apple-icon-72x72.png">
	<link rel="apple-touch-icon" sizes="76x76" href="../pix/favicon/apple-icon-76x76.png">
	<link rel="apple-touch-icon" sizes="114x114" href="../pix/favicon/apple-icon-114x114.png">
	<link rel="apple-touch-icon" sizes="120x120" href="../pix/favicon/apple-icon-120x120.png">
	<link rel="apple-touch-icon" sizes="144x144" href="../pix/favicon/apple-icon-144x144.png">
	<link rel="apple-touch-icon" sizes="152x152" href="../pix/favicon/apple-icon-152x152.png">
	<link rel="apple-touch-icon" sizes="180x180" href="../pix/favicon/apple-icon-180x180.png">
	<link rel="icon" type="image/png" sizes="192x192"  href="../pix/favicon/android-icon-192x192.png">
	<link rel="icon" type="image/png" sizes="32x32" href="../pix/favicon/favicon-32x32.png">
	<link rel="icon" type="image/png" sizes="96x96" href="../pix/favicon/favicon-96x96.png">
	<link rel="icon" type="image/png" sizes="16x16" href="../pix/favicon/favicon-16x16.png">
	<link rel="manifest" href="../pix/favicon/manifest.json">
	<meta name="msapplication-TileColor" content="#ffffff">
	<meta name="msapplication-TileImage" content="../pix/favicon/ms-icon-144x144.png">
	<meta name="theme-color" content="#ffffff">

	<!-- Bootstrap & JQuery -->
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" 		  href="../lib/bootstrap/css/bootstrap.min.css">
	<script src="../lib/jquery-3.2.1.min.js"></script>
	<script src="../lib/bootstrap/js/bootstrap.min.js"></script>
	
	<!-- JQuery Form Validator-->
	<script src="//cdnjs.cloudflare.com/ajax/libs/jquery-form-validator/2.3.26/jquery.form-validator.min.js"></script
	

	<!-- https://momentjs.com Konvertieren von Datum -->
	<script src="../lib/moment.min.js"></script> 
	
	<!-- cookies.js -->
	<script src="../lib/jquery.cookie.js"></script>
	
	<!-- https://github.com/sdepold/jquery-rss Auslesen und Anzeigen von RSS-Feeds -->
	<script src="../lib/jquery.rss.js"></script> 
	
	<!-- Icons -->
	<link rel="stylesheet" href="../lib/font-awesome-4.7.0/css/font-awesome.min.css">

    <!-- private -->
	<link  href="../lib/suche.css" rel="stylesheet">
	<!--script src="../lib/suche.js"></script -->
	
	<body>
		
		<!-- Trigger the modal with a button -->
		<button type="button" class="btn btn-link" data-toggle="modal" data-target="#loginModal"><span class="fa fa-drivers-license-o"></span></button>
		
		<!-- Modal -->
		<div id="loginModal" class="modal fade" role="dialog">
			<div class="modal-dialog">
		
				<!-- Modal content-->
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal">&times;</button>
						<h4 class="modal-title"><? echo($title); ?></h4>
						<!--p><? echo($titleLink); ?></p-->
					</div><!-- end .modal-header -->
					<div class="modal-body">	

