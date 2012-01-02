<?php

//=================================================================
// function objectType
//=================================================================
		function objectType($oid)
		{
			$type = '';
			switch ($oid) {
					// signed 1 byte integer
					case 0x453:
					case 0x454:
					case 0x501:
					case 0x502:   //DL Input Power
					case 0x503:   //DL Output Power
					case 0x505:
					//case 0x441:
					//case 0x4a5:
				  	$type = 'sint1';
				  	break;
				  // unsigned 1 byte integer
				  case 0x450:
				  case 0x402:   //PA on/off
				  case 0x4a7:   //DPD on/off
				  case 0x4cc:
				  case 0x4cd:   //UL on/off
				  case 0x506:
				  	$type = 'uint1';
				  	break;
				  // unsigned 2 byte integer
				  case 0x440:
				  case 0x441:
				  case 0x4a1:
				  	$type = 'uint2';
				  	break;
				  // unsigned 4 bytes integer
				  case 0x4a0:				  
				  case 0x4a5:
				  	$type = 'uint4';
				  	break;
				  // double
				  case 0x5a7:   //UL Input Power
				  case 0x5a8:		//UL Output Power
				  	$type = 'double';
				  	break;
					// string
					case 0x5:
					case 0xa:
					case 0x507:
					case 0x508:
					case 0x509:
						$type = 'string';
				  	break;
				  // binary array
					case 0x3ab:  //Alarm
					case 0x4d0:  //CFR config
					case 0x4d1:  //subband setting
						$type = 'bArray';
				  	break;
					default:
				  	$type = 'unknow';
				}
			return $type;
		}
//=================================================================
// function sendingtoMQ
//=================================================================                
		function sendingtoMQ($staionID, $deviceID, $packetID, $objectID, $ifQuery, $objectValue, $npCmd)
		{
			$ucSof = 0x21;
			$ucApID = 0x02;
			$ucNpID = 0x01;
			
			$Sid = $staionID;   //station ID
			$Did = $deviceID;   //Device ID
			$Pid = $packetID;   //Packet ID
			$ucNpCmd = $npCmd;    //NP layer cmd, will identify the band number;
			$NPucAPID = 0x01;
			
			if ($ifQuery) {
				$ucCmdID = 0x02;		//MAP head cmdID - Read
			} else {
				$ucCmdID = 0x03;		//MAP head cmdID - Write
			}
			
			$ucAckID = 0xff;
			//$OLen = 0x00;
			$OID = $objectID;   
			
			$usCRC = 0x00;
			$ucEof = 0x21;
			
			if ($ifQuery) {
				// read
				$binarydata = pack('CCCLCSCCCCCSSC', $ucSof, $ucApID, $ucNpID, $Sid, $Did, $Pid, $ucNpCmd, $NPucAPID, $ucCmdID, $ucAckID, $OLen, $OID, $usCRC, $ucEof);
			} else {
				// write
				$value = valueTransfer($objectValue, $OID, False);		//transfer the string to an integer
				switch (objectType($OID)) {
					// signed 1 byte integer
				case 'sint1':
					$OLen = 0x01;
				  	$parseString = 'CCCLCSCCCCCScSC';
				  	break;
				  case 'uint1':
				  	$OLen = 0x01;
					$parseString = 'CCCLCSCCCCCSCSC';
				  	break;
				  case 'uint2':
				  	$OLen = 0x02;
					$parseString = 'CCCLCSCCCCCSSSC';
				  	break;
				  // unsigned 4 bytes integer
				  case 'uint4':
				  	$OLen = 0x04;
					$parseString = 'CCCLCSCCCCCSLSC';
				  	break;
				  // double
				  case 'double':
				  	$OLen = 0x02;
					$parseString = 'CCCLCSCCCCCSdSC';
				  	break;
					// string
				  case 'string':
					// need to rewrite for string parameter writing... May 03, 2011
					$isString = True;
					$OLen = strlen($value);
					$parseString = 'CCCLCSCCCCCSC'.strlen($value).'SC';
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
					$parseString = 'CCCLCSCCCCCS';
						//echo "parseString: $parseString<br>";
				  	break;
					default:
				  	$parseString = 'CCCLCSCCCCCSCSC';
				}
				// ******************************************
				// needs to process the $objectValue
				// ******************************************
				if ($isString || $isbArray) {
					$binarydata = pack($parseString, $ucSof, $ucApID, $ucNpID, $Sid, $Did, $Pid, $ucNpCmd, $NPucAPID, $ucCmdID, $ucAckID, $OLen, $OID);
					$binarydata = $binarydata.$value;
					$binarydata = $binarydata.pack('SC', $usCRC, $ucEof);
				} else {
					$binarydata = pack($parseString, $ucSof, $ucApID, $ucNpID, $Sid, $Did, $Pid, $ucNpCmd, $NPucAPID, $ucCmdID, $ucAckID, $OLen, $OID, $value, $usCRC, $ucEof);
				}
				// var_dump($binarydata);
				// echo "<br>";
			}
			
			$message_queue_key = 0x1235;      // key of the web-to-device queue			
			$message_queue = msg_get_queue($message_queue_key, 0666);
//			var_dump($message_queue);
			$result = msg_send($message_queue, 1, $binarydata, false);
			
			return $result;
		}
                
//=================================================================
// function readingFromMQ
//=================================================================                
		function readingFromMQ()
		{
			// prepare for reading from MQ
	    $message_queue_key = 0x1234;     // key of the device-to-web queue
	    $message_queue = msg_get_queue($message_queue_key, 0666);
//	    var_dump($message_queue);
	    
	    // the standard length of $message get from the queue is 256
      // need to get the real length of it and discard the tail
      $msgArray = array();
      
// + Oct.03.2011      
//    if (msg_receive($message_queue, 0, $message_type, 256, $message, false, MSG_IPC_NOWAIT)) {
      if (msg_receive($message_queue, 1, $message_type, 256, $message, false, MSG_IPC_NOWAIT)) {
                $objLength = hexdec(bin2hex(substr($message, 14, 1)));  //Get the lenght of the Object
	    	$length = 17 + $objLength + 2 + 1;                      // Headers + obj + CRC + EOF
//	    	print_r("Length: ".$length."\r\n");
	    	$content = substr($message, 0, $length);                // get the msg in the real length
	    	      	
				$parse = "CucSof/CucApID/CucNpID/LSid/CDid/SPid/CucNpCmd/CNPucAPID/CucCmdID/CucAckID/COLen/SOID/C".$objLength."/SusCRC/CucEof";
				$msgArray = unpack($parse, $content);
				
				// ************************************************************************************
				// re-creat $parse into different formats according the different OIDs
				// ************************************************************************************	
				$oid = $msgArray['OID'];
				$isString = False;
				$isbArray = False;
                                
				switch (objectType($oid)) {
                                        //------------------------------
					// signed 1 byte integer
                                        //------------------------------
				  case 'sint1':
				  	$contentParse = "cContent";
				  	break;
                                        //------------------------------
                                        // unsigned 1 byte integer  
                                        //------------------------------  
				  case 'uint1':
				  	$contentParse = "CContent";
				  	break;	
        				//------------------------------
                			// unsigned 2 byte integer
                        		//------------------------------
				  case 'uint2':
				  	$contentParse = "SContent";
				  	break;			  	
        				//------------------------------
                			// unsigned 4 bytes integer
                        		//------------------------------
				  case 'uint4':
				  	$contentParse = "LContent";
				  	break;
        				//------------------------------
                			// double
                        		//------------------------------
				  case 'double':
				  	$contentParse = "dContent";
				  	break;
        				//------------------------------
                			// string - 32-char
                        		//------------------------------
				  case 'string':
					$isString = True;
				  	$contentParse = "C".$objLength;
				  	break; 
        				//------------------------------
                			// binary array  - 32-uint 
                        		//------------------------------
				  case 'bArray':
					$isbArray = True;
				  	$contentParse = "C".$objLength;
				  	break;
        				//------------------------------
                                        // unknow
        				//------------------------------
				  default:
				  	$contentParse = "C".$objLength;
                                        //echo "<br>error: ".$oid;
				}

                                $newParse = "CucSof/CucApID/CucNpID/LSid/CDid/SPid/CucNpCmd/CNPucAPID/CucCmdID/CucAckID/COLen/SOID/".$contentParse."/SusCRC/CucEof";				
                                
                                
                	      	$msgArray = unpack($newParse, $content);
	      
	      //re-create value to readable format
	      if ($isString || $isbArray) {    //string value or binary array
	    		$str = "";
	    		if ($objLength > 0) {
		    		for($i=1; $i<=$objLength; $i++)
		    		{
		    			if ($isString) {
		    			$str = $str.chr($msgArray[$i]);
			    		} else {
			    			$str = $str.intval($msgArray[$i]);
			    		}
		    			//echo chr($msgArray[$i]);
		    			unset($msgArray[$i]);
		    		}
		    	}
		    	$msgArray['Content'] = $str; 
		    } else {
		    	$msgArray['Content'] = valueTransfer($msgArray['Content'], $msgArray['OID'], True);
		    }
	    	}
    	
    		return $msgArray;
		}

//==============================================================================
// function byteswap2 swaps 2 bytes data for endian byte order
//==============================================================================
        function byteswap2($data,$flag) {

            $nNmZero = 0;
            
            if (is_int($data)) {
                
               if ($flag == 1 ) { 
                
                    $Stgdata = decbin($data) ;
//echo " ***  within  byteswap2 - len of Stgdata -".$Stgdata." IS ".strlen($Stgdata)."  *** " ;           
                    if (strlen($Stgdata) < 16 ) {
                        $nNmZero = 16 - strlen($Stgdata)  ;
                        for ($i=0; $i<$nNmZero; $i++) {
                            $Stgdata = "0".$Stgdata ;
                        }
                    }
                    $StgFst =substr($Stgdata,0,8) ;
                    $StgSnd =substr($Stgdata,8,8) ;
                    $StgOut =$StgSnd.$StgFst ;
               
               } else {

                    $StgOut = strval($data)."0" ;
               }
            }
//echo " ***  within  byteswap2 - len of Stgdata -".$Stgdata." IS ".strlen($Stgdata)."  *** " ;           
//echo " ***  within  byteswap2 - len of StgOut  -".$StgOut."  IS ".strlen($StgOut)."  *** " ;           
            return bindec($StgOut) ;
         }        

//==============================================================================
//      function hex_dump - debug tool
//==============================================================================        
        function hex_dump($data, $newline="\n")
        {
            static $from = '';
            static $to = '';
            static $width = 18; # number of bytes per line

            static $pad = '.'; # padding for non-visible characters

            if ($from==='')
            {
                for ($i=0; $i<=0xFF; $i++)
                {
                    $from .= chr($i);
                    $to .= ($i >= 0x20 && $i <= 0x7E) ? chr($i) : $pad;
                }
            }
            $hex = str_split(bin2hex($data), $width*2);
            $chars = str_split(strtr($data, $from, $to), $width);
            $offset = 0;
            foreach ($hex as $i => $line)
            {
                echo sprintf('%6X',$offset).' : '.implode(' ', str_split($line,2)) . ' [' . $chars[$i] . ']' . $newline;
                $offset += $width;
            }
        }

//===============================================================================
//    function objectType_00
//    caller : rwParam.php
//             rwDAUCfg.php
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

// Debug
//echo " -- within objectType_00 - type ".$type."</br>" ;                               
                                
			return $type;
		}
                
//==================================================================
// function valueTransfer
//==================================================================                
		function valueTransfer($var, $oid, $isRead)
		{
			$tdValue = 0;
			switch ($oid) {
					case 0x440:		//DRU Attenuation
					case 0x441:		//DAU Attenuation
				  	if($isRead) {
				  		$tdValue = $var/2;
				  	} else {
				  		$tdValue = $var*2;
				  	}
				  	break;
				  	case 0x4a0:		//Optical Delay
				  	case 0x4a1:		//Delay Compensation
				  	if($isRead) {
				  		$tdValue = $var/100;
				  	} else {
				  		$tdValue = $var*100;
				  	}
				  	break;
//				  case 0x04a5:  //ALC UL Threshold
//				  	$offset = 15;
//				  	if($isRead) {
//				  		$tdValue = (10 * log10($var/pow(2, 12))) - $offset;
//				  	} else {
//				  		$tdValue = pow(2, 12) * pow(10, ($var+$offset)/10);
//				  	}
//				  	$tdValue = intval($var);
//				  	//echo 'ALC UL Threshold: '.$tdValue.'   ';
//				  	break;
//				  case 0x453:
//				  case 0x454:
//				  case 0x4cc:
//				  case 0x4cd:
//				  	$tdValue = intval($var);
//				  	break;
					// string
					case 0x5:
					case 0xa:
					case 0x3ab:
					case 0x507:
					case 0x508:
					case 0x509:
						$tdValue = $var;
						break;
					case 0x5a7:  //UL Input Power
					case 0x5a8:  //UL Output Power
						$tdValue = floatval($var);
				  	break;
				 	case 0x4d0:  //CFR config
				 		if($isRead) {
							$tdValue = $var;
						} else {
							// tranfer a string to a 4 bytes array
							$sArray = array();
							for($i=0; $i<4; $i++) {
								$sArray[$i] = intval(substr($var, $i, 1));
							}
							$tdValue = pack('CCCC', $sArray[0],$sArray[1],$sArray[2],$sArray[3]);
						}
				 		break;
				 	case 0x4d1:  //subband setting
				 		if($isRead) {
							$tdValue = $var;
						} else {
							// tranfer a string to a 15 bytes array
//							$sArray = array();
//							for($i=0; $i<15; $i++) {
//								$sArray[$i] = intval(substr($var, $i, 1));
//							}
//							$tdValue = pack('CCCCCCCCCCCCCCC', $sArray[0],$sArray[1],$sArray[2],$sArray[3],$sArray[4],$sArray[5],$sArray[6],$sArray[7],$sArray[8],$sArray[9],$sArray[10],$sArray[11],$sArray[12],$sArray[13],$sArray[14]);
							$tdValue = '';
							for($i=0; $i<15; $i++) {
								$tdValue = $tdValue.pack('C', intval(substr($var, $i, 1)));
							}
						}
				 		break;
					default:
				  	$tdValue = intval($var);
				}
			return $tdValue;
		}
?>