<?php
				
		//include the file for reading/writing to message queue
		include 'rwMQ.php';	
		
		// create a new instance of Services_JSON
		require_once('JSON.php');
		$json = new Services_JSON();

		//$oidArray = array(0x0505, 0x0453, 0x0454, 0x0502, 0x0507, 0x0508, 0x0509, 0x04a5);
		//$oidArray = array(0x441, 0x505, 0x453, 0x454, 0x502, 0x507, 0x508, 0x509, 0x4a5);
		$oidArray = array(0x04d1);
		$sentMsgs = array();
// writing to MQ
		$sendCount=0;
		foreach ($oidArray as $id) {
			if (0x04d1 <> $id) {
				$result = sendingtoMQ(0x12345678, 0xc6, $sendCount, $id, False, 0, 1);
			} else {
				$result = sendingtoMQ(0x12345678, 0x0, $sendCount, $id, False, '000000100000000', 2);
			}
			if ($result) {
				$sentMsgs[] = array('pid' => $sendCount, oid => $id);
				$sendCount++;
			}
//			$resendCount = 0;
//			while ((False==$result) && ($resendCount<3))
//			{
//				echo "Resend again.";
//				$result = msg_send($message_queue, 1, $binarydata, false);
//				$resendCount++;
//			}
		}
		echo "Sent messages: $sendCount<br>";
        
    // reading from MQ
    $maxRTicks = 10;        //max reading ticks will do for the mq, one tick will sleep for one second
    $rTicks = 0;            //reading tick(s) have been done
    $oidCount = count($oidArray);
    $rMessages = 0;         //read message(s) from the mq
    $recMsgArray = array(); //create an array to hold the msgs getting for the MQ
    while (($rTicks<>$maxRTicks) && ($rMessages<>$oidCount)) { 
    	$revMsg = readingFromMQ(); 
    
      if (count($revMsg)>0) {
       	$id = $revMsg['OID'];
	      $cont = $revMsg['1'];
	      $pid = $revMsg['Pid'];
       	foreach ($sentMsgs as $sm) {
        	if (($sm['pid']==$pid) && ($sm['oid']==$id)) {   //compared with sent list   			
		      	$rMessages++;
		        $recMsgArray[] = $revMsg;
//		        echo "Pid: $pid, Oid: $id, Content: $cont<br>";
		        break;
		      }
	      }
	    } else {      	
	      $rTicks++;
//	      echo "Reading Fails.<br>";
	      sleep(1);
	    }
	  }
//	  echo "rTicks is $rTicks, rMessages is $rMessages<br>"; 
//		echo json_encode($recMsgArray);
//			echo $recMsgArray;

// convert a complex value to JSON notation
$output = $json->encode($recMsgArray);
echo $output;

?>