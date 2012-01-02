<?php
				
		//include the file for reading/writing to message queue
		include 'rwMQ.php';	

                
//==============================================================================
		function objectType_00($oid)
		{
			$type = '';
			switch ($oid) {
				//------------------------------
				// signed 1 byte integer
				//------------------------------
				case 0x453:
				case 0x454:
				case 0x502:   //DL Input Power
				//case 0x505:
				//case 0x441:
				//case 0x4a5:
				case 0x704:   //DC Voltage
					$type = 'sint1';
				  	break;
				//------------------------------
				// unsigned 1 byte integer
				//------------------------------
				case 0x450:
				//case 0x402:   //PA on/off
				// case 0x4a7:   //DPD on/off
				case 0x4cc:
				case 0x4cd:   //UL on/off
				case 0x703:   //Boot Request 
				case 0x711:   //Interface Setup 
				case 0x712:   //Interface Setup 
				case 0x717:   //Interface Setup 
				case 0x800:   //DAU Optical Port 
				case 0x801:   //Chain-Position 
				case 0x804:   //M&C Status 
				case 0x805:   //Indoor 
				case 0x806:   //Band Count 
				case 0x1010:  //DAU-Config 
				case 0x1011:  //DRU-Config 
				  	$type = 'uint1';
				  	break;
				//------------------------------
				// unsigned 2 byte integer
				//------------------------------
				case 0x440:
				case 0x441:
				case 0x4a1:
				  	$type = 'uint2';
				  	break;
				//------------------------------
				// unsigned 4 bytes integer
				//------------------------------
				 case 0x4a0:				  
				 //case 0x4a5:
				  	$type = 'uint4';
				  	break;
				//------------------------------
				// double
				//------------------------------
				case 0x501:		//PA Temperature
				case 0x503:   //DL Output Power
				case 0x506:		//VSWR
				case 0x5a7:   //UL Input Power
				case 0x5a8:		//UL Output Power
				  	$type = 'double';
				  	break;
				//------------------------------
				// string - 32-char
				//------------------------------
				case 0x5:
				case 0xa:
				case 0x507:
				case 0x508:
				case 0x509:
				case 0x702:
				case 0x710:
					$type = 'string';
				  	break;

				//------------------------------
				// binary array  - 32-uint 
				//------------------------------
					case 0x3ab:  //Alarm
				//case 0x4d0:  //CFR config
					case 0x4d1:  //subband setting
						$type = 'bArray';
				  	break;
					
					
					default:
				  	$type = 'unknow';
				}
                        
			return $type;
		}
                
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
                                
// + Sep.29.2011                                
//				switch (objectType($OID)) {
				switch (objectType_00($OID)) {
                                    
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
                
		// create a new instance of Services_JSON
		require_once('JSON.php');
		$json = new Services_JSON();

		//$oidArray = array(0x0505, 0x0453, 0x0454, 0x0502, 0x0507, 0x0508, 0x0509, 0x04a5);
		$oidArray = array(0x440, 0x440, 0x503, 0x5a7, 0x501, 0x506, 0x450, 0x402, 0x4cd, 0x3ab, 0x4a7, 0x4d0);
		//$oidArray = array(0x4d1);

                
//==============================================================================                
	$data = stripslashes($_POST ["data"]);
	$type = $_POST ["type"];
	$sid = $_POST ["sid"];
	$did = $_POST ["did"];
	$dataArray = $json->decode($data);
//==============================================================================                
                
                
		echo "Sent type: $type"." - sid: $sid - did: $did "."<br>";
		echo "Sent dataArray: $dataArray type: $type"." - sid: $sid - did: $did "."<br>";
                
        
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