
<?php
// SECURITY GATE — 2026-04-15
// This endpoint had unauthenticated SQL injection on every CRUD path
// ($_REQUEST concatenated straight into mysqli_query). Disabled pending
// rewrite. Do NOT remove this guard without replacing the whole file.
http_response_code(403);
header('Content-Type: text/plain; charset=utf-8');
exit("Disabled pending rewrite.\n");

	//include connection file
	include_once("connection.php");
	
	$db = new dbObj();
	$connString =  $db->getConnstring();

	$params = $_REQUEST;
	
	$action = isset($params['action']) != '' ? $params['action'] : '';
	$empCls = new Item($connString);

	switch($action) {
		case 'add':
			$empCls->insertItem($params);
			break;
		case 'edit':
			$empCls->updateItem($params);
			break;
		case 'delete':
			$empCls->deleteItem($params);
			break;
		default:
			$empCls->getItems($params);
			return;
	}
	
	class Item {
		protected $conn;
		protected $data = array();
		function __construct($connString) {
			$this->conn = $connString;
		}
	
		public function getItems($params) {
			
			$this->data = $this->getRecords($params);
			
			echo json_encode($this->data);
		}
		
		
		
		function insertItem($params) {
			$data = array();;
			$sql = "INSERT INTO `navigation` (`idUser`, `navItem`, `dropdown-header`, `dropdown-item`, `symbolFa`, `symbolImg`, `Url`, `Window`) VALUES ('". $params["iduser"]. "', '". $params["navItem"]. "', '". $params["dropdown-header"]. "', '". $params["dropdown-item"]. "', '". $params["symbolFa"]. "', '". $params["symbolImg"]. "', '". $params["Url"]. "', '". $params["Window"]. "');";
			echo $result = mysqli_query($this->conn, $sql) or die("error to insert navigation data");
			
		}
		
	
	
		function getRecords($params) {
			$rp = isset($params['rowCount']) ? $params['rowCount'] : 10;
			
			if (isset($params['current'])) { $page  = $params['current']; } else { $page=1; };  
			
	        $start_from = ($page-1) * $rp;
			
			$sql = $sqlRec = $sqlTot = $where = '';
			
			if( !empty($params['searchPhrase']) ) {   
				$where .=" WHERE ";
				$where .=" ( dropdown-item LIKE '".$params['searchPhrase']."%' ";    
				$where .=" OR idUser LIKE '".$params['searchPhrase']."%' ";
				$where .=" OR dropdown-header LIKE '".$params['searchPhrase']."%' )";
			}
			if( !empty($params['sort']) ) {  
				$where .=" ORDER By ".key($params['sort']) .' '.current($params['sort'])." ";
			}
			
			// getting total number records without any search
			$sql = "SELECT * FROM `navigation` ";
			$sqlTot .= $sql;
			$sqlRec .= $sql;
			
			// concatenate search sql if value exist
			if(isset($where) && $where != '') {
	
				$sqlTot .= $where;
				$sqlRec .= $where;
			}
			
			// pagination
			if ($rp!=-1)
			$sqlRec .= " LIMIT ". $start_from .",".$rp;
			
			// get data
			$qtot = mysqli_query($this->conn, $sqlTot) or die("error to fetch tot Items data");
			$queryRecords = mysqli_query($this->conn, $sqlRec) or die("error to fetch Items data");
			
			
			//print_r2($sqlRec);
			//print_r2($queryRecords);
			
			while( $row = mysqli_fetch_assoc($queryRecords) ) { 
				$data[] = $row;
			}
	
			//print_r2($data);
	
			$json_data = array(
				"current"	=> intval($params['current']), 
				"rowCount"	=> 10, 			
				"total"		=> intval($qtot->num_rows),
				"rows"		=> $data   // total data array
				);
			
			//print_r2($json_data);
			
			return $json_data;
		}
	
	
	
		function updateItem($params) {
			$data = array();
			
			//print_R($_POST);die;
			$sql = "Update `navigation` set idUser = '" . $params["edit_idUser"] . "', navItem='" . $params["edit_navItem"] . "', dropdown-header='" . $params["edit_dropdown-header"] . "', dropdown-item='" . $params["edit_dropdown-item"] . "', symbolFa='" . $params["edit_symbolFa"] . "', symbolImg='" . $params["edit_symbolImg"] . "', url='" . $params["edit_url"] . "', Window='" . $params["edit_Window"] . "' WHERE id='".$_POST["edit_id"]."'";
			echo $result = mysqli_query($this->conn, $sql) or die("error to update Item data");
		}
		
		
		
		function deleteItem($params) {
			$data = array();
			
			//print_R($_POST);die;
			$sql = "delete from `navigation` WHERE id='".$params["id"]."'";
			echo $result = mysqli_query($this->conn, $sql) or die("error to delete Item data");
		}
	}
	
	function print_r2($val){
        echo '<pre>';
        print_r($val);
        echo  '</pre>';
	}
 
?>
	










