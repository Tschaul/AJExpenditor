<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

//echo file_get_contents('../data/drafts.json');
	
require_once('itemHelper.php');

$categories=json_decode(file_get_contents('../data/categories.json'),true);

if($_SERVER['REQUEST_METHOD']=='GET'){

	if(isset($_GET['name'])){
	
		if($_GET['name']!='all') echo json_encode(findItem($categories,'name',$_GET['name']));
		else echo json_encode($categories);
		
	}

}


?>
