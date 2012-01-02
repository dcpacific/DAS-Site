<?php
				
		//include the file for reading/writing to message queue
		include 'rwMQ.php';	
		
		// create a new instance of Services_JSON
		require_once('JSON.php');
		$json = new Services_JSON();

//==============================================================================                

        function sndtoMQ_00($staionID, $deviceID, $packetID, $objectID, $ifQuery, $objectValue, $npCmd)
		{

                        // block of OBSOLETE variables 
                        $ucSof = 0x21;                          
                        $usCRC = 0x00;                           
			$ucEof = 0x21;                          
                        
                        //------------------------------------------------------
                        // block of Frame Header variables
                        //------------------------------------------------------
			$ucApID = 0x02;
			$ucNpID = 0x01;
			
			$Sid = $staionID;   //station ID
			$Did = $deviceID;   //Device ID
			$Pid = $packetID;   //Packet ID
			$ucNpCmd = $npCmd;  //NP layer cmd, will identify the band number;
			$NPucAPID = 0x01;
			
                        if ($ifQuery) {
				$ucCmdID = 0x02;		//MAP head cmdID - Read
                                $GetSetReq = 0x02;             // GET request 
                                
			} else {
				$ucCmdID = 0x03;		//MAP head cmdID - Write
                                $GetSetReq = 0x03;             // SET request 
                        }

                        // + Sep.28.2011
                        // MAP-NoIDs - Number of OID parts to follow
                        $ucNoID  = 1;
                        
                        //------------------------------------------------------
                        //block of Contents Part 
                        //------------------------------------------------------
                        $OCSrc = 0x00 ;                       // MUST be device unit
			$OCAckID = 0xff;
                        $OCLen = 0x00 ;
                        
			//$OLen = 0x00;
			$OID = $objectID;
			
			if ($ifQuery) {
				
                                // read
                                //-------------------------------------------------------------------
                                // Update for NEW Protocol, still come with one content once at a time 
                                //-------------------------------------------------------------------
                              //$binarydata = pack('CCCLCSCCCCCSSC', $ucSof, $ucApID, $ucNpID, $Sid, $Did, $Pid, $ucNpCmd, $NPucAPID, $ucCmdID, $ucAckID, $OLen, $OID, $usCRC, $ucEof);
                                $binarydata = pack('CCLCSCCCCCSS', $ucApID, $ucNpID, $Sid, $Did, $Pid, $ucNpCmd, $ucCmdID, $ucNoID,$OCSrc,$OCAckID, $OCLen, $OID );
                                
			} else {
                            
				// write
				$value = valueTransfer($objectValue, $OID, False);		//transfer the string to an integer
                                
				switch (objectType($OID)) {
                                    
                                        // signed 1 byte integer
				case 'sint1':
					$OLen = 0x01;
// + Sep.28.2011
//				  	$parseString = 'CCCLCSCCCCCScSC';
                                        $parseString = 'CCLCSCCCCCCSc';
				  	break;
                                    
				  case 'uint1':
				  	$OLen = 0x01;
// + Sep.28.2011
//					$parseString = 'CCCLCSCCCCCSCSC';
					$parseString = 'CCLCSCCCCCCSC';
				  	break;
                                    
				  case 'uint2':
				  	$OLen = 0x02;
// + Sep.28.2011
//                                      $parseString = 'CCCLCSCCCCCSSSC';
                                        $parseString = 'CCLCSCCCCCCSS';
				  	break;

                                    // unsigned 4 bytes integer
				  case 'uint4':
				  	$OLen = 0x04;
// + Sep.28.2011
//					$parseString = 'CCCLCSCCCCCSLSC';
					$parseString = 'CCLCSCCCCCCSL';
				  	break;
                                    
                                    // double
				  case 'double':
				  	$OLen = 0x02;
// + Sep.28.2011
//					$parseString = 'CCCLCSCCCCCSdSC';
					$parseString = 'CCLCSCCCCCCSd';
				  	break;
                                    
                                    // string
				  case 'string':
					// need to rewrite for string parameter writing... May 03, 2011
					$isString = True;
					$OLen = strlen($value);
// + Sep.28.2011
//					$parseString = 'CCCLCSCCCCCSC'.strlen($value).'SC';
					$parseString = 'CCLCSCCCCCCSC'.strlen($value) ;
				  	break;
                                    
                                    // bArray
				  case 'bArray':
					$isbArray = True;
					$OLen = strlen($value);
						//$arrLen = strlen($value);
						//$parseString = 'CCCLCSCCCCCSC'.strlen($value);
						// for ($i=0; $i<$arrLen; $i++) {
							// $parseString = $parseString.$value[$i];
						// }
						//$parseString = $parseString.'SC';
// + Sep.28.2011
//                                      $parseString = 'CCCLCSCCCCCS';
                                        $parseString = 'CCLCSCCCCCCS';

//echo "parseString: $parseString<br>";
				  	break;
				default:
// + Sep.28.2011
//				  	$parseString = 'CCCLCSCCCCCSCSC';
					$parseString = 'CCLCSCCCCCCSC';
                                    
                                }
				// ******************************************
				// needs to process the $objectValue
				// ******************************************
				if ($isString || $isbArray) {
                                    
                                    // + Sep.28.2011
                                    //$binarydata = pack($parseString, $ucSof, $ucApID, $ucNpID, $Sid, $Did, $Pid,    $ucNpCmd, $NPucAPID, $ucCmdID, $ucAckID, $OLen, $OID);
                                      $binarydata = pack($parseString, $ucApID,$ucNpID, $Sid,    $Did, $Pid, $ucNpCmd,$ucCmdID, $ucNoID,   $OCSrc,   $OCAckID, $OCLen,$OID );
                                    
                                      $binarydata = $binarydata.$value;
                                        
                                    // + Sep.28.2011
                                    //$binarydata = $binarydata.pack('SC', $usCRC, $ucEof);
				} else {

                                    // + Sep.28.2011
                                    //$binarydata = pack($parseString, $ucSof, $ucApID, $ucNpID, $Sid, $Did, $Pid, $ucNpCmd, $NPucAPID, $ucCmdID, $ucAckID, $OLen, $OID, $value, $usCRC, $ucEof);
                                    $binarydata = pack($parseString, $ucApID, $ucNpID, $Sid, $Did, $Pid, $ucNpCmd, $ucCmdID, $ucNoID, $OCSrc, $OCAckID, $OCLen, $OID, $value );
                                    
                                }
				// var_dump($binarydata);
				// echo "<br>";
			}
			
                        // Obtain key for Linux Message Quenue with permission 
			$message_queue_key = 0x1235;      // key of the web-to-device queue			
			$message_queue = msg_get_queue($message_queue_key, 0666);
//			var_dump($message_queue);
			$result = msg_send($message_queue, 1, $binarydata, false);
			
			return $result;
		}
                         
                
//==============================================================================                
                
		//$oidArray = array(0x0505, 0x0453, 0x0454, 0x0502, 0x0507, 0x0508, 0x0509, 0x04a5);
		//$oidArray = array(0x441, 0x505, 0x453, 0x454, 0x502, 0x507, 0x508, 0x509, 0x4a5);
		$oidArray = array(0x4d1);
		$sentMsgs = array();
// writing to MQ
		$sendCount=0;
		foreach ($oidArray as $id) {

// + Sep.29.2011 
//                      $result = sendingtoMQ(0x12345678, 0x0, $sendCount, $id, True, null, 2);
                        $result = sndtoMQ_00(0x12345678, 0x0, $sendCount, $id, True, null, 2);

                    
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