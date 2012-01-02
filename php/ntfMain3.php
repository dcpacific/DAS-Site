<?php

//===============================================================================
// Caller:  index.html     (notification)
// 
// update log:
// ===========
//      - include NetwkIP regarding individual DRU MQ (0x1011)   + Nov.15.2011
//      - update to handle both 0x1006 and 0x1000 return Msg     + Nov.21.2011
//      - update to tacket 'Lost Update' problem                 + Nov.23.2011
//      - update to work around 0x1006 issue                     + Nov.24.2011
//===============================================================================

	//include the file for reading/writing to message queue
	include 'rwMQ.php';	
//=======================================================
//       function readingFromMQ_01 is based on readingFromMQ_00, without flipping the byte and decode the content
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
echo " inside readingFromMQ_01 - length : ".$length ;              
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
echo " -- within  readingFromMQ_01  oid: ".$oid ."</br>";
// + Oct.06.2011
                                // flip the byte back to proper order
                                $oid2 = byteswap2($oid,1) ;
              
// + Debug Sep.30.2011
//if (($oid2 == 0x1010) || ($oid2 == 0x1011)) {
    echo " -- within  readingFromMQ_01  oid2: ".$oid2 ." - len: ".strlen($msgArray)." - parse: ".$parse."</br>";
    var_dump($msgArray) ;
//}
	      //re-create value to readable format
    	}
    	
    		return $msgArray;
}                
                
//=======================================================
// function readingFromMQ_03
//=======================================================
function readingFromMQ_03(&$flag) {
            
// Debug
//echo " inside readingFromMQ_03 ... /n/r " ;              

    $message_queue_key = 0x1234;     // key of the device-to-web queue
    $message_queue = msg_get_queue($message_queue_key, 0666);
    $msgArray = array();
      
    if (msg_receive($message_queue, 1, $message_type, 1450, $message, false, MSG_IPC_NOWAIT)) {
///   if (msg_receive($message_queue, 1, $message_type, 256, $message, false, MSG_IPC_NOWAIT)) {
//    if (msg_receive($message_queue, 0, $message_type, 256, $message, false, MSG_IPC_NOWAIT)) {

        
// Debug
//echo " inside readingFromMQ_03 after MQ is read - MQ type:  $message_type  /r/n <br> " ;              
        
        
                //Get the lenght of the Object
                $objLength = hexdec(bin2hex(substr($message, 14, 2)));  
	    	$length = 18 + $objLength ;                      // Headers + obj + CRC + EOF

// Debug
//echo " inside readingFromMQ_03 - length : ".$length ;              
                $content = substr($message, 0, $length);                // get the msg in the real length
	    	      	
                //==============================================================================
		// During unpack, only care about fields Object ID and Object Length to retrieve content, althought the field  $ucNpCmd  is replaced by  $ucUpPrtID, its ignored 
		//==============================================================================          
		$parse = "CucApID/CucNpID/VSid/CDid/nPid/CNPucAPID/CucNpCmd/CucNoID/CucCmdID/CucAckID/vOLen/vOID/C".$objLength          ;
		$msgArray = unpack($parse, $content);

		// ************************************************************************************
		// re-creat $parse into different formats according the different OIDs
		// ************************************************************************************	
		$oid = $msgArray['OID'];
		$isString = False;
		$isbArray = False;
                                
// Debug
//echo " -- within  readingFromMQ_03  oid: ".$oid ."</br>";
                // flip the byte back to proper order
                $oid2 = byteswap2($oid,1) ;
                
                //--------------------------------------------------------------
                // Update flag if there is a match   
                //--------------------------------------------------------------
                if (($oid2 == 0x1006) || ($oid2 == 0x1000)) {
// debug
//echo " *** we have a MATCH ! *** - oid2: $oid2  /n/r " ;                   
                    $flag = 1;
                }
                
              
// Debug
//echo " -- within  readingFromMQ_03  oid2: ".$oid2 ." - len: ".strlen($msgArray)." - parse: ".$parse."</br>";
//echo " -- within  readingFromMQ_03 -  oid: ".$oid." - oid2: ".$oid2 ." - len: ".strlen($msgArray)."</br>";
//var_dump($msgArray) ;
	      //re-create value to readable format
    	}
    	
    		return $msgArray;
//------------------------------------------------------------------------------???
            
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
 //				$ucCmdID = 0x01;		//MAP head cmdID - 
 //                               $GetSetReq = 0x01;             // GET request 
 
			//-----------------
                        //  GET 
			//-----------------
 				$ucCmdID = 0x02;		//MAP head cmdID - 
                                $GetSetReq = 0x02;             // GET request 
 

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

//===============================================================================
//       function readingFromMQ_00 is based on readingFromMQ_00, flips the Object ID and decode the content
//       As readingFromMQ_00() maps the Object Type with predefined object length, in
//       this case 0x1010 and 0x1011 are unint-1, but need to decode the entire string
//============================================================================== 
	function readingFromMQ_02()
		{
			// prepare for reading from MQ
	    $message_queue_key = 0x1234;     // key of the device-to-web queue
	    $message_queue = msg_get_queue($message_queue_key, 0666);
//	    var_dump($message_queue);
	    
	    // the standard length of $message get from the queue is 256
            // need to get the real length of it and discard the tail
            $msgArray = array();

// + Nov.07.2011            
            $flgContent = true;
            
// + Oct.03.2011 change the desired messafge type from 0 (anything) to 1 (Webserver specific)      
//      if (msg_receive($message_queue, 1, $message_type, 256, $message, false, MSG_IPC_NOWAIT)) {
      if (msg_receive($message_queue, 1, $message_type, 1450, $message, false, MSG_IPC_NOWAIT)) {

                //Get the lenght of the Object
//              $objLength = hexdec(bin2hex(substr($message, 14, 1)));  
//	    	$length = 17 + $objLength + 2 + 1;                      // Headers + obj + CRC + EOF
//==============================================================================          
//  note : both old msg format and new have the field,OC-len, located at field no. 15          
//         i.e. string location 14, and old format only occupies 1 byte, whiile the new occupies 2 
//==============================================================================          
                $objLength = hexdec(bin2hex(substr($message, 14, 2)));  
	    	$length = 18 + $objLength ;                      // Headers + obj + CRC + EOF

//echo " inside readingFromMQ_02 - message_type : ".$message_type ;              
//echo " inside readingFromMQ_02 - message : ".$message ;              
//echo " inside readingFromMQ_02 - length : ".$length." \n\r " ;              
//echo " inside readingFromMQ_02 - message_type : ".$message_type ;              
                
                $content = substr($message, 0, $length);                // get the msg in the real length
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
		$isbArray = False;
                                
// + Oct.06.2011
                // flip the byte back to proper order
                $oid2 = byteswap2($oid,1) ;

// + Oct.21.2011                
//echo "oid2: ".$oid2." - obj len: ".$objLength."\r\n";
                //------------------------------
                // string - with variable length
                //------------------------------
		$isString = True;
		$contentParse = "C".$objLength;
        }

        
        //------------------------------
        //  Need to bypass if Object ID other than 4113 and 4112        
        //------------------------------
        if (($oid2 == 0x1002)  || ($oid2==0x1005) || ($oid2==0x1007) ) {
            $flgContent = false;        
        }
        if ($objLength == 0 ) {
            $flgContent = false;        
        }

        //------------------------------
        // Bypass the Message decoding if no content is involved
        //------------------------------
        if ($flgContent) {
//echo " -- flgContent : TRUE  \r\n" ;
        } else {
//echo " -- flgContent : FALSE \r\n" ;
            $isString = false;
        }
        
        //------------------------------
        // Proceed to retrieve the content either Object ID not 0x1002 nor 0x1005, or
        // corresponding length of Object Content greater than zero
        //------------------------------
        if ($flgContent) {
//------------------------------------------------------------------------------            
            $newParse = "CucApID/CucNpID/VSid/CDid/nPid/CNPucAPID/CucNpCmd/CucNoID/CucCmdID/CucAckID/vOLen/vOID/".$contentParse ;
            $msgArray = unpack($newParse, $content);

// + Debug Oct.06.2011
//if (($oid2 == 0x1002)  || ($oid2==0x1005))   {
//if ($oid2==0x1011)   {
//    echo " --  within readingFromMQ_02 ** <br> newParse: ".$newParse;
//    var_dump($msgArray) ;
//}        
            
            //re-create value to readable format
            if ($isString || $isbArray) {
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
                    $msgArray['Content'] = $str; 
                }            
// Debug
//echo " --  Content: ".$str."\r\n";
            } else {

// + Oct.21.2011                
//echo "oid2: ".$oid2." - b4 calling valueTransfer() TRUE - flgContent: $flgContent \r\n";
                
                $msgArray['Content'] = valueTransfer($msgArray['Content'], $msgArray['OID'], True);
            }
//------------------------------------------------------------------------------            
        } else {

// + Oct.21.2011                
//echo "oid2: ".$oid2." - b4 calling valueTransfer() FALSE - flgContent: $flgContent \r\n";
        
            $msgArray['Content'] = valueTransfer("0", $msgArray['OID'], True);
        }
        
    	return $msgArray;
}                

//==============================================================================
// function RFBndBTS handles H/W RF Band Type  of DAU - which pay attention to 
// Band Count (i.e. Dual Band or Quart Band)
// 
// Note:  
// $i         - temp counter - R/W,
// $j         - temp counter - R/W,
// $StgTest   - temp String  - R/W,
// $k         - key vale - Read Only,
// $RFBand    - constant - Read Only,
// $BTSIt     - constant - Read Only,
// $Content   - entire MQ- Read Only,
// $StgPtr    - MQ start location - Read Only,
// $v         - value - Read Only
//============================================================================== 
        function RFBndBTS(&$i,&$j,&$StgTest,$k,$RFBand,$BTSIt,$Content,$StgPtr,$v) {
            
            $tmpValue="";       
            $fldLen  = 0;
//echo " -- key is: $k - value is $v - start: $StgPtr - Len: $v - RFband: $RFBand - payr: $BTSIt - len:".strlen($BTSIt)." - i: $i - j: $j \r\n";

            $i++;
            //-------------------------------------
            // RF Band Type
            //-------------------------------------
//          if (substr($k,0,7)=="RfBdTyp") {
            if (substr($k,0,7)==$RFBand) {
                $StgTest = $RFBand.strval($j); 
            }
            
            //-------------------------------------
            // BTS Interface Type (DAU Cfg) or Payr (DRU Cfg)
            //-------------------------------------
            if ($BTSIt == "BTSiTyp" ) {
                $fldLen  = 7;
            }
            // Payr (DRU Cfg)
            if ($BTSIt == "Payr" ) {
                $fldLen  = 4;
            }
            if (substr($k,0,$fldLen)==$BTSIt) {
                $StgTest = $BTSIt.strval($j); 
//echo " *** within RFBndBTS StgTest: $StgTest  \n\r ";                
            }
            $$StgTest = hexdec(bin2hex(substr($Content,$StgPtr,$v))) ;
            $tmpValue = $$StgTest ;
//echo "  -- StgTest : $StgTest  - value: $($StgTest) - tmp: $tmpValue \r\n" ; 

            if (($i%2)==0) {
                $j++; 
            }
//                                
// reset the temp counter for Run Time Band                                
            if (i==8) {
                $i = 0;
                $j = 1;
            }
            
            return $tmpValue;
        }
        
//============================================================================== 
// function WrDAUCfgBoot decode the content from MQ for DAU and pack data prior to JSON string to Javascript
// Note:
// $Content  - Read Only, 
// $OLen     - Read Only, 
// $wboot    - R/W, 
// $BandCnt  - R/W, 
// $Serial   - R/W, 
// $ioDoor   - R/W, 
// $SWver    - R/W, 
// $RfBdTyp1 - R/W, 
// $BTSiTyp1 - R/W, 
// $RfBdTyp2 - R/W, 
// $BTSiTyp2 - R/W, 
// $RfBdTyp3 - R/W, 
// $BTSiTyp3 - R/W, 
// $RfBdTyp4 - R/W, 
// $BTSiTyp4 - R/W, 
// $DevName  - R/W
//============================================================================== 
        function WrDAUCfgBoot($Content, $Len, &$wboot, &$BandCnt, &$Serial, &$ioDoor, &$SWver, &$RfBdTyp1, &$BTSiTyp1, &$RfBdTyp2, &$BTSiTyp2, &$RfBdTyp3, &$BTSiTyp3, &$RfBdTyp4, &$BTSiTyp4, &$DevName) 
                {
            
//+--------------------------
//| $DAUCfg array collects the corresponding byte length of the MQ, such that 
//| length of MQ can be vertified prior to content decode
//+--------------------------
        $DAUCfg = array("WBoot"   => 1,
                        "BandCnt" => 1,
// H/W Device            
                        "serial"  => 20,  
                        "IOdoor"  => 1,
                        "SWver"   => 20,
// H/W Band 1 to 4            
                        "RfBdTyp1"=> 1,
                        "BTSiTyp1"=> 1,
                        "RfBdTyp2"=> 1,
                        "BTSiTyp2"=> 1,
                        "RfBdTyp3"=> 1,
                        "BTSiTyp3"=> 1,
                        "RfBdTyp4"=> 1,
                        "BTSiTyp4"=> 1,               // 51
// Run Time Device            
                        "DevName" => 32,
// Run Time Band 1 to 4           
                        "RFSub1"   => 15,
                        "DLAtt1"   => 2,
                        "ULAtt1"   => 2,
                        "DLIPLT1"  => 1,
                        "DLIPHT1"  => 1,
                        "DLO21"    => 1,
                        "ULO21"    => 1,
                        "BTSsName1"=> 32,
                        "ItfSTx1"  => 1,
                        "ItfSRx1"  => 1,
                        "ItfSRxD1" => 1,
//            
                        "RFSub2"   => 15,
                        "DLAtt2"   => 2,
                        "ULAtt2"   => 2,
                        "DLIPLT2"  => 1,
                        "DLIPHT2"  => 1,
                        "DLO22"    => 1,
                        "ULO22"    => 1,
                        "BTSsName2"=> 32,
                        "ItfSTx2"  => 1,
                        "ItfSRx2"  => 1,
                        "ItfSRxD2" => 1,
//            
                        "RFSub3"   => 15,
                        "DLAtt3"   => 2,
                        "ULAtt3"   => 2,
                        "DLIPLT3"  => 1,
                        "DLIPHT3"  => 1,
                        "DLO23"    => 1,
                        "ULO23"    => 1,
                        "BTSsName3"=> 32,
                        "ItfSTx3"  => 1,
                        "ItfSRx3"  => 1,
                        "ItfSRxD3" => 1,
//            
                        "RFSub4"   => 15,
                        "DLAtt4"   => 2,
                        "ULAtt4"   => 2,
                        "DLIPLT4"  => 1,
                        "DLIPHT4"  => 1,
                        "DLO24"    => 1,
                        "ULO24"    => 1,
                        "BTSsName4"=> 32,
                        "ItfSTx4"  => 1,
                        "ItfSRx4"  => 1,
                        "ItfSRxD4" => 1
            );
//---------------------------------------
// Init. the buffer var. 
//---------------------------------------
            $StgTest = "";
            $StgPtr  = 0 ;                        // current pointer
            $TstPtr  = 0;                         // test
            $nFldCnt = 0;
            $i = 0;                         // temp counters
            $j = 1;                         // temp counters
            $tmpValue="";       
//---------------------------------------
// Constant
//---------------------------------------
// RF Band Type             
            $RFBand  = "RfBdTyp";
// BTS Interface Type 
            $BTSIt   = "BTSiTyp";
//---------------------------------------
// buffer var. Content update depends on the MQ length
//---------------------------------------
            foreach ($DAUCfg as $k => $v) {
//                echo " -- key is $k and v : $v  <br/>\n" ;
                $TstPtr = $StgPtr + $v;
                
                //---------------------------------------
                // Verify the length of the content string prior to decode
                //---------------------------------------
                if ($TstPtr <= $Len) {
//------------------------------------------------------------------------------
                    switch ($k) {
                        case "WBoot" :
// warm boot - 0,1
                            $wboot  =hexdec(bin2hex(substr($Content,$StgPtr,$v)));
//echo " -- DAU Config - warm boot: ".$wboot."\r\n" ;  
                            break;
                        case "BandCnt":
// Band Count - 1,1                                    
                            $BandCnt=hexdec(bin2hex(substr($Content,$StgPtr,$v)));
//echo " -- DAU Config - band Cnt: ".$BandCnt."\r\n" ;  
                            break;
                        case "serial":
// Serial No. - 2,20
                            $Serial =substr($Content,$StgPtr,$v);
//echo " -- DAU Config - Serial #: ".$Serial."\r\n" ;                              
                            break;
                        case "IOdoor":
// Indoor or Outdoor - 22,1
                            $ioDoor = "o";
                            if (substr($Content,$StgPtr,$v)=="1") {
                                $ioDoor = "i";                                        
                            }
//echo " -- DAU Config -  start: $StgPtr - len : $v - Indoor ?: ".$ioDoor."\r\n" ;                             
                            break;
// S/W version - 23,20                            
                        case "SWver" :
                            $SWver = substr($Content,$StgPtr,$v) ;
//echo " -- DAU Config - S/W version:".$SWver."\r\n" ;                              
                            break;
//---------------------------------------
// H/W Band pay attention to Band Count           
//---------------------------------------
                        case "RfBdTyp1" :
                        case "BTSiTyp1" :
                        case "RfBdTyp2" :
                        case "BTSiTyp2" :
                        case "RfBdTyp3" :
                        case "BTSiTyp3" :
                        case "RfBdTyp4" :
                        case "BTSiTyp4" :
                            if ($BandCnt > 0 ) {
                                $tmpStg = RFBndBTS($i,$j,$StgTest,$k,$RFBand,$BTSIt,$Content,$StgPtr,$v);
                                $tmpVar = "$".$k;
//echo " -- DAU Config -  tmpVar: $tmpVar - content: $tmpStg \n\r   ";  
                                $$tmpVar = $tmpStg;
                                switch($k) {
                                    case "RfBdTyp1" :
                                        $RfBdTyp1 = $tmpStg;
                                        break;
                                    case "BTSiTyp1" :
                                        $BTSiTyp1 = $tmpStg;
                                        break;
                                    case "RfBdTyp2" :
                                        $RfBdTyp2 = $tmpStg;
                                        break;
                                    case "BTSiTyp2" :
                                        $BTSiTyp2 = $tmpStg; 
                                        break;
                                    case "RfBdTyp3" :
                                        $RfBdTyp3 = $tmpStg;
                                        break;
                                    case "BTSiTyp3" :
                                        $BTSiTyp3 = $tmpStg;
                                        break;
                                    case "RfBdTyp4" :
                                        $RfBdTyp4 = $tmpStg;
                                        break;
                                    case "BTSiTyp4" :
                                        $BTSiTyp4 = $tmpStg;
                                        break;
                                }
                            }
                            break;
// DAU Device Name
                        case "DevName":
// Run time device pay attention to Warm Boot
                            if ($wboot==1) {
                                $DevName=substr($Content,$StgPtr,$v) ;
//echo " -- DAU Config - DAU Device Name: $DevName - start: $StgPtr - len: $v   \r\n" ; 
                                if (empty($DevName)) {
                                    $DevName = "n/a";                                
                                }
                            }
                            break;
//---------------------------------------
// Retrieve the followings run time RF Sub Band, DL Attentuation, UL Attenuation, DL Input Power Low Threshold etc via regular DAU or DRU polling cycle
//---------------------------------------
                        case "RFSub1" :
                        case "DLAtt1" :
                        case "ULAtt1" :
                        case "DLIPLT1":
                        case "DLIPHT1":
                        case "DLO21"  :
                        case "ULO21"  :
                        case "BTSsName1":
                        case "ItfSTx1":
                        case "ItfSRx1":
                        case "ItfSRxD1":
//                            
                        case "RFSub2" :
                        case "DLAtt2" :
                        case "ULAtt2" :
                        case "DLIPLT2":
                        case "DLIPHT2":
                        case "DLO22"  :
                        case "ULO22"  :
                        case "BTSsName2":
                        case "ItfSTx2":
                        case "ItfSRx2":
                        case "ItfSRxD2":
//
                        case "RFSub3" :
                        case "DLAtt3" :
                        case "ULAtt3" :
                        case "DLIPLT3":
                        case "DLIPHT3":
                        case "DLO23"  :
                        case "ULO23"  :
                        case "BTSsName3":
                        case "ItfSTx3":
                        case "ItfSRx3":
                        case "ItfSRxD3":
//
                        case "RFSub4" :
                        case "DLAtt4" :
                        case "ULAtt4" :
                        case "DLIPLT4":
                        case "DLIPHT4":
                        case "DLO24"  :
                        case "ULO24"  :
                        case "BTSsName4":
                        case "ItfSTx4":
                        case "ItfSRx4":
                        case "ItfSRxD4":
// Run time device pay attention to Warm Boot
//                            if ($wboot==1) {
//                                if ($BandCnt > 0 ) {
//                                }
//                            }
//                            break;
//                        defualt:
// ignore                        
                    }             // switch 
//------------------------------------------------------------------------------
                    $StgPtr = $TstPtr ;
                    $nFldCnt++;
                    
                }                 // end if       
                
                
            }                      //foreach                          
            
            
        }


//============================================================================== 
// function WriteDRUCfgBt decode the content from MQ for DRU and pack data prior to JSON string to Javascript
//============================================================================== 
        function WriteDRUCfgBt($Content,$Len, &$wboot, &$BandCnt, &$Serial, &$SWver, &$NetwkIP, &$DAUOpt, &$ioDoor, &$RfBdTyp1, &$Payr1, &$RfBdTyp2, &$Payr2, &$RfBdTyp3, &$Payr3, &$RfBdTyp4, &$Payr4 ) 
                {
            
/*
    $char = substr($Content,0,1);
    $newchar = hexdec(bin2hex($char)) ;
    echo " -- within WriteDRUCfgBt - first byte is: $newchar \n\r ";
    $char = substr($Content,1,1);
    $newchar = hexdec(bin2hex($char)) ;
    echo " -- within WriteDRUCfgBt - 2nd   byte is: $newchar \n\r ";
*/   
//+--------------------------
//| $DRUCfg array collects the corresponding byte length of the MQ, such that 
//| length of MQ can be vertified prior to content decode
//+--------------------------
        $DRUCfg = array("WBoot"   => 1,
                        "BandCnt" => 1,
// H/W Device  2          
                        "serial"  => 20,  
                        "SWver"   => 20,
                        "NetwkIP" => 4,
                        "DAUOpt"  => 1,
                        "IOdoor"  => 1,
// H/W Band             
                        "RfBdTyp1"=> 1,
                        "Payr1"   => 1,
                        "RfBdTyp2"=> 1,
                        "Payr2"   => 1,
                        "RfBdTyp3"=> 1,
                        "Payr3"   => 1,
                        "RfBdTyp4"=> 1,
                        "Payr4"   => 1,               
// Run Time Device  
                        "ChainPos"=> 1,
                        "DevName" => 32,
                        "Delay"   => 2,
// Run Time Band 1 to 4           
                        "DLAtt1"   => 2,
                        "ULAtt1"   => 2,
                        "DLRFO21"  => 1,
                        "ULRFO21"  => 1,
                        "DPDO21"   => 1,
                        "DLVSWR1"  => 1,
                        "BTSSecNm1"=> 1,
//            
                        "DLAtt2"   => 2,
                        "ULAtt2"   => 2,
                        "DLRFO22"  => 1,
                        "ULRFO22"  => 1,
                        "DPDO22"   => 1,
                        "DLVSWR2"  => 1,
                        "BTSSecNm2"=> 1,
//            
                        "DLAtt3"   => 2,
                        "ULAtt3"   => 2,
                        "DLRFO23"  => 1,
                        "ULRFO23"  => 1,
                        "DPDO23"   => 1,
                        "DLVSWR3"  => 1,
                        "BTSSecNm3"=> 1,
//            
                        "DLAtt4"   => 2,
                        "ULAtt4"   => 2,
                        "DLRFO24"  => 1,
                        "ULRFO24"  => 1,
                        "DPDO24"   => 1,
                        "DLVSWR4"  => 1,
                        "BTSSecNm4"=> 1
            );
//---------------------------------------
// Init. the buffer var. 
//---------------------------------------
            $StgTest = "";
            $StgPtr  = 0 ;                        // current pointer
            $TstPtr  = 0;                         // test
            $nFldCnt = 0;
            $i = 0;                         // temp counters
            $j = 1;                         // temp counters

            $netwk01 = $netwk02 = $netwk03 = $netwk04 = 0;   // temp counter 
//---------------------------------------
// Constant
//---------------------------------------
// RF Band Type             
            $RFBand  = "RfBdTyp";
// Payr 
            $Payr    = "Payr";
//---------------------------------------
// buffer var. Content update depends on the MQ length
//---------------------------------------
            foreach ($DRUCfg as $k => $v) {

//echo " -- key is $k and v : $v - Content: $Content \n\r " ;
//echo " -- key is $k and v : $v \n\r " ;

                $TstPtr = $StgPtr + $v;
                //---------------------------------------
                // Verify the length of the content string prior to decode
                //---------------------------------------
                if ($TstPtr <= $Len) {
//------------------------------------------------------------------------------
                     switch ($k) {
// warm boot - 0,1
                        case "WBoot" :
                            $wboot  =hexdec(bin2hex(substr($Content,$StgPtr,$v)));
//echo " -- DRU Config - warm boot: ".$wboot." - start: $StgPtr - len: $v  \r\n" ;  
                            break;
// Band Count - 1,1             
                        case "BandCnt":
                            $BandCnt=hexdec(bin2hex(substr($Content,$StgPtr,$v)));
//echo " -- DRU Config - band Cnt: ".$BandCnt." - start: $StgPtr - len: $v \r\n" ;  
                            break;
//----------------------
// H/W Device  46 bytes  
//----------------------
                        case "serial":
// Serial No. - 2,20
                            $Serial = substr($Content,$StgPtr,$v);
//echo " -- DRU Config - Serial: $Serial - start: $StgPtr - len: $v  \r\n" ;  
                            break;
// S/W version - 22,20                            
                        case "SWver" :
                            $SWver = substr($Content,$StgPtr,$v) ;
//echo " -- DAU Config - S/W version:".$SWver." - start: $StgPtr - len: $v  \r\n" ; 
                            break;
//--------------------------------
// Network IP Address - 42,4 - convert each individual byte then concatenate the 
// 4 bytes into one
//--------------------------------
                        case "NetwkIP" :
//                          $NetwkIP = hexdec(bin2hex(substr($Content,$StgPtr,$v))) ;
                            $netwk01 = hexdec(bin2hex(substr($Content,$StgPtr,   01))) ;
                            $netwk02 = hexdec(bin2hex(substr($Content,$StgPtr+1, 01))) ;
                            $netwk03 = hexdec(bin2hex(substr($Content,$StgPtr+2, 01))) ;
                            $netwk04 = hexdec(bin2hex(substr($Content,$StgPtr+3, 01))) ;
                            $NetwkIP = strval($netwk01).".".strval($netwk02).".".strval($netwk03).".".strval($netwk04);                            
//echo " -- DRU Config - Network IP: $NetwkIP - start: $StgPtr - len: $v   \r\n" ;
                            break;
// DAU Optical Port - 46, 1
                        case "DAUOpt" :
                            $DAUOpt = hexdec(bin2hex(substr($Content,$StgPtr,$v))) ;
//echo " -- DRU Config - DAU Opt port: $DAUOpt - start: $StgPtr - len: $v   \r\n" ;  
                            break;
// Indoor or Outdoor - 47,1                        
                        case "IOdoor":
                            $ioDoor = "o";
                            if (substr($Content,$StgPtr,$v)=="1") {
                                $ioDoor = "i";                                        
                            }
//echo " -- DAU Config -  start: $StgPtr - len : $v - Indoor ?: ".$ioDoor."\r\n" ;                             
                            break;
//---------------------------------------
// H/W Band pay attention to Band Count           
//---------------------------------------
                        case "RfBdTyp1" :
                        case "Payr1"    :
                        case "RfBdTyp2" :
                        case "Payr2"    :
                        case "RfBdTyp3" :
                        case "Payr3"    :
                        case "RfBdTyp4" :
                        case "Payr4"    :
                            if ($BandCnt > 0 ) {
                                $tmpStg = RFBndBTS($i,$j,$StgTest,$k,$RFBand,$Payr,$Content,$StgPtr,$v);
                                $tmpVar = "$".$k;
                                switch($k) {
                                    case "RfBdTyp1" :
                                        $RfBdTyp1 = $tmpStg;
                                        break;
                                    case "Payr1" :
                                        $Payr1    = $tmpStg;
                                        break;
                                    case "RfBdTyp2" :
                                        $RfBdTyp2 = $tmpStg;
                                        break;
                                    case "Payr2" :
                                        $Payr2 = $tmpStg; 
                                        break;
                                    case "RfBdTyp3" :
                                        $RfBdTyp3 = $tmpStg;
                                        break;
                                    case "Payr3" :
                                        $Payr3 = $tmpStg;
                                        break;
                                    case "RfBdTyp4" :
                                        $RfBdTyp4 = $tmpStg;
                                        break;
                                    case "Payr4" :
                                        $Payr4 = $tmpStg;
                                        break;
                                }
                                
                            }
                            break;
//---------------------------------------
// Run time device pay attention to Warm Boot
//---------------------------------------
                        case "ChainPos" :
// Chain-Position 
                            if ($wboot==1) {
                                $ChainPos = hexdec(bin2hex(substr($Content,$StgPtr,$v))) ;
//echo " -- DRU Config - Chain-Position: $ChainPos - start: $StgPtr - len: $v   \r\n" ;  
                            }
                            break;
// DRU Device Name
                        case "DevName" :
                            if ($wboot==1) {
                                $DevName = strval(substr($Content,$StgPtr,$v));
//echo " -- DRU Config - DRU Device Name: $DevName - start: $StgPtr - len: $v   \r\n" ;  
                            }
                            break;
// Delay Offset 
                        case "Delay" :
                            if ($wboot==1) {
                                $Delay = hexdec(bin2hex(substr($Content,$StgPtr,$v))) ;
//echo " -- DRU Config - Delay Offset: $Delay - start: $StgPtr - len: $v   \r\n" ;  
                            }
                            break;
//---------------------------------------
//  Runtime Band 1 to 4 will be handled by the DRU ready cycle (polling)
//---------------------------------------
                        default: 
                        
                     }             // switch 
//------------------------------------------------------------------------------
                    $StgPtr = $TstPtr ;
                    $nFldCnt++;
                    
                }                  // end if       
                
            }                      //foreach                          
//---------------------------------------
         
        }

//==============================================================================
//  function MgCtlBAck handles both Msg Control  Boot Acknowledge - 0x1006 and 0x1000
//============================================================================== 
        function MgCtlBAck(&$nMsgCtrlBootAkgl, $type, $rTicks, $maxRTicks ) {

        // local var.    
        $nflag = 0; 
	$rTicks = 0;
        
        // flag tells if return Object ID either 0x1006 or 0x1000
        $nBootSws = 0;
        // Retry counter for polling 0x1006 or 0x1000
        $nBootCnt = 0;
        
        while ($nflag == 0) { 
//================================
//$message_queue_key = 0x1234;     // key of the device-to-web queue
//$message_queue = msg_get_queue($message_queue_key);  
//$stat = msg_stat_queue( $message_queue ); 
//echo 'Messages in the queue: '.$stat['msg_qnum']."\n"; 
//msg_receive($message_queue, 0, $message_type, 256, $message, false, MSG_IPC_NOWAIT) ;           
//================================
                //================================
		// notification Cycle
                //================================
		if('note' == $type){
                    //----------------------------------------------------------
                    // Poll the MQ to see if Object ID is MgtCtl-Boot-Ack
                    //----------------------------------------------------------
                    
//                    $revMsg = readingFromMQ_01();
                    //----------------------------------------------------------
                    // Retry polling the MQ to retrieve 0x1006 or 0x1000
                    //----------------------------------------------------------
//------------------------------------------------------------------------------???                    
                    while ($nBootSws == 0) {
                        $revMsg = readingFromMQ_03($nBootSws);    
                        // increase Retry counter if still no match
                        if ($nBootSws == 0) {
                            $nBootCnt++;
                        }
                        // if max. retry occurs, then quit
                        if ($nBootCnt > $maxRTicks) {
                            $nBootSws = 1 ;                            
                        }
                        
                    }                             // end while            
//------------------------------------------------------------------------------???                    
                    
		    if (count($revMsg)>0) {
			$OID = byteswap2($revMsg['OID'],1) ;
//--------------------------------                        
// return MQ either replies 0x1006 or 0x1000
//--------------------------------                        
			if (($OID == 0x1006) || ($OID == 0x1000)) {
                                $nflag = 1;
                                if ($OID == 0x1006) {
                                    $nMsgCtrlBootAkgl = 1;
                                } else {
                                    $nMsgCtrlBootAkgl = 2;
                                }
			}
                        
		   }  else {
			$rTicks++;
                    //echo "Reading Fails.<br>";
			sleep(1);
		   }
		   
		} 

             if ( $rTicks >= $maxRTicks) {
                $nflag = 1;              
            } 
		
	}

}


//==============================================================================
// function MgDAU_DRU_Cfg handles DAU and DRU Config, and exit MgtCtl-Boot-Eof
// 
//             $rxMQStg = base64_encode(serialize($recMsgArray));
//==============================================================================
        function MgDAU_DRU_Cfg( $type, $rTicks, $maxRTicks, &$rMsg  )
                {
            
                $rxMsgArray = array(); 
            
                $WrSws = false;
                $nflag2 = 0; 
		while ($nflag2 == 0) { 
			//================================
			// notification Cycle
			//================================
			if('note' == $type){
                            //----------------------------------------------------------
                            // Poll the MQ to see if Object ID is MgtCtl-Boot-Ack
                            //----------------------------------------------------------
                            $revMsg2 = readingFromMQ_02();
// Debug
//echo " -- after readingFromMQ_02(), counter :  ".count($revMsg2)."\n\r" ;                            
                            
                            if (count($revMsg2)>0) {

                                $OID = $revMsg2['OID'];  	
                                $OLen = $revMsg2['OLen'] - 18 ; 
                                $Content = $revMsg2['Content'] ;
                                $NewObjId = byteswap2($OID,1);
                                
                                
//echo " ?? OID = $OID  and rightID:".$NewObjId." \n\r ";  
// Bug fixed + 07.nov.2011                                
//------------------------------------------------------------------------------                              
                                //--------------------------------
                                //DAU  Config - one                
                                //--------------------------------
                                if ($NewObjId == 4112) {
//echo " test ** DAU  Config - one ** \n\r" ;         
                                        WrDAUCfgBoot($Content, $OLen, $wboot, $BandCnt, $Serial, $ioDoor, $SWver, $RfBdTyp1, $BTSiTyp1, $RfBdTyp2, $BTSiTyp2, $RfBdTyp3,$BTSiTyp3, $RfBdTyp4, $BTSiTyp4, $DevName);
/* 
// Debug
echo " -- DAU - OID  :    $OID \n\r " ;
echo " -- DAU - wboot:    $wboot \n\r " ;
echo " -- DAU - BandCnt:  $BandCnt \n\r " ;
echo " -- DAU - Serial:   $Serial \n\r " ;
echo " -- DAU - ioDoor:   $ioDoor \n\r " ;
echo " -- DAU - SWver:    $SWver \n\r " ;
echo " -- DAU - RfBdTyp1: $RfBdTyp1 \n\r " ;
echo " -- DAU - BTSiTyp1: $BTSiTyp1 \n\r " ;
echo " -- DAU - RfBdTyp2: $RfBdTyp2 \n\r " ;
echo " -- DAU - BTSiTyp2: $BTSiTyp2 \n\r " ;
echo " -- DAU - RfBdTyp3: $RfBdTyp3 \n\r " ;
echo " -- DAU - BTSiTyp3: $BTSiTyp3 \n\r " ;
echo " -- DAU - RfBdTyp4: $RfBdTyp4 \n\r " ;
echo " -- DAU - BTSiTyp4: $BTSiTyp4 \n\r " ;
echo " -- DAU - DevName:  $DevName \n\r " ;
*/
                                        $temp = array('OID'   => $NewObjId,
                                                      'WBoot' => $wboot,
                                                      'BandCnt'=>$BandCnt, 
                                                      'serial'=> $Serial,
                                                      'IOdoor'=> $ioDoor,
                                                      'SWver' => $SWver,
                                                      'RfBdTyp1'=> $RfBdTyp1,
                                                      'BTSiTyp1'=> $BTSiTyp1,
                                                      'RfBdTyp2'=> $RfBdTyp2,
                                                      'BTSiTyp2'=> $BTSiTyp2,
                                                      'RfBdTyp3'=> $RfBdTyp3,
                                                      'BTSiTyp3'=> $BTSiTyp3,
                                                      'RfBdTyp4'=> $RfBdTyp4,
                                                      'BTSiTyp4'=> $BTSiTyp4,
                                                      'DevName' => $DevName     );
                                        $WrSws = true;
/*                                        
                                    $rMsg++;
                                    $idx = $rMsg - 1;
                                    $recMsgArray[$idx] = $temp;
*/
                                    $rxMsgArray[$rMsg] = $temp;
                                    $rMsg++;
                                        
                                }

                                //--------------------------------
                                //DRU Config - multiple
                                //--------------------------------
                                if ($NewObjId == 4113) {
//echo " test ** DRU Config - multiple ** \n\r" ;  
                                        WriteDRUCfgBt($Content, $OLen, $wboot, $BandCnt, $Serial, $SWver, $NetwkIP, $DAUOpt, $ioDoor, $RfBdTyp1, $Payr1, $RfBdTyp2, $Payr2, $RfBdTyp3, $Payr3, $RfBdTyp4, $Payr4 ); 
/* 
// Debug
echo " -- DAU - OID  :    $OID \n\r " ;
echo " -- DAU - wboot:    $wboot \n\r " ;
echo " -- DAU - BandCnt:  $BandCnt \n\r " ;
echo " -- DAU - Serial:   $Serial \n\r " ;
echo " -- DAU - ioDoor:   $ioDoor \n\r " ;
echo " -- DAU - SWver:    $SWver \n\r " ;
echo " -- DAU - RfBdTyp1: $RfBdTyp1 \n\r " ;
echo " -- DAU - Payr1:    $Payr1 \n\r " ;
echo " -- DAU - RfBdTyp2: $RfBdTyp2 \n\r " ;
echo " -- DAU - Payr2:    $Payr2 \n\r " ;
echo " -- DAU - RfBdTyp3: $RfBdTyp3 \n\r " ;
echo " -- DAU - Payr3:    $Payr3 \n\r " ;
echo " -- DAU - RfBdTyp4: $RfBdTyp4 \n\r " ;
echo " -- DAU - Payr4:    $Payr4 \n\r " ;
echo " -- DAU - DevName:  $DevName \n\r " ;
*/
                                        $temp = array('OID'     => $NewObjId,
                                                      'WBoot'   => $wboot,
                                                      'BandCnt' => $BandCnt, 
                                                      'serial'  => $Serial,
                                                      'IOdoor'  => $ioDoor,
                                                      'SWver'   => $SWver,
                                                      'NetwkIP' => $NetwkIP, 
                                                      'RfBdTyp1'=> $RfBdTyp1,
                                                      'Payr1'   => $Payr1,
                                                      'RfBdTyp2'=> $RfBdTyp2,
                                                      'Payr2'   => $Payr2,
                                                      'RfBdTyp3'=> $RfBdTyp3,
                                                      'Payr3'   => $Payr3,
                                                      'RfBdTyp4'=> $RfBdTyp4,
                                                      'Payr4'   => $Payr4,
                                                      'DevName' => $DevName     );
                                    $WrSws = true;
/*
                                    $rMsg++;
                                    $idx = $rMsg - 1;
                                    $recMsgArray[$idx] = $temp;
*/
                                    $rxMsgArray[$rMsg] = $temp;
                                    $rMsg++;
                                    
                                }

                                //--------------------------------
                                //MgCtrlBoot -Eof x1007 --> 4103
                                //DAU-Boot   -Eof x1002 --> 4098	
                                //--------------------------------
/*                                
                                if ($NewObjId == 4103) {
                                    $nflag2 = 1;                         // exit loop
//echo " test ** MgCtrlBoot -Eof ** \n\r" ;                                    
                                }
*/
                               if (($NewObjId == 4103) || ($NewObjId == 4098)) {
                                    $nflag2 = 1;                         // exit loop
//Debug
/*                                    
if ($NewObjId == 4103) {
    echo " test ** MgCtrlBoot -Eof ** \n\r" ;                                    
}   
if ($NewObjId == 4098) {
    echo " test ** DAU-Boot   -Eof ** \n\r" ;                                    
}
*/
                                    
                                }
                                
                                //--------------------------------
                                // Debug
                                //--------------------------------
                                if ($WrSws) {
//echo " *** WrSws - true - rMsg: $rMsg - recMsgArray: $rxMsgArray - rMsg: $rMsg - ready ... \n\r ";                                    
                                    $WrSws = false ;
//var_dump($rxMsgArray) ;
                                }
                                
                                
//------------------------------------------------------------------------------                              
                            }  else {
                                $rTicks++;
                    //echo "Reading Fails.<br>";
                                sleep(1);
                            }                                          // end if
			}                                              // type = "note"
			if ( $rTicks >= $maxRTicks) {
				$nflag2 = 1;                           // exit loop
			} 
//
//echo " -- Within While loop, nflag2 : $nflag2  \n\r ";                        
                        
		}                                         //  end while
//==============================================================================???    
                return $rxMsgArray ;
                
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

// testing buffer        
        $cbuffer = array();
        $nLen    = 0;
//+----------------------------------------  
//| Work around for DRU-simulator as simulator only handles DRU IP Address 01 to 06
//+----------------------------------------  
        $did = ( substr($_REQUEST["deviceMode"],0,3) == "DRU" ) ? 0x05 : $_POST ["did"] ;

	foreach ($dataArray as $sdata) {
//--------------------------------
// Notification cycle
//--------------------------------
                $id = $sdata[0];
                $oidArray[] = $id; 
                $result = sndtoMQ_00($sid, $did, $sendCount, $id, True, null, $sdata[1],$flag_UL_DL);
                    
		if ($result) {
			$sentMsgs[] = array('pid' => $sendCount, 'oid' => $id, 'did' => $did);
			$sendCount++;
		}
                
	}

	// max. no. of retries
	$maxRTicks = 30;        //max reading ticks will do for the mq, one tick will sleep for one second
        
	$rTicks = 0;            //reading tick(s) have been done
	$oidCount = count($oidArray);
	$rMessages = 0;         //read message(s) from the mq
	$recMsgArray = array(); //create an array to hold the msgs getting for the MQ

//--------------------------------
// Msg Control  Boot Acknowledge - 0x1006 
//--------------------------------
	$nMsgCtrlBootAkgl = 0;
        
//echo " -- b4 calling MgCtlBAck ... \n\r";

	MgCtlBAck($nMsgCtrlBootAkgl, $type, $rTicks, $maxRTicks );

//echo " -- after MgCtlBAck() is called  ... \n\r ";

//--------------------------------
//  Keep reading DAU  Config and DRU Config till  MgtCtrl-Boot-Eof
//--------------------------------
        
/*        
	if ( $nMsgCtrlBootAkgl == 1 ) {
            $recMsgArray = MgDAU_DRU_Cfg($type, $rTicks, $maxRTicks, $rMessages );
	}                                                 // end if 
*/

	if (($nMsgCtrlBootAkgl==1) || ($nMsgCtrlBootAkgl==2))  {
            
            if ($nMsgCtrlBootAkgl==1) {
//echo " -- MQ return code 0x1006  \n\r ";
                //--------------------
                // return MQ is 0x1006
                //--------------------
                $recMsgArray = MgDAU_DRU_Cfg($type, $rTicks, $maxRTicks, $rMessages );
            } else {
//echo " -- MQ return code 0x1000  \n\r ";
                //--------------------
                // return MQ is 0x1000
                //--------------------
                $id = 0x1001;
                $oidArray[] = $id; 
                $result = sndtoMQ_00($sid, $did, $sendCount, $id, True, null, $sdata[1],$flag_UL_DL);
                    
		if ($result) {
			$sentMsgs[] = array('pid' => $sendCount, 'oid' => $id, 'did' => $did);
			$sendCount++;
                        
                        $recMsgArray = MgDAU_DRU_Cfg($type, $rTicks, $maxRTicks, $rMessages );

		}

                
            }                                             // end if
	

	}                                                 // end if 
//echo " *** outside while loop *** \n\r";    
//var_dump($recMsgArray);

        $output = $json->encode($recMsgArray);
	echo $output;
        
?>