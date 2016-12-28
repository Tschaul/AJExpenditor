<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

//echo file_get_contents('../data/drafts.json');
	

require_once('itemHelper.php');

function compute_true_amount($amount,$string){
	
	$charlist='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';
	
	$amount = trim($amount,$charlist);
	$string = trim($string,$charlist);
	
	$result=0.0;
	if(strpos($string, '*', 0) === 0) eval('$result=('.$amount.')'.$string.';');
	else eval('$result='.$string.';');
	
	return $result;
	
}

function refresh_saldos($events,$start){

	$start=min($start,count($events)-1);
	
	for($i=$start; $i>-1; $i--){
	
		//echo "|| $i :||";
		
		//print_r($events[$i]);
		
		for($j=0; $j<count($events[$i]['expenditures']); $j++){
		
			if($i==(count($events)-1)) $oldsaldo=0;
			else $oldsaldo=$events[$i+1]['expenditures'][$j]['saldo'];			
			
			$delta=compute_true_amount($events[$i]['amount'],$events[$i]['expenditures'][$j]['amount']);
			$events[$i]['expenditures'][$j]['delta']=$delta;
			$events[$i]['expenditures'][$j]['saldo']=$oldsaldo+$delta;
			
		}		
		
		for($j=0; $j<count($events[$i]['ious']); $j++){
		
			if($i==(count($events)-1)) $oldsaldo=0;
			else $oldsaldo=$events[$i+1]['ious'][$j]['saldo'];			
			
			$delta=compute_true_amount($events[$i]['amount'],$events[$i]['ious'][$j]['amount']);
			$events[$i]['ious'][$j]['delta']=$delta;
			$events[$i]['ious'][$j]['saldo']=$oldsaldo+$delta;
			
		}	
		
	}
	
	return $events;

}

$events=json_decode(file_get_contents('../data/events.json'),true);

if($_SERVER['REQUEST_METHOD']=='GET'){

	if(isset($_GET['ID'])){
	
		if($_GET['ID']!="all") echo json_encode(findItem($events,'ID',$_GET['ID']));
		else echo json_encode($events);
		
	}

}

if($_SERVER['REQUEST_METHOD']=='POST'){

	//echo json_encode($_POST);
	
	if(count($events)!=0) $lastevent=$events[0];
	else $lastevent=array();
	
	$event=array();
	
	$event['amount']=$_POST['amount'];
	$event['description']=$_POST['description'];
	$event['date']=$_POST['date'];
	$event['category']=$_POST['category'];
	
	
	$event['expenditures']=array();
	foreach($_POST as $key => $value) if(strpos($key, 'expenditure', 0) === 0){
	
		list ($exp, $person) = explode('_', $key);
		$newexp=array('person'=>$person,'amount'=>$value);
		$event['expenditures'][count($event['expenditures'])]=$newexp;
	
	}
	
	$event['ious']=array();
	foreach($_POST as $key => $value) if(strpos($key, 'iou', 0) === 0){
	
		list ($exp, $borrower, $creditor) = explode('_', $key);
		$newiou=array('borrower'=>$borrower,'creditor'=>$creditor,'amount'=>$value);
		$event['ious'][count($event['ious'])]=$newiou;
	
	}
	
	$event['ID']=getMaxID($events)+1;
	
	for($i=0; $i<count($events); $i++) if(strnatcmp($events[$i]['date'],$event['date'])<=0){
		$events = array_merge(array_slice($events, 0, $i), array($event) , array_slice($events, $i));
		$events=refresh_saldos($events,$i+1);
		break;
	}	
	
	/* OLD
	
	array_unshift( $events, $event );
	$events=sortItemsDesc($events,"date");
	for($i=0; $i<count($events); $i++) if($events[$i]['ID']==$event['ID']){ 
		$events=refresh_saldos($events,$i);
		break;
	}
	
	*/
		
	file_put_contents('../data/events.json',json_encode($events));
	
	echo json_encode($events);
	
}

if($_SERVER['REQUEST_METHOD']=='PUT'){
	
	$_PUT=array();
	parse_str(file_get_contents('php://input'), $_PUT);
	//echo json_encode($_PUT);
		
	$event=findItem($events,'ID',$_PUT['ID']);
	
	if(isset($_PUT['amount'])) $event['amount']=$_PUT['amount'];
	if(isset($_PUT['description'])) $event['description']=$_PUT['description'];
	if(isset($_PUT['date'])) $event['date']=$_PUT['date'];
	if(isset($_PUT['category'])) $event['category']=$_PUT['category'];
		
	for($i=0; $i<count($event['expenditures']); $i++) if(isset($_PUT['expenditure_'.$event['expenditures'][$i]['person']])) $event['expenditures'][$i]['amount']=$_PUT['expenditure_'.$event['expenditures'][$i]['person']];
		
	for($i=0; $i<count($event['ious']); $i++) if(isset($_PUT['iou_'.$event['ious'][$i]['borrower'].'_'.$event['ious'][$i]['creditor']])) $event['ious'][$i]['amount']=$_PUT['iou_'.$event['ious'][$i]['borrower'].'_'.$event['ious'][$i]['creditor']];
			
	for($i=0; $i<count($events); $i++) if($events[$i]['ID']==$event['ID']){
		array_splice($events,$i,1);
		break;
	}
	
	
	for($i=0; $i<count($events); $i++) if(strnatcmp($events[$i]['date'],$event['date'])<=0){
		$events = array_merge(array_slice($events, 0, $i), array($event) , array_slice($events, $i));
		$events=refresh_saldos($events,$i+1);
		break;
	}	
	
	/* OLD
	
	for($i=0; $i<count($events); $i++) if($events[$i]['ID']==$event['ID']) {
		$events[$i]=$event;
		break;
	}
	$events=sortItemsDesc($events,"date");
	for($i=0; $i<count($events); $i++) if(strnatcmp($events[$i]['date'],$event['date'])<0){
		$events=refresh_saldos($events,$i);
		break;
	}
	
	*/
	
	file_put_contents('../data/events.json',json_encode($events));
	
	echo json_encode($events);
	
}

if($_SERVER['REQUEST_METHOD']=='DELETE'){
	
	$_DELETE=array();
	parse_str(file_get_contents('php://input'), $_DELETE);
		
	for($i=0; $i<count($events); $i++) if($events[$i]['ID']==$_DELETE['ID']){
		array_splice($events,$i,1);
		$events=refresh_saldos($events,$i);
		break;
	}
	
	file_put_contents('../data/events.json',json_encode($events));
	
	echo json_encode($events);	
	
}

?>
