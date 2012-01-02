<script type="text/javascript">
    setTimeout("window.close();",10000);    
</script>    
<?php

    //include the file for reading/writing to message queue
    include 'rwMQ.php';	

    $var440 = 0 ;
    $var441 = 0 ;
    $var453 = 0 ;
    $var454 = 0 ;
//=============================================================
// user has already filled in the parameters 
//=============================================================

$var440 = $_POST["0x440"] ;
echo " -- within dauset.php 0x440 :".$var440."</br>" ;
    
$var441 = $_POST["0x441"] ;
//echo $_REQUEST["0x441"] ;
echo " -- within dauset.php 0x440 :".$var441."</br>" ;
    
$var453 = $_POST["0x453"] ;
echo " -- within dauset.php 0x453 :".$var453."</br>" ;

$var454 = $_POST["0x454"] ;
echo " -- within dauset.php 0x454 :".$var454."</br>" ;

$type = $_POST["type"] ;
echo " -- within dauset.php type :".$type."</br>" ;

$sid = $_POST["sid"] ;
echo " -- within dauset.php sid :".$sid."</br>" ;

$did = $_POST["did"] ;
echo " -- within dauset.php did :".$did."</br>" ;

$deviceMode = $_POST["deviceMode"] ;
echo " -- within dauset.php deviceMode :".$deviceMode."</br>" ;

$bandid = $_POST["bandid"] ;
echo " -- within dauset.php bandid :".$bandid."</br>" ;

$ul     = $_POST["0x4cd"] ;
echo " -- within dauset.php ul on/off :".$ul."</br></br></br></br></br>" ;

//=============================================================
// The following block is based on the 'write' cycle of rwParas.php 
//=============================================================

    // writing to MQ
    $sendCount=0;
//+----------------------------------------------------
//| Counter set for UL Attention and DL Attention, as both share Object Code
//| 0X441, need to notify caller sndtoMQ_00 to work around
//+-----------------------------------------------------------------------------
    $flag_UL_DL = 0;

// DL Attenuation
    if ( intval($var440) != 0 ) {
        $result = sndtoMQ_00($sid, $did, $sendCount,1089, False,"",1,$flag_UL_DL);
        if ($result) {
            echo " -- DL Attenuation is updated :".$var440." db</br>" ;
        }
    }
//  UL Attenuation
    if ( intval($var441) != 0 ) {
        $result = sndtoMQ_00($sid, $did, $sendCount,1089, False,"",2,$flag_UL_DL);
        if ($result) {
            echo " -- UL Attenuation is updated :".$var441." db</br>" ;
        }
    }
// DL Input Power Low Threshold
    if ( intval($var453) != 0 ) {
        $result = sndtoMQ_00($sid, $did, $sendCount,1107, False,"",1,$flag_UL_DL);
        if ($result) {
            echo " -- DL Input Power Low Threshold :".$var453." dbm</br>" ;
        }
    }
// DL Input Power Over Threshold   
    if ( intval($var454) != 0 ) {
        $result = sndtoMQ_00($sid, $did, $sendCount,1108, False,"",1,$flag_UL_DL);
        if ($result) {
            echo " -- DL Input Power Over Threshold :".$var454." dbm</br>" ;
        }
    }



?>
