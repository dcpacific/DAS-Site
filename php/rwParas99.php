<?php
				
	//include the file for reading/writing to message queue
	include 'rwMQ.php';	

//==============================================================================
// Note : Utility used to dump Message Que
//==============================================================================

        
//==============================================================================        
// array_to_json
//==============================================================================
/**
 * Converts an associative array of arbitrary depth and dimension into  JSON representation.
 *
 * NOTE: If you pass in a mixed associative and vector array, it will  prefix each numerical
 * key with "key_". For example array("foo", "bar" => "baz") will be  translated into
 * {'key_0': 'foo', 'bar': 'baz'} but array("foo", "bar") would be  translated into [ 'foo', 'bar' ].
 *
 * @param $array The array to convert.
 * @return mixed The resulting JSON string, or false if the argument was  not an array.
 */
function array_to_json( $array ){

    if( !is_array( $array ) ){
        return false;
    }

    $associative = count( array_diff( array_keys($array), array_keys( array_keys( $array )) ));
    if( $associative ){

        $construct = array();
        foreach( $array as $key => $value ){

            // We first copy each key/value  pair into a staging array,
            // formatting each key and value properly as we go.

            // Format the key:
            if( is_numeric($key) ){
                $key = "key_$key";
            }
            $key = "'".addslashes($key)."'";

            // Format the value:
            if( is_array( $value )){
                $value = array_to_json( $value );
            } else if( !is_numeric( $value ) || is_string( $value ) ){
                $value = "'".addslashes($value)."'";
            }

            // Add to staging array:
            $construct[] = "$key: $value";
        }

        // Then we collapse the staging  array into the JSON form:
        $result = "{ " . implode( ", ", $construct ) . " }";

    } else { // If the array is a vector  (not associative):

        $construct = array();
        foreach( $array as $value ){

            // Format the value:
            if( is_array( $value )){
                $value = array_to_json( $value );
            } else if( !is_numeric( $value ) || is_string( $value ) ){
                $value = "'".addslashes($value)."'";
            }

            // Add to staging array:
            $construct[] = $value;
        }

        // Then we collapse the staging  array into the JSON form:
        $result = "[ " . implode( ", ", $construct ) . " ]";
    }

    return $result;
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
// function dspHex($data)
//==============================================================================        
        function dspHex($data) {
    
            echo " ??? within dspHex - type ".gettype($data)." for data - ".$data."\n" ;            
            
        }
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

        function sndtoMQ_00($staionID, $deviceID, $packetID, $objectID, $ifQuery, $objectValue, $npCmd, $flag )
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

//NP layer cmd, will identify the band number;                        
//			$ucNpCmd = $npCmd;
//+-----------------------------------------------------------------------------
//| Bug fixed - NP-UpperProtocol-ID - constant x01
//+-----------------------------------------------------------------------------
			$ucNpCmd = 0x01 ;  
                        
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
                        //$OCSrc = 0x00 ;                       // MUST be device unit
                        $OCSrc = 0x00 ;                         // MUST be Subsystem
                        
			$OCAckID = 0xff;
                        $OCLen = 0x00 ;
                        
			//$OLen = 0x00;
			$OID = $objectID;
                        
// + Oct.02.2011
//echo " within sndtoMQ - old - Pid:".$Pid." - OCLen:".$OCLen." - OID:".$OID."<br>" ; 
echo " within sndtoMQ - old - Pid:".$Pid." - ucNpCmd - ".$ucNpCmd." - OID:".$OID." - OCSrc: ".OCSrc."<br>" ; 

                        //------------------------------------------------------
                        // format 'n' for pack, the unsigned short (always 16 bit, big endian byte order) will swap the 2 bytes
                        //------------------------------------------------------
			if ($ifQuery) {
				
                                // read
                                //-------------------------------------------------------------------
                                // Update for NEW Protocol, still come with one content once at a time 
                                // note: pack format changing from 'L' -unsigned long (always 32 bit, machine byte order) to 
                                //                                 'N' -unsigned long (always 32 bit, big endian byte order)
                                //                   changing from 'S' -unsigned short (always 16 bit, machine byte order) to
                                //                                 'n' -unsigned short (always 16 bit, big endian byte order)            
                                //-------------------------------------------------------------------
                              //$binarydata = pack('CCCLCSCCCCCSSC', $ucSof, $ucApID, $ucNpID, $Sid, $Did, $Pid, $ucNpCmd, $NPucAPID, $ucCmdID, $ucAckID, $OLen, $OID, $usCRC, $ucEof);
                                $binarydata = pack('CCNCnCCCCCnn', $ucApID, $ucNpID, $Sid, $Did, $Pid,     $ucNpCmd, $ucCmdID, $ucNoID,$OCSrc,$OCAckID, $OCLen,     $OID );

// + Debug Hex Dump 05.oct.2011 
//echo " *** Here Comes the Hex Dump *** " ;                                
//hex_dump($binarydata, "\n") ;      
//echo " *** Hex Dump end            *** " ;                                

                                
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

// + Debug 03.oct.2011
//			var_dump($message_queue);

                        $result = msg_send($message_queue, 1, $binarydata, false);
			
			return $result;
		}
//============================================================================== 

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
                
                                $content = substr($message, 0, $length);                // get the msg in the real length
	    	      	
// + Oct.06.2011                
//				$parse = "CucSof/ CucApID/ CucNpID/ LSid/ CDid/ SPid/ CucNpCmd/ CNPucAPID/ CucCmdID/ CucAckID/ COLen/ SOID/C".$objLength."/SusCRC/CucEof";
//                              $parse = "CucApID/CucNpID/LSid/CDid/SPid/CNPucAPID/CucNpCmd/CucNoID/CucCmdID/CucAckID/SOLen/SOID/C".$objLength          ;
                                $parse = "CucApID/CucNpID/VSid/CDid/nPid/CNPucAPID/CucNpCmd/CucNoID/CucCmdID/CucAckID/vOLen/vOID/C".$objLength          ;
                                
				$msgArray = unpack($parse, $content);

// + Debug Oct.02.2011 
echo " inside readingFromMQ_00 - parse : ".$parse ;              
//var_dump(unpack($parse, $content)) ;                                
                                
				// ************************************************************************************
				// re-creat $parse into different formats according the different OIDs
				// ************************************************************************************	
				$oid = $msgArray['OID'];
                                
// + Sep.30.2011                
print_r("oid: ".$oid."\r\n");
                                
				$isString = False;
				$isbArray = False;
                                
// + Oct.06.2011
                                // flip the byte back to proper order
                                $oid2 = byteswap2($oid,1) ;
                                
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
// + Oct.06.2011                                
//            $newParse = "CucSof/CucApID/CucNpID/LSid/CDid/SPid/CucNpCmd/CNPucAPID/CucCmdID/CucAckID/COLen/SOID/".$contentParse."/SusCRC/CucEof";				
//            $newParse = "CucApID/CucNpID/LSid/CDid/SPid/CNPucAPID/CucNpCmd/CucNoID/CucCmdID/CucAckID/SOLen/SOID/".$contentParse ;
              $newParse = "CucApID/CucNpID/VSid/CDid/nPid/CNPucAPID/CucNpCmd/CucNoID/CucCmdID/CucAckID/vOLen/vOID/".$contentParse ;
              
              
// + Debug Sep.30.2011
//echo "<br> newParse: ".$newParse;
//var_dump(unpack($newParse, $content)) ;

              
              $msgArray = unpack($newParse, $content);

// + Debug Oct.06.2011
echo "<br> newParse: ".$newParse;
var_dump($msgArray) ;


	      //re-create value to readable format
	      if ($isString || $isbArray) {    //string value or binary array

// + Debug oct.06.2011
echo " inside readingFromMQ_00 - isString or isbArray " ;              
                  
                  
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

// + Debug Oct.09.2011
echo " ***  Inside readingFromMQ_00 *** " ;
var_dump($msgArray) ;

                
                
    		return $msgArray;
		}                
//==============================================================================                
        
	// create a new instance of Services_JSON
	require_once('JSON.php');
	$json = new Services_JSON();
		
	$data = stripslashes($_POST ["data"]);
	$type = $_POST ["type"];
	$sid = $_POST ["sid"];
	$did = $_POST ["did"];
		
	$dataArray = $json->decode($data);
        
//==============================================================================         
//		echo "Sent type: $type"." - sid: $sid - did: $did "."<br>";
//		echo "Sent dataArray: $dataArray type: $type"." - sid: $sid - did: $did "."<br>";
//                echo "band is ".$_REQUEST["deviceMode"];                
//==============================================================================        
        
	//echo count($dataArray);
	$oidArray = array();		// create an oid array
	$sentMsgs = array();

//==============================================================================        
// writing to MQ
//==============================================================================        
	// + Oct.07.2011
	//$sendCount=0;
	
//	session_start();
//	if (!isset($_SESSION['count'])) {
//	  $_SESSION['count'] = 0;
//	} else {
//	  $_SESSION['count']++;
//	}
//	$sendCount=$_SESSION['count'];
//==============================================================================        
	
	$dauDeviceID = 0x0;
	$dauULOutPowerOID = 0x5a8;
	$dauDLInPowerOID = 0x5a7;
	$druULInPowerOID = 0x5a7;
	$druDLOutPowerOID = 0x503;

//+-----------------------------------------------------------------------------
//| Counter set for UL Attention and DL Attention, as both share Object Code
//| 0X441, need to notify caller sndtoMQ_00 to work around
//+-----------------------------------------------------------------------------
        $flag_UL_DL = 0;
        
//+-----------------------------------------------------------------------------
//| Send Msg to MQ
//+-----------------------------------------------------------------------------
/*
        foreach ($dataArray as $sdata) {
		if('read' == $type){
			$id = $sdata[0];
			$oidArray[] = $id; 
                        $result = sndtoMQ_00($sid, $did, $sendCount, $id, True, null, $sdata[1],$flag_UL_DL);
                        
		} else if('write' == $type) {

			$id = $sdata[0];
			$oidArray[] = $id;
                        $result = sndtoMQ_00($sid, $did, $sendCount, $id, False, $sdata[1], $sdata[2],$flag_UL_DL);
                }
                
		if ($result) {
			$sentMsgs[] = array('pid' => $sendCount, 'oid' => $id, 'did' => $did);
			$sendCount++;
		}
		
		if (($dauDeviceID!=$did) && ('read' == $type) && (($druULInPowerOID==$id) || ($druDLOutPowerOID==$id))) {			
			if ($druULInPowerOID==$id) {
				$dauOID = $dauULOutPowerOID;
			} else if ($druDLOutPowerOID==$id){
				$dauOID = $dauDLInPowerOID;
			}
			$oidArray[] = $dauOID;
			$result = sndtoMQ_00($sid, $dauDeviceID, $sendCount, $dauOID, True, null, $sdata[1], $flag_UL_DL);
			if ($result) {
				$sentMsgs[] = array('pid' => $sendCount, 'oid' => $dauOID, 'did' => $dauDeviceID);
				$sendCount++;
			}		
		}
	}
*/		    
//+-----------------------------------------------------------------------------
//| reading from MQ
//+-----------------------------------------------------------------------------
	$maxRTicks = 500;        //max reading ticks will do for the mq, one tick will sleep for one second
	$rTicks = 0;            //reading tick(s) have been done
	$oidCount = count($oidArray);
	$rMessages = 0;         //read message(s) from the mq

        $recMsgArray = array(); //create an array to hold the msgs getting for the MQ
        $revMsg      = array(); //create an array to hold the msgs getting for the MQ

// + Debug sep.30.2011 
//echo " -- oidCount: $oidCount"."<br>";
       
       while ( $rTicks < $maxRTicks)  { 
//==============================================================================            
$message_queue_key = 0x1234;     // key of the device-to-web queue
$message_queue = msg_get_queue($message_queue_key);  
$stat = msg_stat_queue( $message_queue ); 
echo 'Messages in the queue: '.$stat['msg_qnum']."\n"; 
msg_receive($message_queue, 0, $message_type, 256, $message, false, MSG_IPC_NOWAIT) ;           
//==============================================================================            
//                $revMsg = readingFromMQ_00(); 
/*
		if (count($revMsg)>0) {
			$did = $revMsg['Did'];
                        $id = byteswap2($revMsg['OID'],1) ;                        
                        $cont = $revMsg['Content'];
			$pid = $revMsg['Pid'];
                        $npCmd = $revMsg['ucNpCmd'];
                        $RFBand = $revMsg['ucCmdID'];                        
			$rMessages++;
			$temp = array('did' => $did, 'OID' => $id, 'Content' => $cont, 'npCmd' => $RFBand);
                        $idx = $rMessages - 1;
                        $recMsgArray[$idx] = $temp;
		} else {      	
*/
                        $rTicks++;
			//echo "Reading Fails.<br>";
//			sleep(1);
//		}
                
	}
            
            $output = $json->encode($recMsgArray);
// + Debug 09.oct.2011
//          print($output) ;

        echo $output;

?>