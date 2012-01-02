<?php
				
	//include the file for reading/writing to message queue
	include 'rwMQ.php';	
		
	// create a new instance of Services_JSON
	require_once('JSON.php');
	$json = new Services_JSON();
		
	$test1 = array(0x5a7, 1);
	$test2 = array(0x503, 1);
	$data = array($test1, $test2);
	$type = 'read';
	$sid = 0x12345678;
	$did = 0xc3;
		
	//$dataArray = $json->decode($data);
	$dataArray=$data;
	//echo count($dataArray);
	$oidArray = array();		// create an oid array
		
	$sentMsgs = array();
	// writing to MQ
	$sendCount=0;
	
	$dauDeviceID = 0x0;
	$dauULOutPowerOID = 0x5a8;
	$dauDLInPowerOID = 0x5a7;
	$druULInPowerOID = 0x5a7;
	$druDLOutPowerOID = 0x503;
	foreach ($dataArray as $sdata) {
		if('read' == $type){
			// for reading, the struct of $sdata is  {oid, npCmd}
			$id = $sdata[0];
			$oidArray[] = $id; 
			//echo "$sdata.<br>";
			$result = sendingtoMQ($sid, $did, $sendCount, $id, True, null, $sdata[1]);
		} else if('write' == $type) {
			// for writing, the struct of $sdata is  {oid, content, npCmd}
			$id = $sdata[0];
			$oidArray[] = $id;
			$result = sendingtoMQ($sid, $did, $sendCount, $id, False, $sdata[1], $sdata[2]);
		}
						
		if ($result) {
			$sentMsgs[] = array('pid' => $sendCount, 'oid' => $id, 'did' => $did);
			$sendCount++;
		}
		
		// for everytime readding/writting Attenuation for DRU
		// must read Attenuation for DAU to caculate the Gain
		// manually add the reading attenuation from DAU and insert it to the qurey list
		if (($dauDeviceID!=$did) && ('read' == $type) && (($druULInPowerOID==$id) || ($druDLOutPowerOID==$id))) {			
			if ($druULInPowerOID==$id) {
				$dauOID = $dauULOutPowerOID;
			} else if ($druDLOutPowerOID==$id){
				$dauOID = $dauDLInPowerOID;
			}
			//echo "dauOID: ".$dauOID."<br>";
			$oidArray[] = $dauOID;
			$result = sendingtoMQ($sid, $dauDeviceID, $sendCount, $dauOID, True, null, $sdata[1]);
	
			if ($result) {
				$sentMsgs[] = array('pid' => $sendCount, 'oid' => $dauOID, 'did' => $dauDeviceID);
				$sendCount++;
			}		
		}
	}

	echo "sendCount: ".$sendCount."<br>";
	echo "oidArray: ".count($oidArray)."<br>";
	
		    
	// reading from MQ
	$maxRTicks = 10;        //max reading ticks will do for the mq, one tick will sleep for one second
	$rTicks = 0;            //reading tick(s) have been done
	$oidCount = count($oidArray);
	$rMessages = 0;         //read message(s) from the mq
	$recMsgArray = array(); //create an array to hold the msgs getting for the MQ
	while (($rTicks<>$maxRTicks) && ($rMessages<>$oidCount)) { 
		$revMsg = readingFromMQ(); 
		    
		if (count($revMsg)>0) {
			$did = $revMsg['Did'];
			$id = $revMsg['OID'];
			$cont = $revMsg['Content'];
			$pid = $revMsg['Pid'];
			$npCmd = $revMsg['ucNpCmd'];
			foreach ($sentMsgs as $sm) {
				if (($sm['pid']==$pid) && ($sm['oid']==$id) && ($sm['did']==$did)) {   //compared with sent list   			
					$rMessages++;
					$temp = array('did' => $did, 'OID' => $id, 'Content' => $cont, 'npCmd' => $npCmd);
					$recMsgArray[] = $temp;
					//$recMsgArray[] = $revMsg;
					echo "Pid: $pid, Oid: $id, Content: $cont<br>";
					break;
				}
			}
		} else {      	
			$rTicks++;
			echo "Reading Fails.<br>";
			sleep(1);
		}
	}
	//	  echo "rTicks is $rTicks, rMessages is $rMessages<br>"; 
	//		echo json_encode($recMsgArray);
	//			echo $recMsgArray;
		
	// convert a complex value to JSON notation
	//echo count($recMsgArray)."recMsgArray<br>";
	$output = $json->encode($recMsgArray);
	echo $output;

?>