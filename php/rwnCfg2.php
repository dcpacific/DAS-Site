<?php

//===============================================================================
// Caller:  dauConfig.html (set)
//          druConfig.html (set)
//          index.html     (notification)
// note:
//          this file is based on rwnCfg.php - everything the same, except the did pay attention to Low Byte of IP Address  + Nov.22.2011
//===============================================================================

	//include the file for reading/writing to message queue
	include 'rwMQ.php';	
//=======================================================
//       function readingFromMQ_01 polling MQ for a 
//=======================================================
	function readingFromMQ_01()
		{
			// prepare for reading from MQ
	    $message_queue_key = 0x1234;     // key of the device-to-web queue
	    $message_queue = msg_get_queue($message_queue_key, 0666);
	    
	    // the standard length of $message get from the queue is 256
            // need to get the real length of it and discard the tail
            $msgArray = array();
      
      if (msg_receive($message_queue, 1, $message_type, 256, $message, false, MSG_IPC_NOWAIT)) {


                //Get the lenght of the Object
//================================================
//  note : both old msg format and new have the field,OC-len, located at field no. 15          
//         i.e. string location 14, and old format only occupies 1 byte, whiile the new occupies 2 
//================================================
                $objLength = hexdec(bin2hex(substr($message, 14, 2)));  
	    	$length = 18 + $objLength ;                      // Headers + obj + CRC + EOF

// + Sep.30.2011
//echo " inside readingFromMQ_01 - message : ".$message ;              
//echo " inside readingFromMQ_01 - length : ".$length ;              
//echo " inside readingFromMQ_01 - message_type : ".$message_type ;              
                
                                $content = substr($message, 0, $length);                // get the msg in the real length
	    	      	
// + Oct.06.2011                
				//==============================================================================
				// During unpack, only care about fields Object ID and Object Length to retrieve content, althought the field  $ucNpCmd  is replaced by  $ucUpPrtID, its ignored 
				//==============================================================================          
				$parse = "CucApID/CucNpID/VSid/CDid/nPid/CNPucAPID/CucNpCmd/CucNoID/CucCmdID/CucAckID/vOLen/vOID/C".$objLength          ;
 
				$msgArray = unpack($parse, $content);

// + Debug Oct.02.2011 
				// ************************************************************************************
				// re-creat $parse into different formats according the different OIDs
				// ************************************************************************************	
				$oid = $msgArray['OID'];
				$isString = False;
				$isbArray = False;
                                
// + Debug Sep.30.2011
//echo " -- within  readingFromMQ_01  oid: ".$oid ."</br>";
// + Oct.06.2011
                                // flip the byte back to proper order
                                $oid2 = byteswap2($oid,1) ;
              
// + Debug Sep.30.2011
//echo " -- within  readingFromMQ_01  oid2: ".$oid2 ."</br>";
//var_dump($msgArray) ;
	      //re-create value to readable format
    	}
    	
    		return $msgArray;
}                
                
//=======================================================
//      function sndtoMQ_00
//      note : $npCmd - caller field  data[1] - RF Band  Id  (i.e. Band 1, 2, 3, 4 and System 0 )
//             $IsDRU - additional flag from caller to work around fro simulator
//=======================================================
        function sndtoMQ_00($staionID, $deviceID, $packetID, $objectID, $ifQuery, $objectValue, $npCmd, $flag )
		{

// + Oct.02.2011
//echo " within sndtoMQ - old - Pid:".$Pid." - OCLen:".$OCLen." - OID:".$OID."<br>" ; 
//echo " within sndtoMQ - Pid:".$packetID." - OID:".$objectID." - npCmd: ".$npCmd." - flag: ".$flag."<br>" ; 

                        //------------------------------------------------------
                        // block of FIXED Frame Header variables
                        //------------------------------------------------------
			$ucApID = 0x02;                                  // Frame Header AP-ApID
			$ucNpID = 0x01;                                  // Frame Header AP-NpID 
			$ucUpPrtID=0x01;                                // NP-UpperProtocol-ID
			
			$Sid = $staionID;   //station ID
			$Did = $deviceID;   //Device ID
			$Pid = $packetID;   //Packet ID
			
			//NP layer cmd, will identify the band number;
			//+-----------------------------------------------------------------------------
			//|  Obsolete
			//+-----------------------------------------------------------------------------
			$ucNpCmd = $npCmd;  
			//+-----------------------------------------------------------------------------
			//| constant x01
			//+-----------------------------------------------------------------------------
			$NPucAPID = 0x01;
                        //------------------------------------------------------
			//  $OCSrc is the RF Band         
			//------------------------------------------------------
			$OCSrc = $npCmd ;                      // Import RF Band  i.e. 1 - 4 or 0

                        if ($ifQuery) {
			//-----------------
                        // notification
			//-----------------
                            
				$ucCmdID = 0x01;		//MAP head cmdID - 
                                $GetSetReq = 0x01;             // GET request 
                                
			} else {
			//-----------------
                        // write
			//-----------------
				$ucCmdID = 0x03;		//MAP head cmdID - Write
                                $GetSetReq = 0x03;             // SET request 
                        }

                        // + Sep.28.2011
                        // MAP-NoIDs - Number of OID parts to follow
                        $ucNoID  = 1;
                        
			$OCAckID = 0xff;
                        $OCLen = 0x00 ;
                        
			//$OLen = 0x00;
			$OID = $objectID;
                        
                        //------------------------------------------------------
                        //Work around for UL and DL Attention 
                        //------------------------------------------------------

// + Oct.02.2011
//echo " within sndtoMQ - old - Pid:".$Pid." - OCLen:".$OCLen." - OID:".$OID."<br>" ; 
//echo " within sndtoMQ - old - Pid:".$Pid." - OID:".$OID." - OCSrc: ".$OCSrc." - npCmd: ".$npCmd."<br>" ; 

                        //------------------------------------------------------
                        // format 'n' for pack, the unsigned short (always 16 bit, big endian byte order) will swap the 2 bytes
                        //------------------------------------------------------
			if ($ifQuery) {
				

                            //--------------------------
                            // notification
                            //--------------------------
                                
                                //-------------------------------------------------------------------
                                // Update for NEW Protocol, still come with one content once at a time 
                                // note: pack format changing from 'L' -unsigned long (always 32 bit, machine byte order) to 
                                //                                 'N' -unsigned long (always 32 bit, big endian byte order)
                                //                   changing from 'S' -unsigned short (always 16 bit, machine byte order) to
                                //                                 'n' -unsigned short (always 16 bit, big endian byte order)            
                                //-------------------------------------------------------------------
                              //$binarydata = pack('CCCLCSCCCCCSSC', $ucSof, $ucApID, $ucNpID, $Sid, $Did, $Pid, $ucNpCmd, $NPucAPID, $ucCmdID, $ucAckID, $OLen, $OID, $usCRC, $ucEof);

				// + Oct.14.2011 
//				$binarydata = pack('CCNCnCCCCCnn', $ucApID, $ucNpID, $Sid, $Did, $Pid,     $ucNpCmd, $ucCmdID, $ucNoID,$OCSrc,$OCAckID, $OCLen,     $OID );
                                //-------------------------------------------------------------------
				//|  Note : $ucApID, $ucNpID, $ucUpPrtID  are fixed, $OCSrc  is the import RF Band no.
				//-------------------------------------------------------------------
				$binarydata = pack('CCNCnCCCCCnn', $ucApID, $ucNpID, $Sid, $Did, $Pid,     $ucUpPrtID, $ucCmdID, $ucNoID,$OCSrc,$OCAckID, $OCLen,     $OID );

// + Debug Hex Dump 05.oct.2011 
//echo " *** Here Comes the Hex Dump *** " ;                                
//hex_dump($binarydata, "\n") ;      
//echo " *** Hex Dump end            *** " ;  
                                
			} else {
                            
// + Oct.21.2011
//echo " within sndtoMQ - write - OID:".$OID." - objVale - ".$objectValue."<br>" ; 

                                // write

                                if (objectType_00($OID) != 'string' ) {
                                    $value = valueTransfer($objectValue, $OID, False);		//transfer the string to an integer
// Debug
//                                    echo ' ** value = '.$value."</br>";
                                } else {
                                    $value = $objectValue;		
                                    
                                }
                                
				switch (objectType_00($OID)) {
                                        // signed 1 byte integer
				case 'sint1':
					$OLen = 0x01;
//	                                        $parseString = 'CCLCSCCCCCCSc';
// + Oct.11.2011
					$parseString = 'CCNCnCCCCCnnc' ;
					break;
                                    
				  case 'uint1':
				  	$OLen = 0x01;
					
//					$parseString = 'CCLCSCCCCCCSC';
// + Oct.11.2011
					$parseString = 'CCNCnCCCCCnnC' ;
					break;
                                    
				  case 'uint2':
				  	$OLen = 0x02;
//		                              $parseString = 'CCLCSCCCCCCSS';
// + Oct.11.2011
                                        $parseString = 'CCNCnCCCCCnnn';
				  	break;

                                    // unsigned 4 bytes integer
				  case 'uint4':
				  	$OLen = 0x04;
// + Oct.11.2011
//					$parseString = 'CCLCSCCCCCCSL';
					$parseString = 'CCNCnCCCCCnnN';		
				  	break;
                                    
                                    // double
				  case 'double':
				  	$OLen = 0x02;
// + Oct.11.2011
//					$parseString = 'CCLCSCCCCCCSd';
					$parseString = 'CCNCnCCCCCnnd';
					break;
                                    
                                    // string
				  case 'string':
					// need to rewrite for string parameter writing... May 03, 2011
					$isString = True;
//					$OLen = strlen($value);
// + Oct.25.2011                                      
                                        $OLen = strlen($objectValue);                                        
// + Oct.11.2011
//					$parseString = 'CCLCSCCCCCCSC'.strlen($value) ;
// + Oct.25.2011                                      
//					$parseString = 'CCNCnCCCCCnnC'.strlen($value) ;
//					$parseString = 'CCNCnCCCCCnnC'.strlen($objectValue); 					

					$parseString = 'CCNCnCCCCCnn'; 					
                                        
                                        
                                        
                                        break;
                                    
                                    // bArray
				  case 'bArray':
					$isbArray = True;
					$OLen = strlen($value);
// + Oct.11.2011
//					$parseString = 'CCLCSCCCCCCS';
					$parseString = 'CCNCnCCCCCnn';
					break;
					
				default:
// + Oct.11.2011
//					$parseString = 'CCLCSCCCCCCSC';
					$parseString = 'CCNCnCCCCCnnC';
                                   
                                }
// + Oct.21.2011
//echo " ** arseString: ".$parseString." - value -".$value."<br>" ; 

                                // ******************************************
				// needs to process the $objectValue         - to be continued ??? - $OLen ???
				// ******************************************
				if ($isString || $isbArray) {
// + Debug Oct.21.2011
//echo " ** S+B **</br>" ;

// + Oct.21.2011 
 
//echo " - ucApID -".$ucApID."</br>"; 
//echo " - ucNpID -".$ucNpID."</br>"; 
//echo " - Sid -".$Sid."</br>"; 
//echo " - Did -".$Did."</br>"; 
//echo " - Pid -".$Pid."</br>"; 
//echo " - ucUpPrtID -".$ucUpPrtID."</br>"; 
//echo " - ucCmdID -".$ucCmdID."</br>"; 
//echo " - ucNoID -".$ucNoID."</br>"; 
//echo " - OCSrc -".$OCSrc."</br>"; 
//echo " - OCAckID -".$OCAckID."</br>"; 
//echo " - OLen -".$OLen."</br>"; 
//echo " - OID  -".$OID ."</br>"; 
//echo " - value  -".$value ."</br>"; 

 
//					$binarydata = pack($parseString,      $ucApID,  $ucNpID, $Sid,    $Did, $Pid,     $ucNpCmd, $ucCmdID,  $ucNoID,   $OCSrc,   $OCAckID, $OCLen,     $OID );
//					$binarydata = pack($parseString, $ucApID, $ucNpID, $Sid,    $Did, $Pid,     $ucUpPrtID, $ucCmdID, $ucNoID,   $OCSrc,    $OCAckID, $OCLen,     $OID );
//=======================================
// OCLen is not set, OLen is set with type
//=======================================
//					$binarydata = pack($parseString, $ucApID, $ucNpID, $Sid,    $Did, $Pid,     $ucUpPrtID, $ucCmdID, $ucNoID,   $OCSrc,    $OCAckID, $OLen,     $OID );
//					$binarydata = $binarydata.$value;
					$binarydata = pack($parseString, $ucApID, $ucNpID, $Sid,    $Did, $Pid,     $ucUpPrtID, $ucCmdID, $ucNoID,   $OCSrc,    $OCAckID, $OLen,     $OID );
//echo " - binary data - :".$binarydata."</br>";

                                        $binarydata = $binarydata.$value;
                                        
				} else {

// + Oct.21.2011
//echo " ** ?? ** </br>" ;
//echo " ** arseString: ".$parseString."<br>" ; 

// + Oct.21.2011
//                                    $binarydata = pack($parseString, $ucApID, $ucNpID, $Sid,     $Did, $Pid,    $ucNpCmd,  $ucCmdID, $ucNoID,   $OCSrc,    $OCAckID, $OCLen,     $OID, $value );
//				      $binarydata = pack($parseString,   $ucApID, $ucNpID, $Sid, $Did, $Pid,     $ucUpPrtID, $ucCmdID, $ucNoID,$OCSrc,$OCAckID,$OCLen,     $OID, $value );
//=======================================
// OCLen is not set, OLen is set with type
// ??? - after the PHP pack to binary string - the Hex dump shows station ID is zero - rather than the one assigned ??
//=======================================
				      $binarydata = pack($parseString,   $ucApID, $ucNpID, $Sid, $Did, $Pid,     $ucUpPrtID, $ucCmdID, $ucNoID,$OCSrc,$OCAckID,$OLen,     $OID, $value );
                                      
                                }
				// var_dump($binarydata);
				// echo "<br>";
// + Debug Hex Dump 21.oct.2011 
//echo " *** Here Comes the Hex Dump *** " ;                                
//hex_dump($binarydata, "\n") ;      
//echo " *** Hex Dump end            *** " ;  
                                
                                
                                
			}
			
                        // Obtain key for Linux Message Quenue with permission 
			$message_queue_key = 0x1235;      // key of the web-to-device queue			
			$message_queue = msg_get_queue($message_queue_key, 0666);
// + Debug 03.oct.2011
//			var_dump($message_queue);
                        $result = msg_send($message_queue, 1, $binarydata, false);
			
			return $result;
		}

//=======================================================
//       function readingFromMQ_00
//=======================================================
	function readingFromMQ_00()
		{
			// prepare for reading from MQ
	    $message_queue_key = 0x1234;     // key of the device-to-web queue
	    $message_queue = msg_get_queue($message_queue_key, 0666);
//	    var_dump($message_queue);
	    
	    // the standard length of $message get from the queue is 256
            // need to get the real length of it and discard the tail
            $msgArray = array();
      
// + Oct.03.2011 change the desired messafge type from 0 (anything) to 1 (Webserver specific)      
//    if (msg_receive($message_queue, 0, $message_type, 256, $message, false, MSG_IPC_NOWAIT)) {
      if (msg_receive($message_queue, 1, $message_type, 256, $message, false, MSG_IPC_NOWAIT)) {


                //Get the lenght of the Object
//              $objLength = hexdec(bin2hex(substr($message, 14, 1)));  
//	    	$length = 17 + $objLength + 2 + 1;                      // Headers + obj + CRC + EOF
//==============================================================================          
//  note : both old msg format and new have the field,OC-len, located at field no. 15          
//         i.e. string location 14, and old format only occupies 1 byte, whiile the new occupies 2 
//==============================================================================          
                $objLength = hexdec(bin2hex(substr($message, 14, 2)));  
	    	$length = 18 + $objLength ;                      // Headers + obj + CRC + EOF

// + Sep.30.2011
//print_r(" inside readingFromMQ_00 --message_type  ".$message_type."\r\n") ;
//print_r(" message ".$message."\r\n"); 
//print_r(" inside readingFromMQ_00 --Length: ".$length."\r\n");

// + Sep.30.2011
//echo " inside readingFromMQ_00 - message_type : ".$message_type ;              
//echo " inside readingFromMQ_00 - message : ".$message ;              
//echo " inside readingFromMQ_00 - length : ".$length ;              
//echo " inside readingFromMQ_00 - message_type : ".$message_type ;              
                
                                $content = substr($message, 0, $length);                // get the msg in the real length
	    	      	
// + Oct.06.2011                
//				$parse = "CucSof/ CucApID/ CucNpID/ LSid/ CDid/ SPid/ CucNpCmd/ CNPucAPID/ CucCmdID/ CucAckID/ COLen/ SOID/C".$objLength."/SusCRC/CucEof";
//                              $parse = "CucApID/CucNpID/LSid/CDid/SPid/CNPucAPID/CucNpCmd/CucNoID/CucCmdID/CucAckID/SOLen/SOID/C".$objLength          ;
				//==============================================================================
				// During unpack, only care about fields Object ID and Object Length to retrieve content, althought the field  $ucNpCmd  is replaced by  $ucUpPrtID, its ignored 
				//==============================================================================          
                                $parse = "CucApID/CucNpID/VSid/CDid/nPid/CNPucAPID/CucNpCmd/CucNoID/CucCmdID/CucAckID/vOLen/vOID/C".$objLength          ;
 
				$msgArray = unpack($parse, $content);

// + Debug Oct.02.2011 
//echo " inside readingFromMQ_00 - parse : ".$parse ;              
//var_dump(unpack($parse, $content)) ;                                
                                
				// ************************************************************************************
				// re-creat $parse into different formats according the different OIDs
				// ************************************************************************************	
				$oid = $msgArray['OID'];
// + Sep.30.2011                
//print_r("oid: ".$oid."\r\n");
// + Oct.21.2011                
//echo "oid: ".$oid."\r\n";
                                
				$isString = False;
				$isbArray = False;
                                
// + Oct.06.2011
                                // flip the byte back to proper order
                                $oid2 = byteswap2($oid,1) ;

// + Oct.21.2011                
//echo "oid2: ".$oid2."\r\n";
                                
// + Sep.29.2011                                
//				switch (objectType($oid)) {
//				switch (objectType_00($oid)) {
				switch (objectType_00($oid2)) {

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
// + Debug Sep.30.2011
echo "<br>error: ".$oid;
				}

// + Debug Oct.21.2011
//echo "<br>contentParse: ".$contentParse."</br>";


// + Oct.06.2011                                
//            $newParse = "CucSof/CucApID/CucNpID/LSid/CDid/SPid/CucNpCmd/CNPucAPID/CucCmdID/CucAckID/COLen/SOID/".$contentParse."/SusCRC/CucEof";				
//            $newParse = "CucApID/CucNpID/LSid/CDid/SPid/CNPucAPID/CucNpCmd/CucNoID/CucCmdID/CucAckID/SOLen/SOID/".$contentParse ;
              $newParse = "CucApID/CucNpID/VSid/CDid/nPid/CNPucAPID/CucNpCmd/CucNoID/CucCmdID/CucAckID/vOLen/vOID/".$contentParse ;

              
// + Debug Sep.30.2011
//echo "<br> newParse: ".$newParse;
//var_dump(unpack($newParse, $content)) ;
              
              $msgArray = unpack($newParse, $content);

// + Debug Oct.06.2011
//echo " --  within readingFromMQ_00 ** <br> newParse: ".$newParse;
//var_dump($msgArray) ;


	      //re-create value to readable format
	      if ($isString || $isbArray) {    //string value or binary array

// + Debug oct.06.2011
//echo " inside readingFromMQ_00 - isString or isbArray " ;              
                  
                  
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
                
//================== start ==============================

	// create a new instance of Services_JSON
	require_once('JSON.php');
	$json = new Services_JSON();
		
	$data = stripslashes($_POST ["data"]);
	$type = $_POST ["type"];
	$sid = $_POST ["sid"];
	$did = $_POST ["did"];
		
	$dataArray = $json->decode($data);
        
//==============================================================================         
//echo "Sent type: $type"." - sid: $sid - did: $did "."<br>";
//		echo "Sent dataArray: $dataArray type: $type"." - sid: $sid - did: $did "."<br>";
//echo "band is ".$_REQUEST["deviceMode"];                
//echo count($dataArray);
//==============================================================================        

	$oidArray = array();		// create an oid array
	$sentMsgs = array();
	
	// writing to MQ
	$sendCount=0;
	
//+----------------------------------------------------
//| Counter set for UL Attention and DL Attention, as both share Object Code
//| 0X441, need to notify caller sndtoMQ_00 to work around
//+-----------------------------------------------------------------------------
        $flag_UL_DL = 0;

//+----------------------------------------  
//| Work around for DRU-simulator as simulator only handles DRU IP Address 01 to 06
//+----------------------------------------  
//        $did = ( substr($_REQUEST["deviceMode"],0,3) == "DRU" ) ? 0x05 : $_POST ["did"] ;
//+----------------------------------------  
//| IP Address Byte for DAU is zero, DRU is 1 to 255    + Nov.22.2011
//+----------------------------------------  
        $did = ( substr($_REQUEST["deviceMode"],0,3) == "DRU" ) ? $_POST ["ip"] : $_POST ["did"] ;
        

// + Debug 13.oct.2011
//echo " device Mode: ".substr($_REQUEST["deviceMode"],0,3)."</br>" ;        
	foreach ($dataArray as $sdata) {

		if('read' == $type){
//--------------------------------
// Read cycle
//--------------------------------
                    
		} else if('note' == $type) {
//--------------------------------
// Notification cycle
//--------------------------------
                    $id = $sdata[0];
                    $oidArray[] = $id; 
			//echo "$sdata.<br>";
                    $result = sndtoMQ_00($sid, $did, $sendCount, $id, True, null, $sdata[1],$flag_UL_DL);
                    
		} else if('write' == $type) {
//--------------------------------
// Write cycle
//--------------------------------
			// for writing, the struct of $sdata is  {oid, content, npCmd}
			$id = $sdata[0];
			$oidArray[] = $id;
                        
//echo " -- write - id: ".$id." - sdata 1 :".$sdata[1]." - sdata 2 :".$sdata[2]."</br>";                        
                        $result = sndtoMQ_00($sid, $did, $sendCount, $id, False, $sdata[1], $sdata[2],$flag_UL_DL);
		}
                
		if ($result) {
			$sentMsgs[] = array('pid' => $sendCount, 'oid' => $id, 'did' => $did);
			$sendCount++;
		}
                
	}

	// reading from MQ
	$maxRTicks = 10;        //max reading ticks will do for the mq, one tick will sleep for one second
	$rTicks = 0;            //reading tick(s) have been done
	$oidCount = count($oidArray);
	$rMessages = 0;         //read message(s) from the mq
	$recMsgArray = array(); //create an array to hold the msgs getting for the MQ
	
        $nflag = 0; 
 //	while (($rTicks<>$maxRTicks) && ($rMessages<>$oidCount)) { 
        while ($nflag == 0) { 
//		$revMsg = readingFromMQ(); 
//================================
//$message_queue_key = 0x1234;     // key of the device-to-web queue
//$message_queue = msg_get_queue($message_queue_key);  
//$stat = msg_stat_queue( $message_queue ); 
//echo 'Messages in the queue: '.$stat['msg_qnum']."\n"; 
//msg_receive($message_queue, 0, $message_type, 256, $message, false, MSG_IPC_NOWAIT) ;           
//================================

                //================================
		// Read Cycle
                //================================
		if('read' == $type){
//			$revMsg = readingFromMQ_00(); 
		} 
                
                //================================
		// notification Cycle
                //================================
		if('note' == $type){
                    //----------------------------------------------------------
                    // Poll the MQ to see if Object ID is MgtCtl-Boot-Ack
                    //----------------------------------------------------------
                    $revMsg = readingFromMQ_01();
                    $OID = $revMsg['OID'];
		} 

                //================================
		// Write Cycle - note : Write cycle $revMsg does not contain 'Content'
                //================================
		if('write' == $type){
                    $revMsg = readingFromMQ_01(); 
		} 
                
		if (count($revMsg)>0) {
                    $did = $revMsg['Did'];
			
//			$id = $revMsg['OID'];
// Need to sap the bytes for Object ID
                    $id = byteswap2($revMsg['OID'],1) ;                        
                    $cont = $revMsg['Content'];
                    $pid = $revMsg['Pid'];
// Debug + Oct.09.2011
                    $npCmd = $revMsg['ucNpCmd'];
                    $RFBand = $revMsg['ucCmdID'];  

                    $rMessages++;
//================================
//| Bug fix - npCmd is RF Band   
//================================
                    //================================
                    // Read Cycle
                    //================================================================
                    if('read' == $type){
                        $temp = array('did' => $did, 'OID' => $id, 'Content' => $cont, 'npCmd' => $RFBand);
                    }    
                    //================================
                    // Write Cycle - just need to check the Acknowledge code - no content is replied
                    //================================
                    if('write' == $type){
                    
                        $AckID = $revMsg['ucAckID'] ;
                        if ( $AckID == 0 ) {
// ok                          
                            $cont = 'true';
                        } else {
                            $cont = 'false';
                        }
                        $temp = array('did' => $did, 'OID' => $id, 'Content' => $cont, 'npCmd' => $RFBand);
                    }    
                        
                $idx = $rMessages - 1;
                $recMsgArray[$idx] = $temp;
		} else {      	
                    $rTicks++;
                    //echo "Reading Fails.<br>";
                    sleep(1);
		}
//
            if ( $rTicks >= $maxRTicks) {
                $nflag = 1;              
            } 
                
            if ( $rMessages >= $oidCount) {
                $nflag = 1;              
            }
		
	}

        $output = $json->encode($recMsgArray);
	echo $output;

?>