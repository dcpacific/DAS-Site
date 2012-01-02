// deafult value
// note: the original value of these 3 fields are assigned at index.html, and menu.html
var deviceMode = 'DAU_quadband';
var stationID = 0x12345678;
var deviceID = 0x00;

// + 10.Oct.2011
var loopCnt  = 0;


// + 27.Nov.2011
var phpcnt  = 0
var flagObj = new Object();
flagObj.value  = "0";

//================================================
// function chkdau
//================================================
function chkdau() {
// validate 	
//var t = OpenWindow.document.getElementById('0x440').innerHTML; 	
//	OpenWindow.document.myform.submit();
var flag = true;
//setTimeout(alert(" -- within rwDAU.js -- chkdau() --"),3000);
var fobj = document.getElementById('0x441_2').innerHTML  ; 
setTimeout("alert(' -- within chkdau -- value of 0x441:'+fobj )", 5000);

return flag;

}	

//==============================================================================
// function popnew2
//==============================================================================
function popnew2(bandid) {

 var sCaption = "DAU Band " ;
     switch (bandid) {
       case 1 : sCaption = sCaption + "850"  ;
           break;
       case 2 : sCaption = sCaption + "1900"  ; 
           break;
       case 3 : sCaption = sCaption + "700"  ; 
           break;
       case 4 : sCaption = sCaption + "AWS"  ; 
           break;
    }
// Debug + Oct.20.2011    
alert(" -- within popnew2 -- b4 calling dauset3.php ...");

window.open("php/dauset3.php", sCaption, "height=380, width=500,toolbar=no,scrollbars=no,menubar=no");

}

//==============================================================================
// function respMQ
//      note :  in terms of Write, no return content for update, just Aknowledge
//==============================================================================
function respMQ(responseText) {

// Debug + Oct.07.2011
//    alert(" -- within respMQ - responseText :"+ responseText);
	
	var rData = JSON.parse(responseText);
	var showTest;
	var targetID;
	
// + Debug Oct.07.2011
//alert(" -- within respMQ -- rData.length : " + rData.length) ;
	
var StgRpt = "";	
    for (i = 0; i < rData.length; i++) {

// + Debug Oct.07.2011
//alert(" -- within respMQ - i: "+i+" rData OID: " + rData[i]['OID']) ;

        switch (rData[i]['OID']) {
// Alarm		
            case 0x3ab:
            case 0x4cc:
// UL on/off		
            case 0x4cd:
                break;
            case 0x5a7:
            case 0x5a8: 
		break;
            default:
	    
// field Object ID	    
             var  StgFld = rData[i]['OID'].toString(16) ;
// content  
             var  StgFlag= rData[i]['Content'].toString(16) ;

                targetID = '0x' + rData[i]['OID'].toString(16) + '_' + rData[i]['npCmd'].toString();

                showTest = document.getElementById(targetID);
                if (showTest) {

//			showTest.value = rData[i]['Content'];
                        StgRpt = StgRpt + " ; field " + StgFld + " updated :" + StgFlag + "     " ;

		} else {
// + Oct.18.2011
//                  alert(" -- respMQ -- Data error:" + targetID);
                    DAUErrRpt(" -- respMQ -- Data error:" + targetID);

                }
        }
    }

    // mark the updating time
    var dt = new Date();
    document.getElementById('msgDiv').innerHTML = " Write Update: " + StgRpt ;
}


//==============================================================================
// function popnew pops up new write to set corresponding BAND parameters
// note : dauset.php    + to be continued ???
//==============================================================================
function popnew(bandid) {
    

// Debug + Oct.20.2011
//alert(" -- within popnew(), sid:"+stationID);
//alert(" -- within popnew(), did:"+deviceID);
//alert(" -- within popnew(), deviceMode:"+deviceMode);

    var sCaption = "DAU Band " ;
    var sHome    = location.href;
// DL Attentuation
    var tmp440   = 0;
// UL Attentuation
    var tmp441   = 0; 
// DL Input Power Low Threshold
    var tmp453   = 0;
// DL Input Power Over Threshold   
    var tmp454   = 0;
// UL on/off   
    var stg1229  = "n/a";
 
    switch (bandid) {
       case 1 : sCaption = sCaption + "850"  ;
                tmp440   = document.getElementById('0x441_2').value; 
                tmp441   = document.getElementById('0x441_1').value;
                tmp453   = document.getElementById('0x453_1').value;
                tmp454   = document.getElementById('0x454_1').value;
// check if UL is on or off                
                if (document.getElementById('0x4cd_1_on').checked) {
                   stg1229  = "on";
                } 
                if (document.getElementById('0x4cd_1_off').checked ) {
                   stg1229  = "off";
                }

           break;
       case 2 : sCaption = sCaption + "1900"  ; 
                tmp440   = document.getElementById('0x441_4').value;                
                tmp441   = document.getElementById('0x441_3').value;        
                tmp453   = document.getElementById('0x453_2').value;
                tmp454   = document.getElementById('0x454_2').value;
// check if UL is on or off                
                if (document.getElementById('0x4cd_2_on').checked) {
                   stg1229  = "on";
                } 
                if (document.getElementById('0x4cd_2_off').checked ) {
                   stg1229  = "off";
                }

           break;
       case 3 : sCaption = sCaption + "700"  ; 
                tmp440   = document.getElementById('0x441_6').value;                
                tmp441   = document.getElementById('0x441_5').value;        
                tmp453   = document.getElementById('0x453_3').value;
                tmp454   = document.getElementById('0x454_3').value;
// check if UL is on or off                
                if (document.getElementById('0x4cd_3_on').checked) {
                   stg1229  = "on";
                } 
                if (document.getElementById('0x4cd_3_off').checked ) {
                   stg1229  = "off";
                }

break;
       case 4 : sCaption = sCaption + "AWS"  ; 
                tmp440   = document.getElementById('0x441_8').value;                
                tmp441   = document.getElementById('0x441_7').value;        
                tmp453   = document.getElementById('0x453_4').value;
                tmp454   = document.getElementById('0x454_4').value;
// check if UL is on or off                
                if (document.getElementById('0x4cd_4_on').checked) {
                   stg1229  = "on";
                } 
                if (document.getElementById('0x4cd_4_off').checked ) {
                   stg1229  = "off";
                }
           break;
    }

//alert(" -- within popnew, tmp440: "+tmp440);

// build the form
/*
    var sForm = document.createElement("form");
    sForm.method = "POST";
    sForm.action = "php/dauset.php";
    
    var s440  = document.createElement("input");
    s440.type = "text";
    s440.name = "0x440";
    s440.value= tmp440;
    sForm.appendChild(s440);

    var s441  = document.createElement("input");
    s441.type = "text";
    s441.name = "0x441";
    s441.value= tmp441;
    sForm.appendChild(s441);

    var s453  = document.createElement("input");
    s453.type = "text";
    s453.name = "0x453";
    s453.value= tmp453;
    sForm.appendChild(s453);

    var s454  = document.createElement("input");
    s454.type = "text";
    s454.name = "0x454";
    s454.value= tmp454;
    sForm.appendChild(s454);
    document.body.appendChild(sForm);
*/
// ???

    var OpenWindow=window.open("dauwin", sCaption, "height=380, width=500,toolbar=no,scrollbars=no,menubar=no");
    OpenWindow.focus();
    OpenWindow.document.write("<html><head><TITLE>" + sCaption + "</TITLE></head>");
    OpenWindow.document.write("<BODY BGCOLOR=Ivory>");
// display fields
//  OpenWindow.document.write("<form name='dauform' method='post' action='php/dauset.php' ");
    OpenWindow.document.write("<form name='dauform' method='post' action='php/dauset.php' onsubmit='return chkdau()' ");


    OpenWindow.document.write("<table style='width: 100%;'>") ;
// input text fields    
    OpenWindow.document.write("<tr ><td>DL Attenuation:</td>");
    OpenWindow.document.write("<td><input id='0x440' type='text' class='normalInupt' name='0x440' value ='"+tmp440+"' >dB</td></tr><BR><BR>");
    OpenWindow.document.write("<tr><td>UL Attenuation:</td>");
    OpenWindow.document.write("<td><input id='0x441' type='text' class='normalInupt' name='0x441' value ='"+tmp441+"' >dB</td></tr><BR><BR><BR>");
    OpenWindow.document.write("<tr><td>DL Input Power Low Threshold:</td>");
    OpenWindow.document.write("<td><input id='0x453' type='text' class='normalInupt' name='0x453' value ='"+tmp453+"' >dBm</td></tr><BR><BR>");
    OpenWindow.document.write("<tr><td>DL Input Power Over Threshold:</td>");
    OpenWindow.document.write("<td><input id='0x454' type='text' class='normalInupt' name='0x454' value ='"+tmp454+"' >dBm</td></tr><BR><BR>");
    OpenWindow.document.write("<tr><td>&nbsp;</td><td>&nbsp;</td></tr>");
// UL on/off radio buttons    
    if ( stg1229 == "on" ) {
    OpenWindow.document.write("<tr><td>UL On/Off:</td><td><input id='0x4cd_on' name='0x4cd' type='radio' checked ='true' >On</td><td><input id='0x4cd_off' name='0x4cd' type='radio' checked='false' >Off</td></tr>");
    } else {
    OpenWindow.document.write("<tr><td>UL On/Off:</td><td><input id='0x4cd_on' name='0x4cd' type='radio' checked ='false'>On</td><td><input id='0x4cd_off' name='0x4cd' type='radio' checked='true' >Off</td></tr>");
    }
    
// hidden fields 
    OpenWindow.document.write("<tr><td><input type='hidden' id='type'       name='type'       value='write'></td></tr>");
    OpenWindow.document.write("<tr><td><input type='hidden' id='sid'        name='sid'        value='"+stationID+"'></td></tr>");
    OpenWindow.document.write("<tr><td><input type='hidden' id='did'        name='did'        value='"+deviceID+"'></td></tr>");
    OpenWindow.document.write("<tr><td><input type='hidden' id='deviceMode' name='deviceMode' value='"+deviceMode+"'></td></tr>");
    OpenWindow.document.write("<tr><td><input type='hidden' id='bandid'     name='bandid'     value='"+bandid+"'></td></tr>");

    OpenWindow.document.write("<tr><td>&nbsp;</td><td>&nbsp;</td></tr>");
    OpenWindow.document.write("</table>");

    OpenWindow.document.write("<input type='submit' value='submit'>");
    OpenWindow.document.write("</form>\n");

    OpenWindow.document.write("</body>\n");
    OpenWindow.document.write("</html>");
// JS library
/*
    var s = w.document.createElement("script");
    s.type= "text/javascript";
    s.src = "js/dauset.js";
    OpenWindow.document.getElementsByTagName("head")[0].appendChild(s);    
*/

    OpenWindow.document.close();
    
//    self.name="main" ;
}


//==============================================================================
// function DAUErrRpt flags error and display warning below label 'DAU'
//==============================================================================
function DAUErrRpt(stg) {

    var id = document.getElementById('ErrDiv') ;

//   document.getElementById('ErrDiv').innerHTML = stg; 

    id.style.background = '' ;
    id.innerHTML = stg;
    id.style.background = '#dedede' ;
//    sleep(2000);
    id.style.background = '' ;

}

//==============================================================================
// function loadData - retrieve device ID and Mode from caller, and dim RF Band 3 and 4 block
//                             if DUAL Band
//==============================================================================
function loadData() {
    
// + Debug Sep.29.2011
     alert(" within loadData ... ") ;
     alert(location.href);

    var url = location.href;
    var theRequest = new Object();
	
    if (url.indexOf("?") != -1) {
        var str = url.substr(url.indexOf("?") + 1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }

    deviceID = theRequest['deviceID'];
    deviceMode = theRequest['deviceMode'];
    //document.getElementById('DeviceName').innerHTML = "DAU_" + deviceID;

    
// + Debug Sep.29.2011
//   alert(" within loadData ... ") ;
//   alert("deviceID   is - " + deviceID );
//   alert("deviceMode is - " + deviceMode );   
    
 /*   
    if ('DAU_dualband' == deviceMode) {
        // band 3&4 are quarter band only, need to hide for dual band
        document.getElementById("3").style.display = "none";
        document.getElementById("4").style.display = "none";
    }
*/

    
}

//==============================================================================
// function UptDAULbl
// note: routine RFBdType() defined at common.js
//==============================================================================
function UptDAULbl(devNm, bdCnt, R1, R2, R3, R4) 
{
/*
    alert(" -- within UptDAULbl - DAU Dev Name:"+devNm ) ;
    alert(" -- within UptDAULbl - DAU Band Count:"+bdCnt) ;
    alert(" -- within UptDAULbl - R1:"+R1) ;
    alert(" -- within UptDAULbl - R2:"+R2) ;
    alert(" -- within UptDAULbl - R3:"+R3) ;
    alert(" -- within UptDAULbl - R4:"+R4) ;
*/    
    // DAU Device Name
    var id = document.getElementById('DeviceName') ;
    id.innerHTML = devNm;
   
    var nBandCnt = parseInt(bdCnt);
    if (nBandCnt>0) {
        
        for(var i=1;i<=nBandCnt;i++) {
//
            switch(i) {
                case 1:
                    id = document.getElementById('DAURfBdTyp1') ;
                    if (id) {
                        id.innerHTML = "Band " + RFBdType(parseInt(R1)) + " :";
                    }
                    break;
                case 2:
                    id = document.getElementById('DAURfBdTyp2') ;
                    if (id) {
                        id.innerHTML = "Band " + RFBdType(parseInt(R2))+ " :";
                    }
                    break;
                case 3:
                    id = document.getElementById('DAURfBdTyp3') ;
                    if (id) {
                        id.innerHTML = "Band " + RFBdType(parseInt(R3))+ " :";
                    }
                    break;
                case 4:
                    id = document.getElementById('DAURfBdTyp4') ;
                    if (id) {
                        id.innerHTML = "Band " + RFBdType(parseInt(R4))+ " :";
                    }
                    break;
                default:    
            }
//
        }                                          // end for                     
        
    }                                              // end if
    
}

//==============================================================================
// function Archive4Cfg
//==============================================================================
function Archive4Cfg(bCnt, R1, B1, R2, B2, R3, B3, R4, B4, d1, dm ) {

//alert(" -- within Archive4Cfg, R1:"+R1+",R2:"+R2+",R3:"+R3+",R4:"+R4);
//alert(" -- within Archive4Cfg, B1:"+B1+",B2:"+B2+",B3:"+B3+",B4:"+B4);

    document.daucfg.BandCnt.value = bCnt;
    document.daucfg.RfBdTyp1.value= R1;
    document.daucfg.BTSiTyp1.value= B1;
    document.daucfg.RfBdTyp2.value= R2;
    document.daucfg.BTSiTyp2.value= B2;
    document.daucfg.RfBdTyp3.value= R3;
    document.daucfg.BTSiTyp3.value= B3;
    document.daucfg.RfBdTyp4.value= R4;
    document.daucfg.BTSiTyp4.value= B4;
// device ID
    document.daucfg.DAUdid.value  = d1;
// device Mode
    document.daucfg.deviceMode.value= dm;
    
}

//==============================================================================
// function readAllParas - main entry for loading data to fill the page
//==============================================================================
function readAllParas() {
	
//+-----------------------
//| Retrieve Devide ID and Mode 
//+-----------------------
//loadData();

if (loopCnt==0) {

    var url = location.href;
    var theRequest = new Object();
	
    if (url.indexOf("?") != -1) {
        var str = url.substr(url.indexOf("?") + 1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }
//+-----------------------
// update global var.
//+-----------------------
    deviceID = theRequest['deviceID'];
    deviceMode = theRequest['deviceMode'];
//+-----------------------
// init. local var
//+-----------------------
    var deviceName = theRequest['DevName'];
    var bandCnt    = theRequest['BandCnt'];
    var RfBdTyp1   = theRequest['RfBdTyp1'];        
    var BTSiTyp1   = theRequest['BTSiTyp1'];
    var RfBdTyp2   = theRequest['RfBdTyp2'];        
    var BTSiTyp2   = theRequest['BTSiTyp2'];
    var RfBdTyp3   = theRequest['RfBdTyp3'];        
    var BTSiTyp3   = theRequest['BTSiTyp3'];
    var RfBdTyp4   = theRequest['RfBdTyp4'];        
    var BTSiTyp4   = theRequest['BTSiTyp4'];
    
// DAU device Id
    var did        = theRequest['did'];
// DAU device mode
    var deviceMode = theRequest['deviceMode'];
    //+-----------------------
    //| update DAU screen labels and archive param for DAU Cfg
    //+-----------------------
    UptDAULbl(deviceName,bandCnt,RfBdTyp1,RfBdTyp2,RfBdTyp3,RfBdTyp4);
    Archive4Cfg(bandCnt,RfBdTyp1,BTSiTyp1,RfBdTyp2,BTSiTyp2,RfBdTyp3,BTSiTyp3,RfBdTyp4,BTSiTyp4,did,deviceMode);
    loopCnt++;
	
}

//+-----------------------
//| RF Band 850           ???
//+-----------------------
readData('php/rwParas.php', 1);

//+-----------------------
//| RF Band 1900
//+-----------------------
//readData('php/rwParas.php', 2);
    
if ('DAU_quadband' == deviceMode) {
//+-----------------------
//| RF Band 0700
//+-----------------------
    readData('php/rwParas.php', 3);
//+-----------------------
//| RF Band AWS
//+-----------------------
    readData('php/rwParas.php', 4);
}

//+-----------------------
//| System param
//+-----------------------
readData('php/rwParas.php', 0);
//+-----------------------
//| poll every 60 seconds
//+-----------------------
setTimeout("readAllParas()","60000");


//+-----------------------
//| clean up
//+-----------------------
//readData('php/rwParas99.php', 0);
//setTimeout("readAllParas()","5000");


}

//==============================================================================
// function rdAParas1B1 is based on readAllParas(), and ensure ONLY 1 php is running rather than concurrent    (debug)
//==============================================================================
function rdAParas1B1() {
	
//+-----------------------
//| Retrieve Devide ID and Mode 
//+-----------------------
//loadData();

if (loopCnt==0) {

    var url = location.href;
    var theRequest = new Object();
	
    if (url.indexOf("?") != -1) {
        var str = url.substr(url.indexOf("?") + 1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }
//+-----------------------
// update global var.
//+-----------------------
    deviceID = theRequest['deviceID'];
    deviceMode = theRequest['deviceMode'];
//+-----------------------
// init. local var
//+-----------------------
    var deviceName = theRequest['DevName'];
    var bandCnt    = theRequest['BandCnt'];
    var RfBdTyp1   = theRequest['RfBdTyp1'];        
    var BTSiTyp1   = theRequest['BTSiTyp1'];
    var RfBdTyp2   = theRequest['RfBdTyp2'];        
    var BTSiTyp2   = theRequest['BTSiTyp2'];
    var RfBdTyp3   = theRequest['RfBdTyp3'];        
    var BTSiTyp3   = theRequest['BTSiTyp3'];
    var RfBdTyp4   = theRequest['RfBdTyp4'];        
    var BTSiTyp4   = theRequest['BTSiTyp4'];
    
// DAU device Id
    var did        = theRequest['did'];
// DAU device mode
    var deviceMode = theRequest['deviceMode'];
    //+-----------------------
    //| update DAU screen labels and archive param for DAU Cfg
    //+-----------------------
    UptDAULbl(deviceName,bandCnt,RfBdTyp1,RfBdTyp2,RfBdTyp3,RfBdTyp4);
    Archive4Cfg(bandCnt,RfBdTyp1,BTSiTyp1,RfBdTyp2,BTSiTyp2,RfBdTyp3,BTSiTyp3,RfBdTyp4,BTSiTyp4,did,deviceMode);
    
    loopCnt++;
	
}

alert(" -- b4 calling PollDAU ! ");
//+-----------------------
//| call PHP for all band
//+-----------------------
PollDAU(phpcnt, flagObj);
//debug
alert(" -- within rdAParas1B1, - after PollDAU - flagObj: " + flagObj.value) ; 



//alert(" -- inside rdAParas1B1  , fObj is now reset to : " + fObj.value);
//+-----------------------
//| RF Band 850
//+-----------------------
//rdData1B1('php/rwParas.php', 1, fObj) ;
//alert(" -- within rdAParas1B1 - after band  1 is called -  fObj :" + fObj.value);

//+-----------------------
//| poll every 5 seconds
//+-----------------------
setTimeout("readAllParas()","5000");

//+-----------------------
//| clean up
//+-----------------------
//readData('php/rwParas99.php', 0);
//setTimeout("readAllParas()","5000");

}


//==============================================================================
// function rdAParas1B2
// 
// note :
//    - ensure only one PHP read MQ at any time  - hidden field "NowBNum"
//    - disable the DAU Config button while Band 1 to Band 4 plus system param, then enable after the cycle is completed 
//==============================================================================
function rdAParas1B2() {
	
//+-----------------------
//| Retrieve Devide ID and Mode 
//+-----------------------
//loadData();

if (loopCnt==0) {

    var url = location.href;
    var theRequest = new Object();
	
    if (url.indexOf("?") != -1) {
        var str = url.substr(url.indexOf("?") + 1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }
//+-----------------------
// update global var.
//+-----------------------
    deviceID = theRequest['deviceID'];
    deviceMode = theRequest['deviceMode'];
//+-----------------------
// init. local var
//+-----------------------
    var deviceName = theRequest['DevName'];
    var bandCnt    = theRequest['BandCnt'];
    var RfBdTyp1   = theRequest['RfBdTyp1'];        
    var BTSiTyp1   = theRequest['BTSiTyp1'];
    var RfBdTyp2   = theRequest['RfBdTyp2'];        
    var BTSiTyp2   = theRequest['BTSiTyp2'];
    var RfBdTyp3   = theRequest['RfBdTyp3'];        
    var BTSiTyp3   = theRequest['BTSiTyp3'];
    var RfBdTyp4   = theRequest['RfBdTyp4'];        
    var BTSiTyp4   = theRequest['BTSiTyp4'];
    
// DAU device Id
    var did        = theRequest['did'];
// DAU device mode
    var deviceMode = theRequest['deviceMode'];
    //+-----------------------
    //| update DAU screen labels and archive param for DAU Cfg
    //+-----------------------
    UptDAULbl(deviceName,bandCnt,RfBdTyp1,RfBdTyp2,RfBdTyp3,RfBdTyp4);
    Archive4Cfg(bandCnt,RfBdTyp1,BTSiTyp1,RfBdTyp2,BTSiTyp2,RfBdTyp3,BTSiTyp3,RfBdTyp4,BTSiTyp4,did,deviceMode);
    loopCnt++;
	
}

var bflag;  
var id = document.getElementById('NowBNum') ;
if (id) {
    bflag = id.value ;
}
//alert(" -- within rdAParas1B2, bflag :"+bflag) ;

//+-----------------------
//| RF Band 850
//+-----------------------
//readData('php/rwParas.php', 1);
if(bflag == "0"){
    rdData1B2('php/rwParas.php', 1) ;
}

//+-----------------------
//| RF Band 1900
//+-----------------------
//readData('php/rwParas.php', 2);
if(bflag == "0"){
    rdData1B2('php/rwParas.php', 2) ;
}


if ('DAU_quadband' == deviceMode) {
//+-----------------------
//| RF Band 0700
//+-----------------------
//    readData('php/rwParas.php', 3);
    if(bflag == "0"){
        rdData1B2('php/rwParas.php', 3) ;
    }    
    
//+-----------------------
//| RF Band AWS
//+-----------------------
//  readData('php/rwParas.php', 4);
    if(bflag == "0"){
        rdData1B2('php/rwParas.php', 4) ;
    }    
    
}
//+-----------------------
//| System param
//+-----------------------
//readData('php/rwParas.php', 0);
if(bflag == "0"){
    rdData1B2('php/rwParas.php', 0) ;
}


//+-----------------------
//| poll every 60 seconds
//+-----------------------
setTimeout("readAllParas()","60000");


//+-----------------------
//| clean up
//+-----------------------
//readData('php/rwParas99.php', 0);
//setTimeout("readAllParas()","5000");
}






//==============================================================================
// function PollDAU 
//==============================================================================
function PollDAU(lCnt, fObj) {
    
alert(" -- inside PollDAU  ... ");
alert(" -- inside PollDAU  , fObj: " + fObj.value);

fObj.value = 1;

alert(" -- inside PollDAU  , fObj is now reset to : " + fObj.value);
//+-----------------------
//| RF Band 850
//+-----------------------
rdData1B1('php/rwParas.php', 1, fObj) ;

alert(" -- within PollDAU - after band  1 is called -  fObj :" + fObj.value);
    
}

//==============================================================================
// function fillParas
//      note : fillAlarmOnPage() defined at alarm.js
//==============================================================================
function fillParas(responseText) {

// Debug + Oct.07.2011
//    alert(" -- within fillParas - responseText :"+ responseText);
	
	var rData = JSON.parse(responseText);
	var showTest;
	var targetID;
	
// + Debug Oct.07.2011
//alert(" rData.length : " + rData.length) ;
	
    for (i = 0; i < rData.length; i++) {

// + Debug Oct.07.2011
//alert(" -- within fillParas - i: "+i+" rData OID: " + rData[i]['OID']) ;

        switch (rData[i]['OID']) {
// Alarm		
            case 0x3ab:
                fillAlarmOnPage(rData[i], deviceMode);
                break;
            case 0x4cc:
// UL on/off		
            case 0x4cd:
                //alert('shutdown status:' + rData[i]['Content']);
                if (1 == rData[i]['Content']) {
                    targetID = '0x' + rData[i]['OID'].toString(16) + '_' + rData[i]['npCmd'].toString() + '_on';
                } else {
                    targetID = '0x' + rData[i]['OID'].toString(16) + '_' + rData[i]['npCmd'].toString() + '_off';
                }
                showTest = document.getElementById(targetID);
                if (showTest) {
                    showTest.checked = "checked";
                }
                break;
            case 0x5a7:
            case 0x5a8: 
		targetID = '0x' + rData[i]['OID'].toString(16) + '_' + rData[i]['npCmd'].toString();
                showTest = document.getElementById(targetID);
                if (showTest) {
                    showTest.value = roundNumber(rData[i]['Content'], 1);
                } else {
// + Oct.18.2011
//                  alert(" -- fillParas -- Data error:" + targetID);
                    DAUErrRpt(" -- fillParas -- Data error:" + targetID);
                }
		break;
            default:
                targetID = '0x' + rData[i]['OID'].toString(16) + '_' + rData[i]['npCmd'].toString();

// + Debug Oct.18.2011                
//alert(" default - targetID :"+targetID); 

                showTest = document.getElementById(targetID);

// + Debug Oct.18.2011                
//alert(" default - showTest :"+showTest+" content :"+ rData[i]['Content']); 
//showTest.value = rData[i]['Content'];


                if (showTest) {
                    showTest.value = rData[i]['Content'];
                } else {
// + Oct.18.2011
//                  alert(" -- fillParas -- Data error:" + targetID);
                    DAUErrRpt(" -- fillParas -- Data error:" + targetID);

                }
        }
    }

    // mark the updating time
    var dt = new Date();
    document.getElementById('msgDiv').innerHTML = "Last Update: " + dt.toString();
}



//==============================================================================
// function rdData1B1 
//==============================================================================
function rdData1B1(dataSource, band, NewObj) {
// clean up    
    document.getElementById('msgDiv').innerHTML = "Loading data from device...";
//  document.getElementById('ErrDiv').innerHTML = "" ;

// + Debug 29.sep.2011
        alert(" within rdData1B1()- band :" + band + " - fObj: " + NewObj.value ) ; 

//+-----------------------------------------------------------------------------
//| Check Browser and Open Ajax channel 
//+-----------------------------------------------------------------------------
    var XMLHttpRequestObject = false;
    if (window.XMLHttpRequest) {
        XMLHttpRequestObject = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        XMLHttpRequestObject = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (XMLHttpRequestObject) {

//           XMLHttpRequestObject.open("POST", dataSource, false);  //send the request synchronously 
	//+-------------------------------------------------------------------------------
        //|  if use async=false, do NOT write an onreadystatechange function - just put the code after the send() statement:
	//+-----------------------------------------------------------------------------
	    XMLHttpRequestObject.open("POST", dataSource, true);  
        
// + Debug 29.sep.2011
//        alert(" within readData()- Ajax open channel ..." ) ; 
        
	//+-----------------------------------------------------------------------------
	//| Return Message Block 
	//+-----------------------------------------------------------------------------
        XMLHttpRequestObject.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        XMLHttpRequestObject.onreadystatechange = function() {
            if (XMLHttpRequestObject.readyState == 4 &&
              XMLHttpRequestObject.status == 200) {

// + Debug 29.sep.2011
alert(" within rdData1B1()- Ajax open channel - band :" + band + " - responseText : " + XMLHttpRequestObject.responseText);
                NewObj.value = 1 ;

alert(" within rdData1B1()- band :" + band + " - after return Msg -  NewObj: " + NewObj.value ) ; 

                
                fillParas(XMLHttpRequestObject.responseText);
                
            }
        }

	//+-----------------------------------------------------------------------------
        //| create the oid array with npCmd setting
	//+-----------------------------------------------------------------------------
        if (0 == band) {
		
// + Oct.18.2011 
//  Serial#, S/W version, IP Address, DC Voltage, Alarms Pending 
//            var oidArray = new Array(0x3ab, 0x5, 0xa);
            var oidArray = new Array(0x3ab, 0x5, 0xa, 0x701, 0x704);
 
	} else {
            var oidArray = new Array(0x441, 0x441, 0x453, 0x454, 0x5a7, 0x3ab, 0x4cd, 0x5a8);
//            var oidArray = new Array(0x441, 0x441, 0x453, 0x454, 0x5a7,           0x4cd, 0x5a8);
        }
        
        var sArray = new Array;
        var index = 0; //index for sArray
        for (i = 0; i < oidArray.length; i++) {
            if (0x441 != oidArray[i]) {
                var e = new Array(oidArray[i], band);
                sArray[index] = e;
                index++;
            }
        }
        //manually add "0x441"
        if (0 != band) {
            sArray[index] = new Array(0x441, (band * 2) - 1);
            sArray[index + 1] = new Array(0x441, band * 2);
        }

       var data = JSON.stringify(sArray);
// 
// + Debug Oct.18.2011
//alert(' within readData()- after JSON.stringify(sArray) ...  data=' + data + '&type=read' + '&sid=' + stationID + '&did=' + deviceID + '&deviceMode='+deviceMode);
//alert('test again:data=' + data + '&type=read' + '&sid=' + sid + '&did=' + did);

// + Oct.14.2011	
//	XMLHttpRequestObject.send('data=' + data + '&type=read' + '&sid=' + stationID + '&did=' + deviceID);
        XMLHttpRequestObject.send('data=' + data + '&type=read' + '&sid=' + stationID + '&did=' + deviceID+ '&deviceMode='+deviceMode);
	
	
	//+-----------------------------------------------------------------------------
	//| clean up the user interface
	//+-----------------------------------------------------------------------------
       for (i = 0; i < sArray.length; i++) {
           switch (sArray[i][0]) {
 // alarm block               
              case 0x3ab:
                   targetID = '0x' + sArray[i][0].toString(16) + '_' + sArray[i][1].toString(16);
                   showTest = document.getElementById(targetID);
                   if (showTest) {
                       showTest.innerHTML = 'Updating...';
                   } else {
// + Oct.18.2011
//                     alert(" -- readData -- clean Error:" + targetID);
                       DAUErrRpt(" -- rdData1B1 -- clean Error:" + targetID);
                   }
                   break;
               case 0x4cc:
// UL on/off               
               case 0x4cd:
                   targetID = '0x' + sArray[i][0].toString(16) + '_' + sArray[i][1].toString(16) + '_on';
                   showTest = document.getElementById(targetID);
                   if (showTest) {
                       showTest.checked = "";
                   } else {
// + Oct.18.2011                       
//                     alert(" -- readData -- clean Error:" + targetID);
                       DAUErrRpt(" -- rdData1B1 -- clean Error:" + targetID);
                   }
                   targetID = '0x' + sArray[i][0].toString(16) + '_' + sArray[i][1].toString(16) + '_off';
                   showTest = document.getElementById(targetID);
                   if (showTest) {
                       showTest.checked = "";
                   } else {
// + Oct.18.2011                       
//                     alert(" -- readData -- clean Error:" + targetID);
                       DAUErrRpt(" -- rdData1B1 -- clean Error:" + targetID);
                   }
                   break;
               default:
                   targetID = '0x' + sArray[i][0].toString(16) + '_' + sArray[i][1].toString(16);
                   showTest = document.getElementById(targetID);
                   if (showTest) {
                       showTest.value = '';
                   } else {
// + Oct.18.2011                       
//                     alert(" -- readData -- clean Error:" + targetID);
                       DAUErrRpt(" -- rdData1B1 -- clean Error:" + targetID);
                   }
           }
       }

// + Debug 29.sep.2011
//alert("sent");
       
    }
}


//==============================================================================
// function readData
//==============================================================================
function readData(dataSource, band) {
// clean up    
    document.getElementById('msgDiv').innerHTML = "Loading data from device...";
//  document.getElementById('ErrDiv').innerHTML = "" ;

// + Debug 29.sep.2011
//        alert(" within readData()- band :" + band ) ; 

//+-----------------------------------------------------------------------------
//| Check Browser and Open Ajax channel 
//+-----------------------------------------------------------------------------
    var XMLHttpRequestObject = false;
    if (window.XMLHttpRequest) {
        XMLHttpRequestObject = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        XMLHttpRequestObject = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (XMLHttpRequestObject) {

//           XMLHttpRequestObject.open("POST", dataSource, false);  //send the request synchronously 
	//+-------------------------------------------------------------------------------
        //|  if use async=false, do NOT write an onreadystatechange function - just put the code after the send() statement:
	//+-----------------------------------------------------------------------------
	    XMLHttpRequestObject.open("POST", dataSource, true);  
        
// + Debug 29.sep.2011
//        alert(" within readData()- Ajax open channel ..." ) ; 
        
	//+-----------------------------------------------------------------------------
	//| Return Message Block 
	//+-----------------------------------------------------------------------------
        XMLHttpRequestObject.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        XMLHttpRequestObject.onreadystatechange = function() {
            if (XMLHttpRequestObject.readyState == 4 &&
              XMLHttpRequestObject.status == 200) {

// + Debug 29.sep.2011
//        alert(" within readData()- Ajax open channel - band :" + band + " - responseText : " + XMLHttpRequestObject.responseText);

                fillParas(XMLHttpRequestObject.responseText);
            }
        }

	//+-----------------------------------------------------------------------------
        //| create the oid array with npCmd setting
	//+-----------------------------------------------------------------------------
        if (0 == band) {
		
// + Oct.18.2011 
//  Serial#, S/W version, IP Address, DC Voltage, Alarms Pending 
//            var oidArray = new Array(0x3ab, 0x5, 0xa);
            var oidArray = new Array(0x3ab, 0x5, 0xa, 0x701, 0x704);
 
	} else {
            var oidArray = new Array(0x441, 0x441, 0x453, 0x454, 0x5a7, 0x3ab, 0x4cd, 0x5a8);
//            var oidArray = new Array(0x441, 0x441, 0x453, 0x454, 0x5a7,           0x4cd, 0x5a8);
        }
        
        var sArray = new Array;
        var index = 0; //index for sArray
        for (i = 0; i < oidArray.length; i++) {
            if (0x441 != oidArray[i]) {
                var e = new Array(oidArray[i], band);
                sArray[index] = e;
                index++;
            }
        }
        //manually add "0x441"
        if (0 != band) {
            sArray[index] = new Array(0x441, (band * 2) - 1);
            sArray[index + 1] = new Array(0x441, band * 2);
        }

       var data = JSON.stringify(sArray);
// 
// + Debug Oct.18.2011
//alert(' within readData()- after JSON.stringify(sArray) ...  data=' + data + '&type=read' + '&sid=' + stationID + '&did=' + deviceID + '&deviceMode='+deviceMode);
//alert('test again:data=' + data + '&type=read' + '&sid=' + sid + '&did=' + did);

// debug + Nov.28.2011
//alert(" -- dump array of data send --\n");
//var msg = "";
//for(i=0;i<sArray.length;i++) { msg += sArray[i] + "\n"; }
//alert(msg);

// + Oct.14.2011	
//	XMLHttpRequestObject.send('data=' + data + '&type=read' + '&sid=' + stationID + '&did=' + deviceID);
        XMLHttpRequestObject.send('data=' + data + '&type=read' + '&sid=' + stationID + '&did=' + deviceID+ '&deviceMode='+deviceMode);
	
	
	//+-----------------------------------------------------------------------------
	//| clean up the user interface
	//+-----------------------------------------------------------------------------
       for (i = 0; i < sArray.length; i++) {
           switch (sArray[i][0]) {
 // alarm block               
              case 0x3ab:
                   targetID = '0x' + sArray[i][0].toString(16) + '_' + sArray[i][1].toString(16);
                   showTest = document.getElementById(targetID);
                   if (showTest) {
                       showTest.innerHTML = 'Updating...';
                   } else {
// + Oct.18.2011
//                     alert(" -- readData -- clean Error:" + targetID);
                       DAUErrRpt(" -- readData -- clean Error:" + targetID);
                   }
                   break;
               case 0x4cc:
// UL on/off               
               case 0x4cd:
                   targetID = '0x' + sArray[i][0].toString(16) + '_' + sArray[i][1].toString(16) + '_on';
                   showTest = document.getElementById(targetID);
                   if (showTest) {
                       showTest.checked = "";
                   } else {
// + Oct.18.2011                       
//                     alert(" -- readData -- clean Error:" + targetID);
                       DAUErrRpt(" -- readData -- clean Error:" + targetID);
                   }
                   targetID = '0x' + sArray[i][0].toString(16) + '_' + sArray[i][1].toString(16) + '_off';
                   showTest = document.getElementById(targetID);
                   if (showTest) {
                       showTest.checked = "";
                   } else {
// + Oct.18.2011                       
//                     alert(" -- readData -- clean Error:" + targetID);
                       DAUErrRpt(" -- readData -- clean Error:" + targetID);
                   }
                   break;
               default:
                   targetID = '0x' + sArray[i][0].toString(16) + '_' + sArray[i][1].toString(16);
                   showTest = document.getElementById(targetID);
                   if (showTest) {
                       showTest.value = '';
                   } else {
// + Oct.18.2011                       
//                     alert(" -- readData -- clean Error:" + targetID);
                       DAUErrRpt(" -- readData -- clean Error:" + targetID);
                   }
           }
       }

// + Debug 29.sep.2011
//alert("sent");
       
    }
}



//==============================================================================
// function rdData1B2
//==============================================================================
function rdData1B2(dataSource, band) {
    
    var id ;
    
    document.getElementById('msgDiv').innerHTML = "Loading data from device...";
//  document.getElementById('ErrDiv').innerHTML = "" ;

// + Debug 29.sep.2011
//        alert(" within rdData1B2 - band :" + band ) ; 
//+-----------------------------------------------------------------------------
//| Check Browser and Open Ajax channel 
//+-----------------------------------------------------------------------------
    var XMLHttpRequestObject = false;
    if (window.XMLHttpRequest) {
        XMLHttpRequestObject = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        XMLHttpRequestObject = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (XMLHttpRequestObject) {

//           XMLHttpRequestObject.open("POST", dataSource, false);  //send the request synchronously 
	//+-------------------------------------------------------------------------------
        //|  if use async=false, do NOT write an onreadystatechange function - just put the code after the send() statement:
	//+-----------------------------------------------------------------------------
	    XMLHttpRequestObject.open("POST", dataSource, true);  
        
// + Debug 29.sep.2011
//        alert(" within readData()- Ajax open channel ..." ) ; 
        
	//+-----------------------------------------------------------------------------
	//| Return Message Block 
	//+-----------------------------------------------------------------------------
        XMLHttpRequestObject.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        XMLHttpRequestObject.onreadystatechange = function() {
            if (XMLHttpRequestObject.readyState == 4 &&
              XMLHttpRequestObject.status == 200) {

// + Debug 29.sep.2011
//alert(" within rdData1B2 - Ajax open channel - band :" + band + " - responseText : " + XMLHttpRequestObject.responseText);
                fillParas(XMLHttpRequestObject.responseText);
                
                //---------------------------------------
                // notify other PHP the MQ is now available
                //---------------------------------------
                id = document.getElementById('NowBNum') ;
                if (id) {
                    id.value = "0";
                }
// + Debug 29.sep.2011
//alert(" within rdData1B2 - MQ restored !  ");
                
                
            }
        }

	//+-----------------------------------------------------------------------------
        //| create the oid array with npCmd setting
	//+-----------------------------------------------------------------------------
        if (0 == band) {
		
// + Oct.18.2011 
//  Serial#, S/W version, IP Address, DC Voltage, Alarms Pending 
//            var oidArray = new Array(0x3ab, 0x5, 0xa);
            var oidArray = new Array(0x3ab, 0x5, 0xa, 0x701, 0x704);
 
	} else {
            var oidArray = new Array(0x441, 0x441, 0x453, 0x454, 0x5a7, 0x3ab, 0x4cd, 0x5a8);
//            var oidArray = new Array(0x441, 0x441, 0x453, 0x454, 0x5a7,           0x4cd, 0x5a8);
        }
        
        var sArray = new Array;
        var index = 0; //index for sArray
        for (i = 0; i < oidArray.length; i++) {
            if (0x441 != oidArray[i]) {
                var e = new Array(oidArray[i], band);
                sArray[index] = e;
                index++;
            }
        }
        //manually add "0x441"
        if (0 != band) {
            sArray[index] = new Array(0x441, (band * 2) - 1);
            sArray[index + 1] = new Array(0x441, band * 2);
        }

       var data = JSON.stringify(sArray);
// 
// + Debug Oct.18.2011
//alert(' within readData()- after JSON.stringify(sArray) ...  data=' + data + '&type=read' + '&sid=' + stationID + '&did=' + deviceID + '&deviceMode='+deviceMode);
//alert('test again:data=' + data + '&type=read' + '&sid=' + sid + '&did=' + did);

// + Oct.14.2011	
//	XMLHttpRequestObject.send('data=' + data + '&type=read' + '&sid=' + stationID + '&did=' + deviceID);
        XMLHttpRequestObject.send('data=' + data + '&type=read' + '&sid=' + stationID + '&did=' + deviceID+ '&deviceMode='+deviceMode);
	

//alert(" *** MSG sent *** ") ; 
        //---------------------------------------
        // notify other PHP the MQ is NOT available
        //---------------------------------------
        id = document.getElementById('NowBNum') ;
        if (id) {
            id.value = band.toString() ;
        }
//alert(" ### flag reset ### ");

	//+-----------------------------------------------------------------------------
	//| clean up the user interface
	//+-----------------------------------------------------------------------------
       for (i = 0; i < sArray.length; i++) {
           switch (sArray[i][0]) {
 // alarm block               
              case 0x3ab:
                   targetID = '0x' + sArray[i][0].toString(16) + '_' + sArray[i][1].toString(16);
                   showTest = document.getElementById(targetID);
                   if (showTest) {
                       showTest.innerHTML = 'Updating...';
                   } else {
// + Oct.18.2011
//                     alert(" -- readData -- clean Error:" + targetID);
                       DAUErrRpt(" -- readData -- clean Error:" + targetID);
                   }
                   break;
               case 0x4cc:
// UL on/off               
               case 0x4cd:
                   targetID = '0x' + sArray[i][0].toString(16) + '_' + sArray[i][1].toString(16) + '_on';
                   showTest = document.getElementById(targetID);
                   if (showTest) {
                       showTest.checked = "";
                   } else {
// + Oct.18.2011                       
//                     alert(" -- readData -- clean Error:" + targetID);
                       DAUErrRpt(" -- readData -- clean Error:" + targetID);
                   }
                   targetID = '0x' + sArray[i][0].toString(16) + '_' + sArray[i][1].toString(16) + '_off';
                   showTest = document.getElementById(targetID);
                   if (showTest) {
                       showTest.checked = "";
                   } else {
// + Oct.18.2011                       
//                     alert(" -- readData -- clean Error:" + targetID);
                       DAUErrRpt(" -- readData -- clean Error:" + targetID);
                   }
                   break;
               default:
                   targetID = '0x' + sArray[i][0].toString(16) + '_' + sArray[i][1].toString(16);
                   showTest = document.getElementById(targetID);
                   if (showTest) {
                       showTest.value = '';
                   } else {
// + Oct.18.2011                       
//                     alert(" -- readData -- clean Error:" + targetID);
                       DAUErrRpt(" -- readData -- clean Error:" + targetID);
                   }
           }
       }

// + Debug 29.sep.2011
//alert("sent");
       
    }
}





//==============================================================================
// function writeData  ???
//==============================================================================
function writeData(dataSource, band) {
    document.getElementById('msgDiv').innerHTML = "Updating data to device...";

// + Debug 29.sep.2011
//        alert(" within writeData()- band :" + band ) ; 
	
//+-----------------------------------------------------------------------------
//| Check Browser and Open Ajax channel 
//+-----------------------------------------------------------------------------
    var XMLHttpRequestObject = false;
    if (window.XMLHttpRequest) {
        XMLHttpRequestObject = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        XMLHttpRequestObject = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (XMLHttpRequestObject) {

//	    XMLHttpRequestObject.open("POST", dataSource, false);  //send the request synchronously 
	//+-------------------------------------------------------------------------------
        //|  if use async=false, do NOT write an onreadystatechange function - just put the code after the send() statement:
	//+-----------------------------------------------------------------------------
	XMLHttpRequestObject.open("POST", dataSource, true);  //send the request synchronously 
	    
// + Debug 29.sep.2011
//        alert(" within writeData()- Ajax open channel ..." ) ; 
//+-----------------------------------------------------------------------------
//| Return Message Block 
//+-----------------------------------------------------------------------------
       XMLHttpRequestObject.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        XMLHttpRequestObject.onreadystatechange = function() {
            if (XMLHttpRequestObject.readyState == 4 &&
              XMLHttpRequestObject.status == 200) {

// + Debug 29.sep.2011
//        alert(" within writeData()- Ajax open channel - responseText : " + XMLHttpRequestObject.responseText);

                //alert(XMLHttpRequestObject.responseText);
//------------------------------------------------------------------------------
// In terms of write, if SET is ok, notify but no message update
//------------------------------------------------------------------------------
//              fillParas(XMLHttpRequestObject.responseText);
                respMQ(XMLHttpRequestObject.responseText);

            }
        }

//+-----------------------------------------------------------------------------
//create the oid array with npCmd setting before submitting to Message Queue
//+-----------------------------------------------------------------------------
        var oidArray = new Array(0x441, 0x453, 0x454, 0x4cd);
        //var oidArray = new Array(0x441, 0x453, 0x454);
 
	var sArray = new Array;
        var index = 0; //index for sArray
	
        for (i = 0; i < oidArray.length; i++) {
            switch (oidArray[i]){
// DL or UL Attentuation		    
                case 0x441:
                    targetID = '0x' + oidArray[i].toString(16) + '_' + ((band * 2) - 1).toString();
                    showTest = document.getElementById(targetID);
                    if (showTest) {
                        var e = new Array(oidArray[i], showTest.value, (band * 2) - 1);
// + Oct.14.2011
//alert(" -- WriteData -- index: "+index);
			    
                        sArray[index] = e;
                        index++;
                        showTest.value = '';
                    }
                    targetID = '0x' + oidArray[i].toString(16) + '_' + (band * 2).toString();
                    showTest = document.getElementById(targetID);
                    if (showTest) {
                        var e = new Array(oidArray[i], showTest.value, band * 2);
                        sArray[index] = e;
                        index++;
                        showTest.value = '';
                    }
                    break;
		    
                case 0x4cc:
// UL on/off
		case 0x4cd:
                    targetID = '0x' + oidArray[i].toString(16) + '_' + band.toString() + '_on';
                    showTest = document.getElementById(targetID);
                    if (showTest) {
                        if (showTest.checked) {
                            //alert('creating check on');
                            var e = new Array(oidArray[i], '1', band);
                            sArray[index] = e;
                            index++;
                            showTest.checked = "";
                        }
                    }
                    targetID = '0x' + oidArray[i].toString(16) + '_' + band.toString() + '_off';
                    showTest = document.getElementById(targetID);
                    if (showTest) {
                        if (showTest.checked) {
                            //alert('creating check off');
                            var e = new Array(oidArray[i], '0', band);
                            sArray[index] = e;
                            index++;
                            showTest.checked = "";
                        }
                    }
                    break;
                default:
                    targetID = '0x' + oidArray[i].toString(16) + '_' + band.toString();
                    showTest = document.getElementById(targetID);
                    if (showTest) {
                        var e = new Array(oidArray[i], showTest.value, band);
                        sArray[index] = e;
                        index++;
                        showTest.value = '';
                    } else {
                        alert("clean Error");
                    }
            }
        }
        
        var data = JSON.stringify(sArray);
        //alert(data);
        //alert('test again:data=' + data + '&type=read' + '&sid=' + sid + '&did=' + did);

// + OCT.14.2011
//        XMLHttpRequestObject.send('data=' + data + '&type=write' + '&sid=' + stationID + '&did=' + deviceID);
        XMLHttpRequestObject.send('data=' + data + '&type=write' + '&sid=' + stationID + '&did=' + deviceID+ '&deviceMode='+deviceMode);
	
    }
}


//==============================================================================
// function freqSetting
//==============================================================================
function freqSetting() {
	
// + Debug Oct.14.2011	
alert(" -- within rwDAU.js - freqSetting() - b4 calling subBand.html  ...") ; 	
	
    var urlStr = "subBand.html?device=" + deviceID;
    window.location.href = urlStr;
    //"alarm.html?device=" + deviceMode + "&band=" + rData[i]['npCmd'] + "&alarm=" + rData[i]['Content'];
}


//==============================================================================
// function dauConfig 
// caller : dau.html
//==============================================================================
function dauConfig() {
	
/*
var l = location.href;
var left = l.indexOf("=")+1;
var tmpstg = l.substring(left);
var right = l.indexOf("&");
   
// device ID
var did = l.substring(left,right) ;
alert(" -- did:"+did);
//Device Mode
left = tmpstg.lastIndexOf("=")+1;
var dMode = tmpstg.substring(left);
alert(" -- dMode:"+dMode);
*/

    var id = BandCnt = RfBdTyp1 = BTSiTyp1 = RfBdTyp2 = BTSiTyp2 = RfBdTyp3 = BTSiTyp3 = RfBdTyp4 = BTSiTyp4 = 0; 
    var DeviceName = DAUdid = deviceMode = "";
    
    // DAU Device Name
    id = document.getElementById('DeviceName') ;
    if (id) {
        DeviceName = id.innerHTML ;
//alert(" -- DeviceName:"+DeviceName);

    }

    id = document.getElementById('RfBdTyp1') ;
    if (id) {
        RfBdTyp1 = id.value ;
//alert(" -- RfBdTyp1:"+RfBdTyp1);
    }
    id = document.getElementById('BTSiTyp1') ;
    if (id) {
        BTSiTyp1 = id.value ;
//alert(" -- BTSiTyp1:"+BTSiTyp1);
    }
    id = document.getElementById('RfBdTyp2') ;
    if (id) {
        RfBdTyp2 = id.value ;
//alert(" -- RfBdTyp2:"+RfBdTyp2);
    }
    id = document.getElementById('BTSiTyp2') ;
    if (id) {
        BTSiTyp2 = id.value ;
//alert(" -- BTSiTyp2:"+BTSiTyp2);
    }
    id = document.getElementById('RfBdTyp3') ;
    if (id) {
        RfBdTyp3 = id.value ;
//alert(" -- RfBdTyp3:"+RfBdTyp3);
    }
    id = document.getElementById('BTSiTyp3') ;
    if (id) {
        BTSiTyp3 = id.value ;
//alert(" -- BTSiTyp3:"+BTSiTyp3);
    }
    id = document.getElementById('RfBdTyp4') ;
    if (id) {
        RfBdTyp4 = id.value ;
//alert(" -- RfBdTyp4:"+RfBdTyp4);
    }
    id = document.getElementById('BTSiTyp4') ;
    if (id) {
        BTSiTyp4 = id.value ;
//alert(" -- BTSiTyp4:"+BTSiTyp4);
    }
// device Id
    id = document.getElementById('DAUdid') ;
    if (id) {
        DAUdid = id.value ;
//alert(" -- DAUdid:"+DAUdid);
    }
// device mode
    id = document.getElementById('deviceMode') ;
    if (id) {
        deviceMode = id.value ;
//alert(" -- deviceMode:"+deviceMode);
    }
    
// Pass the param from caller to callee 
    var urlStr = "dauConfig.html";

    urlStr = urlStr + "?DeviceName="+DeviceName ;
    urlStr = urlStr + "&RfBdTyp1="+RfBdTyp1;
    urlStr = urlStr + "&BTSiTyp1="+BTSiTyp1;
    urlStr = urlStr + "&RfBdTyp2="+RfBdTyp2;
    urlStr = urlStr + "&BTSiTyp2="+BTSiTyp2;
    urlStr = urlStr + "&RfBdTyp3="+RfBdTyp3;
    urlStr = urlStr + "&BTSiTyp3="+BTSiTyp3;
    urlStr = urlStr + "&RfBdTyp4="+RfBdTyp4;
    urlStr = urlStr + "&BTSiTyp4="+BTSiTyp4;
    urlStr = urlStr + "&deviceMode="+deviceMode ;
    urlStr = urlStr + "&did=" + DAUdid; 

//alert(" - urlStr:"+urlStr);    
    
    window.location.href = urlStr;
}

//==============================================================================
// function delineate
// caller : dau.html, rwDAU.js:dauConfig()
//==============================================================================
function delineate(str){
    theleft = str.indexOf("=") + 1;
    theright = str.lastIndexOf("&");
    return(str.substring(theleft, theright));
}




