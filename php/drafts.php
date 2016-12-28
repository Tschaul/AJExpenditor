<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

//echo file_get_contents('../data/drafts.json');
	

require_once('itemHelper.php');

$drafts=json_decode(file_get_contents('../data/drafts.json'),true);

if($_SERVER['REQUEST_METHOD']=='GET'){

	if(isset($_GET['ID'])){
	
		if($_GET['ID']!='all') echo json_encode(findItem($drafts,'ID',$_GET['ID']));
		else echo json_encode($drafts);
		
	}else echo json_encode(findItem($drafts,'default','1'));

}

if($_SERVER['REQUEST_METHOD']=='POST'){

	//echo json_encode($_GET);
	
	$draft=array();
	
	$draft['draftDescription']=$_POST['draftDescription'];
	$draft['amount']=$_POST['amount'];
	$draft['description']=$_POST['description'];
	$draft['date']=$_POST['date'];
	$draft['category']=$_POST['category'];
	
	
	$draft['expenditures']=array();
	
	foreach($_POST as $key => $value) if(strpos($key, 'expenditure', 0) === 0){
	
		list ($exp, $person) = explode('_', $key);
		$newexp=array('person'=>$person,'amount'=>$value);	
		$newexp['saldo']=0;
		$draft['expenditures'][count($draft['expenditures'])]=$newexp;
	
	}
	
	$draft['ious']=array();
	
	foreach($_POST as $key => $value) if(strpos($key, 'iou', 0) === 0){
	
		list ($exp, $borrower, $creditor) = explode('_', $key);
		$newiou=array('borrower'=>$borrower,'creditor'=>$creditor,'amount'=>$value);
		$newiou['saldo']=0;		
		$draft['ious'][count($draft['ious'])]=$newiou;
	
	}
	
	$draft['ID']=getMaxID($drafts)+1;
	
	array_unshift( $drafts, $draft );
	file_put_contents('../data/drafts.json',json_encode($drafts));
	
	echo json_encode($drafts);

	
}



if($_SERVER['REQUEST_METHOD']=='PUT'){
	
	$_PUT=array();
	parse_str(file_get_contents('php://input'), $_PUT);
	//echo json_encode($_PUT);
		
	$draft=findItem($drafts,'ID',$_PUT['ID']);
	
	if(isset($_PUT['draftDescription'])) $draft['draftDescription']=$_PUT['draftDescription'];
	if(isset($_PUT['default'])) $draft['default']=$_PUT['default'];
	if(isset($_PUT['amount'])) $draft['amount']=$_PUT['amount'];
	if(isset($_PUT['description'])) $draft['description']=$_PUT['description'];
	if(isset($_PUT['date'])) $draft['date']=$_PUT['date'];
	if(isset($_PUT['category'])) $draft['category']=$_PUT['category'];
		
	for($i=0; $i<count($draft['expenditures']); $i++) if(isset($_PUT['expenditure_'.$draft['expenditures'][$i]['person']])) $draft['expenditures'][$i]['amount']=$_PUT['expenditure_'.$draft['expenditures'][$i]['person']];
		
	for($i=0; $i<count($draft['ious']); $i++) if(isset($_PUT['iou_'.$draft['ious'][$i]['borrower'].'_'.$draft['ious'][$i]['creditor']])) $draft['ious'][$i]['amount']=$_PUT['iou_'.$draft['ious'][$i]['borrower'].'_'.$draft['ious'][$i]['creditor']];
		
	for($i=0; $i<count($drafts); $i++) if($drafts[$i]['ID']==$draft['ID']) $drafts[$i]=$draft;	
	file_put_contents('../data/drafts.json',json_encode($drafts));
	
	echo json_encode($drafts);
	
}

if($_SERVER['REQUEST_METHOD']=='DELETE'){
	
	$_DELETE=array();
	parse_str(file_get_contents('php://input'), $_DELETE);
	
	$wasdefault=false;
	
	for($i=0; $i<count($drafts); $i++) if($drafts[$i]['ID']==$_DELETE['ID']) {
		
		if(isset($drafts[$i]['default']) && $drafts[$i]['default']==1) $wasdefault=true;
		array_splice($drafts,$i,1);
		if($wasdefault) $drafts[0]['default']=1;
		
	}
	
	file_put_contents('../data/drafts.json',json_encode($drafts));
	
	echo json_encode($drafts);	
	
}

?>
