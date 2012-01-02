

//==============================================================================
//   Update Log:
//   -----------
// Object ID of DL and UL Attentuation are changed to 0x441 with Device ID x05  + Oct.19.2011          
//==============================================================================

// default value if run DRU standalone
var deviceMode = 'DRU_daulband';
var stationID = 0x12345678;
var deviceID = 0xc6;
var dauDeviceID = 0x0;

var dauULOutPower;
var dauDLInPower;
var druULInPower;
var druDLOutPower;

// + 10.Oct.2011
var loopCnt  = 0;

//==============================================================================
// function DAUErrRpt flags error and warning
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
// function UptDRULbl
// note: routine RFBdType() defined at common.js
//==============================================================================
function UptDRULbl(devNm,R1,R2) {

    // DRU Device Name
    var id = document.getElementById('DeviceName') ;
    if (id) {
        id.innerHTML = devNm;
    }
    // RF Band Type 1
    id = document.getElementById('DRURfBdTyp1') ;
    if (id) {
        id.innerHTML = "Band " + RFBdType(parseInt(R1)) + " :";
    }
    // RF Band Type 2
    id = document.getElementById('DRURfBdTyp2') ;
    if (id) {
        id.innerHTML = "Band " + RFBdType(parseInt(R2)) + " :";
    }

}

//==============================================================================
// function ArchiveDRUCfg
//==============================================================================
function ArchiveDRUCfg(R1, R2, Y1, Y2, IO, IP, dId, dM, D1, D2, D3, D4, daudid, daudMode) {    

// dru 
    document.drucfg.RfBdTyp1.value= R1;
    document.drucfg.RfBdTyp2.value= R2;
    document.drucfg.Payr1.value= Y1;
    document.drucfg.Payr2.value= Y2;
    document.drucfg.IOdoor.value= IO;
    document.drucfg.NetwkIP.value= IP;
    document.drucfg.DRUdid.value= dId;
    document.drucfg.deviceMode.value= dM;
// dau
    document.drucfg.DAUBT1.value= D1;
    document.drucfg.DAUBT2.value= D2;
    document.drucfg.DAUBT3.value= D3;
    document.drucfg.DAUBT4.value= D4;

    document.drucfg.daudid.value= daudid;
    document.drucfg.daudMode.value= daudMode;
    
}

//==============================================================================
// function readAllParas - main entry for loading data to fill the page
//==============================================================================
function readAllParas() {
    
    var id;
    //+-----------------------
    //| Update label and archive param from caller only during warm-boot 
    //+-----------------------
    if (loopCnt==0) {
        
//      loadData(); 	
        //+-----------------------
        // retrieve the param from caller
        //+-----------------------
        var url = location.href;
//alert("-- within loadData(), url:"+url );
        
        var theRequest = new Object();
        if (url.indexOf("?") != -1) {
            var str = url.substr(url.indexOf("?") + 1);
            strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
        }
        //+-----------------------
        // update DRU global var.
        //+-----------------------
        deviceID = theRequest['deviceID'];
        deviceMode = theRequest['deviceMode'];
        //+-----------------------
        //| DRU RF Band Type
        //+-----------------------
        var RfBdTyp1 = theRequest['R1'];
        var RfBdTyp2 = theRequest['R2'];
        //+-----------------------
        //| DRU Payr
        //+-----------------------
        var Payr1 = theRequest['Y1'];
        var Payr2 = theRequest['Y2'];
        //+-----------------------
        //| DRU Indoor or Outdoor
        //+-----------------------
        var IOdoor   = theRequest['IO'];
        //+-----------------------
        //| DRU Network IP address 
        //+-----------------------
        var NetwkIP  = theRequest['IP'];
        //+-----------------------
        //| DRU device name 
        //+-----------------------
        var DevName  = theRequest['DevName'] ;
        //+-----------------------
        //| DAU RF band frequency 
        //+-----------------------
        var DAUBT1   = theRequest['RfBdTyp1'] ;
        var DAUBT2   = theRequest['RfBdTyp2'] ;
        var DAUBT3   = theRequest['RfBdTyp3'] ;
        var DAUBT4   = theRequest['RfBdTyp4'] ;
        
        
        var daudid   = theRequest['daudid']   ;
//alert(" -- daudid: "+ daudid); 
        var daudMode = theRequest['daudMode'] ;
//alert(" -- daudMode: "+ daudMode); 
        
        //+-----------------------
        //| update DRU screen labels and archive param for DRU Cfg
        //+-----------------------
        UptDRULbl(DevName,RfBdTyp1,RfBdTyp2);
        ArchiveDRUCfg(RfBdTyp1,RfBdTyp2,Payr1,Payr2,IOdoor,NetwkIP,deviceID,deviceMode,DAUBT1,DAUBT2,DAUBT3,DAUBT4,daudid,daudMode);

        //+-----------------------
        //| DRU Device Name
        //+-----------------------
        id = document.getElementById('DeviceName') ;
        if (id) {
            id.innerHTML = deviceID; 
        }

        loopCnt++;
    }

//+-----------------------
//| rx Network IP from backup regarding the low byte of the IP address for 
//| IpAddrByte regarding MQ Frame Header
//| see section 3.1 Frame Header @ DAU-Management Interface
//+-----------------------
    id = document.getElementById('NetwkIP') ;
    if (id) {
        NetwkIP = id.value; 
//alert("-- within readAllParas(), NetwkIP:"+NetwkIP);
    }
//    var nStartPos   = NetwkIP.indexOf(".") ;
//alert("-- within readAllParas(), nStartPos:"+nStartPos);
    var cIpAddrByte = NetwkIP.substr(0,NetwkIP.indexOf(".")) ;
//alert("-- within readAllParas(), cIpAddrByte:"+cIpAddrByte+" - length:"+cIpAddrByte.length);


//+-----------------------
//| RF Band one
//+-----------------------
//readData('php/rwParas.php', 1);
readSrc('php/rwParas.php', 1, cIpAddrByte);
//+-----------------------
//| RF Band two
//+-----------------------
//readData('php/rwParas.php', 2);
readSrc('php/rwParas.php', 2, cIpAddrByte);

//+-----------------------
//| RF Band 700
//+-----------------------
//readData('php/rwParas.php', 3);
//+-----------------------
//| RF Band AWS
//+-----------------------
//readData('php/rwParas.php', 4);

//+-----------------------
//| System param
//+-----------------------
//readData('php/rwParas.php', 0);
readSrc('php/rwParas.php', 0, cIpAddrByte);

// cleanup MQ
//readData('php/rwParas99.php', 0);

//+-----------------------
//| poll every 60 seconds
//+-----------------------
setTimeout("readAllParas()","60000");
    

}

//==============================================================================
// function readAllParas - main entry for loading data to fill the page
//==============================================================================
function loadData() {

    var url = location.href;

// Debug
alert("-- within loadData(), url:"+url );
    
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
    return true;

}

//==============================================================================
// function fillParas
//==============================================================================
function fillParas(responseText, band) {
    //alert (responseText);
    var rData = JSON.parse(responseText);
    var showTest;
    var targetID;
	//alert("rData.lengt: " + rData.length);
    for (i = 0; i < rData.length; i++) {
        switch (rData[i]['OID']) {
// alarm            
            case 0x3ab:
                targetID = '0x3ab_' + rData[i]['npCmd'].toString();
                showTest = document.getElementById(targetID);
                if (showTest) {
                    if (checkAlarm(rData[i]['Content'], deviceMode, rData[i]['npCmd'])) {
                        showTest.innerHTML = "________";
                        showTest.className = "hasAlarm";
                    } else {
                        showTest.innerHTML = "________";
                        showTest.className = "noAlarm";
                    }
                    showTest.href = "alarm.html?device=" + deviceMode + "&band=" + rData[i]['npCmd'] + "&alarm=" + rData[i]['Content'];
                } else {
// + Oct.13.2011 ???                    
//                    alert("Data error - 0x3ab:" + targetID);
                }
                break;
// PA on-off                
            case 0x402:
// UL on-off            
            case 0x4cd:
// DPD on-off            
            case 0x4a7:
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
// unknown ???            
            case 0x4d0:     //CFR config
				//alert("get CFR: " + rData[i]['Content']);
                var cfrArray = rData[i]['Content'].split("");
				//alert("cfrArray.length: " + cfrArray.length);
                for (var i_cfg = 0; i_cfg < cfrArray.length; i_cfg++) {
                    targetID = '0x' + rData[i]['OID'].toString(16) + '_' + rData[i]['npCmd'].toString() + '_' + (i_cfg + 1).toString();
                    //alert (targetID);
					showTest = document.getElementById(targetID);
                    if (showTest) {
                        if (1 == cfrArray[i_cfg]) {
                            showTest.checked = "checked";
                        }
                    }
                }
                break;
// DL Output Power                
            case 0x503:
                druDLOutPower = parseFloat(rData[i]['Content']);  //DRU
                targetID = '0x' + rData[i]['OID'].toString(16) + '_' + rData[i]['npCmd'].toString();
                showTest = document.getElementById(targetID);
                if (showTest) {
                    showTest.value = roundNumber(rData[i]['Content'], 1);
                } else {
// + Oct.13.2011 ???                    
//                    alert("Data error - 0x503 :" + targetID);
                }
                break;
// UL Input power                
            case 0x5a7:
                if (dauDeviceID == rData[i]['did']) {
                    dauDLInPower = parseFloat(rData[i]['Content']);  //DAU
                } else {
                    druULInPower = parseFloat(rData[i]['Content']);  //DRU
                    targetID = '0x' + rData[i]['OID'].toString(16) + '_' + rData[i]['npCmd'].toString();
                    showTest = document.getElementById(targetID);
                    if (showTest) {
                        showTest.value = roundNumber(rData[i]['Content'], 1);
                    } else {
// + Oct.13.2011 ???                    
//                        alert("Data error: - 0x5a7 " + targetID);
                    }
                }
                break;
// DAU UL Output Power  - ???              
            case 0x5a8:
                if (dauDeviceID == rData[i]['did']) {
                    dauULOutPower = parseFloat(rData[i]['Content']);  //DAU
                }
                break;
// DL Output Power                
            case 0x503:
// UL Input  Power            
            case 0x5a7:
                targetID = '0x' + rData[i]['OID'].toString(16) + '_' + rData[i]['npCmd'].toString();
                showTest = document.getElementById(targetID);
                if (showTest) {
                    showTest.value = roundNumber(rData[i]['Content'], 1);
                } else {
// + Oct.13.2011 ???                    
//                    alert("Data error: - 0x5a7 " + targetID);
                }
				break;
            default:
                targetID = '0x' + rData[i]['OID'].toString(16) + '_' + rData[i]['npCmd'].toString();
                showTest = document.getElementById(targetID);
                if (showTest) {
                    showTest.value = rData[i]['Content'];
                } else {
// + Oct.13.2011 ???                    
//                    alert("Data error: - default " + targetID);
                }
        }
    }

    if (0 < rData.length) {
        // mark the communication status 
        document.getElementById('MCStatus').innerHTML = "Ok";
        // calculate the system DL/UL Gain
        if (0 != band) {
            //alert('druDLOutPower=' + druDLOutPower + 'dauDLInPower=' + dauDLInPower + '&dauULOutPower = ' + dauULOutPower + '&druULInPower=' + druULInPower);
            targetID = 'DLGain_' + band;
            document.getElementById(targetID).value = roundNumber((druDLOutPower - dauDLInPower), 1);  //Math.round((druDLOutPower - dauDLInPower) * 100) / 100;
            targetID = 'ULGain_' + band;
            document.getElementById(targetID).value = roundNumber((dauULOutPower - druULInPower), 1); //Math.round((dauULOutPower - druULInPower) * 100) / 100;
        }
    } else {
        // mark the communication error
        document.getElementById('MCStatus').innerHTML = "Error";
    }

    // mark the updating time
    var dt = new Date();
    document.getElementById('msgDiv').innerHTML = "Last Update: " + dt.toString();
}

//==============================================================================
// function readSrc
//==============================================================================
function readSrc(dataSource, band, IpByte) {
    
    document.getElementById('msgDiv').innerHTML = "Loading data from device...";

//alert(" within  ** rwDRU.js ** readSrc()- band :"+band+" - IpByte:"+IpByte) ; 
//+-----------------------------------------
//| Check Browser and Open Ajax channel 
//+-----------------------------------------
    var XMLHttpRequestObject = false;
    if (window.XMLHttpRequest) {
        XMLHttpRequestObject = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        XMLHttpRequestObject = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (XMLHttpRequestObject) {
        XMLHttpRequestObject.open("POST", dataSource);
        
// + Debug 29.sep.2011
//        alert(" within readSrc()- Ajax open channel for DRU ..." ) ; 
//+-----------------------------------------
//| Return Message Block 
//+-----------------------------------------
        
        XMLHttpRequestObject.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        XMLHttpRequestObject.onreadystatechange = function() {
            if (XMLHttpRequestObject.readyState == 4 &&
              XMLHttpRequestObject.status == 200) {

// + Debug 29.sep.2011
//alert(" within readSrc() - Ajax open channel - responseText : " + XMLHttpRequestObject.responseText);
                fillParas(XMLHttpRequestObject.responseText, band);

            }
        }

//+-----------------------------------------
//| create the oid array with npCmd setting ???
//+-----------------------------------------
        if (0 == band) {
            var oidArray = new Array(0x3ab, 0x5, 0xa, 0x4a0, 0x4a1);
	} else if ( band > 2) {
// + Oct.19.2011
//          var oidArray = new Array(0x440, 0x440, 0x503, 0x5a7, 0x402, 0x4cd);
            var oidArray = new Array(0x441, 0x441, 0x503, 0x5a7, 0x402, 0x4cd);
        } else {
//         var oidArray = new Array(0x440, 0x440, 0x503, 0x5a7, 0x501, 0x506, 0x450, 0x402, 0x4cd, 0x4a7, 0x4d0);
//+-----------------------------------------
//  + Oct.19.2011 
//  Since 0x440 field will be manually added afterwards, avoid duplicate, remove 0x4a7, 0x440         
//+-----------------------------------------
//         var oidArray = new Array(0x440, 0x440, 0x503, 0x5a7, 0x501, 0x506, 0x450, 0x402, 0x4cd, 0x3ab, 0x4a7, 0x4d0);
//         var oidArray = new Array(0x503, 0x5a7, 0x501, 0x506, 0x450, 0x402, 0x4cd, 0x3ab, 0x4a7, 0x4d0);
           var oidArray = new Array(0x503, 0x5a7, 0x501, 0x506, 0x450, 0x402, 0x4cd, 0x3ab );

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
//+-----------------------------------------
//manually add "0x441"                      + Oct.19.2011
//+-----------------------------------------
        if (0 != band) {
//          sArray[index] = new Array(0x440, (band * 2) - 1);
//          sArray[index + 1] = new Array(0x440, band * 2);
            sArray[index] = new Array(0x441, (band * 2) - 1);
            sArray[index + 1] = new Array(0x441, band * 2);
        }

// + Debug Oct.11.2011
//alert(' -- within readData(), B4 stringify -- type=read' + '&sid=' + stationID + '&did=' + deviceID);

        var data = JSON.stringify(sArray);

// + Debug Oct.11.2011
//alert(' -- within readData(), B4 stringify --  data='+ data + 'type=read' + '&sid=' + stationID + '&did=' + deviceID);

        //+-----------------------------------------
        //| note : data (SArray[][2] collects import RF Band
        //+-----------------------------------------
//      XMLHttpRequestObject.send('data=' + data + '&type=read' + '&sid=' + stationID + '&did=' + deviceID);
//      XMLHttpRequestObject.send('data=' + data + '&type=read' + '&sid=' + stationID + '&did=' + deviceID+ '&deviceMode='+deviceMode);
        XMLHttpRequestObject.send('data=' + data + '&type=read' + '&ip=' + IpByte + '&sid=' + stationID + '&did=' + deviceID+ '&deviceMode='+deviceMode);

        //+-----------------------------------------
        //| update screen like alamr, UL on/off etc after submit request to PHP
        //+-----------------------------------------
        for (i = 0; i < sArray.length; i++) {
            switch (sArray[i][0]) {
// Alarm block 
                case 0x3ab:
                    targetID = '0x' + sArray[i][0].toString(16) + '_' + sArray[i][1].toString(16);
                    showTest = document.getElementById(targetID);
                    if (showTest) {
                        showTest.innerHTML = 'Updating...';
                    } else {
// + Oct.19.2011
//                     alert("clean Error:" + targetID);
                       DAUErrRpt(" -- readData -- clean Error:" + targetID);
                    }
                    break;
                case 0x402:
// PA on/off                
                case 0x4cd:
// obsolete - DPD on/off                
                case 0x4a7:
                    targetID = '0x' + sArray[i][0].toString(16) + '_' + sArray[i][1].toString(16) + '_on';
                    showTest = document.getElementById(targetID);
                    if (showTest) {
                        showTest.checked = "";
                    } else {
                        alert("clean Error:" + targetID);
                    }
                    targetID = '0x' + sArray[i][0].toString(16) + '_' + sArray[i][1].toString(16) + '_off';
                    showTest = document.getElementById(targetID);
                    if (showTest) {
                        showTest.checked = "";
                    } else {
                        alert("clean Error:" + targetID);
                    }
                    break;
// obsolete - CFR WCDMA                    
                case 0x4d0:
                    for (i_cfg = 1; i_cfg < 5; i_cfg++) {
                        targetID = '0x' + sArray[i][0].toString(16) + '_' + sArray[i][1].toString(16) + '_' + i_cfg;
						//alert(targetID);
                        showTest = document.getElementById(targetID);
                        if (showTest) {
                            showTest.checked = "";
                        }
                    }
                    break;
                default:
                    targetID = '0x' + sArray[i][0].toString(16) + '_' + sArray[i][1].toString(16);
                    showTest = document.getElementById(targetID);
                    if (showTest) {
                        showTest.value = '';
                    } else {
//                     alert("clean Error:" + targetID);
// + Oct.19.2011
                       DAUErrRpt(" -- readData -- clean Error:" + targetID);
                    }
            }
        }
        //manually clean up the UL/DL Gain
        if (0 != band) {
            targetID = 'DLGain_' + band;
            document.getElementById(targetID).value = '';
            targetID = 'ULGain_' + band;
            document.getElementById(targetID).value = '';
        }
        //alert("sent");
    }
}


//==============================================================================
// function readData
//==============================================================================
function readData(dataSource, band) {
    document.getElementById('msgDiv').innerHTML = "Loading data from device...";

// + Oct.11.2011
//    alert(" within  ** rwDRU.js ** readData()- band :" + band ) ; 

//+-----------------------------------------
//| Check Browser and Open Ajax channel 
//+-----------------------------------------
    var XMLHttpRequestObject = false;
    if (window.XMLHttpRequest) {
        XMLHttpRequestObject = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        XMLHttpRequestObject = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (XMLHttpRequestObject) {
        XMLHttpRequestObject.open("POST", dataSource);
        
// + Debug 29.sep.2011
//        alert(" within readData()- Ajax open channel for DRU ..." ) ; 
//+-----------------------------------------
//| Return Message Block 
//+-----------------------------------------
        
        XMLHttpRequestObject.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        XMLHttpRequestObject.onreadystatechange = function() {
            if (XMLHttpRequestObject.readyState == 4 &&
              XMLHttpRequestObject.status == 200) {

// + Debug 29.sep.2011
//alert(" within readData()- Ajax open channel - responseText : " + XMLHttpRequestObject.responseText);
                //
                //alert(XMLHttpRequestObject.responseText);
                fillParas(XMLHttpRequestObject.responseText, band);

            }
        }

//+-----------------------------------------
//| create the oid array with npCmd setting ???
//+-----------------------------------------
        if (0 == band) {
            var oidArray = new Array(0x3ab, 0x5, 0xa, 0x4a0, 0x4a1);
	} else if ( band > 2) {
// + Oct.19.2011
//          var oidArray = new Array(0x440, 0x440, 0x503, 0x5a7, 0x402, 0x4cd);
            var oidArray = new Array(0x441, 0x441, 0x503, 0x5a7, 0x402, 0x4cd);
        } else {
//         var oidArray = new Array(0x440, 0x440, 0x503, 0x5a7, 0x501, 0x506, 0x450, 0x402, 0x4cd, 0x4a7, 0x4d0);
//+-----------------------------------------
//  + Oct.19.2011 
//  Since 0x440 field will be manually added afterwards, avoid duplicate, remove 0x4a7, 0x440         
//+-----------------------------------------
//         var oidArray = new Array(0x440, 0x440, 0x503, 0x5a7, 0x501, 0x506, 0x450, 0x402, 0x4cd, 0x3ab, 0x4a7, 0x4d0);
//         var oidArray = new Array(0x503, 0x5a7, 0x501, 0x506, 0x450, 0x402, 0x4cd, 0x3ab, 0x4a7, 0x4d0);
           var oidArray = new Array(0x503, 0x5a7, 0x501, 0x506, 0x450, 0x402, 0x4cd, 0x3ab );

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
//+-----------------------------------------
//manually add "0x441"                      + Oct.19.2011
//+-----------------------------------------
        if (0 != band) {
//          sArray[index] = new Array(0x440, (band * 2) - 1);
//          sArray[index + 1] = new Array(0x440, band * 2);
            sArray[index] = new Array(0x441, (band * 2) - 1);
            sArray[index + 1] = new Array(0x441, band * 2);
        }

// + Debug Oct.11.2011
//alert(' -- within readData(), B4 stringify -- type=read' + '&sid=' + stationID + '&did=' + deviceID);

        var data = JSON.stringify(sArray);

// + Debug Oct.11.2011
//alert(' -- within readData(), B4 stringify --  data='+ data + 'type=read' + '&sid=' + stationID + '&did=' + deviceID);

        //+-----------------------------------------
        //| note : data (SArray[][2] collects import RF Band
        //+-----------------------------------------
//      XMLHttpRequestObject.send('data=' + data + '&type=read' + '&sid=' + stationID + '&did=' + deviceID);
        XMLHttpRequestObject.send('data=' + data + '&type=read' + '&sid=' + stationID + '&did=' + deviceID+ '&deviceMode='+deviceMode);

        //+-----------------------------------------
        //| update screen like alamr, UL on/off etc after submit request to PHP
        //+-----------------------------------------
        for (i = 0; i < sArray.length; i++) {
            switch (sArray[i][0]) {
// Alarm block 
                case 0x3ab:
                    targetID = '0x' + sArray[i][0].toString(16) + '_' + sArray[i][1].toString(16);
                    showTest = document.getElementById(targetID);
                    if (showTest) {
                        showTest.innerHTML = 'Updating...';
                    } else {
// + Oct.19.2011
//                     alert("clean Error:" + targetID);
                       DAUErrRpt(" -- readData -- clean Error:" + targetID);
                    }
                    break;
                case 0x402:
// PA on/off                
                case 0x4cd:
// obsolete - DPD on/off                
                case 0x4a7:
                    targetID = '0x' + sArray[i][0].toString(16) + '_' + sArray[i][1].toString(16) + '_on';
                    showTest = document.getElementById(targetID);
                    if (showTest) {
                        showTest.checked = "";
                    } else {
                        alert("clean Error:" + targetID);
                    }
                    targetID = '0x' + sArray[i][0].toString(16) + '_' + sArray[i][1].toString(16) + '_off';
                    showTest = document.getElementById(targetID);
                    if (showTest) {
                        showTest.checked = "";
                    } else {
                        alert("clean Error:" + targetID);
                    }
                    break;
// obsolete - CFR WCDMA                    
                case 0x4d0:
                    for (i_cfg = 1; i_cfg < 5; i_cfg++) {
                        targetID = '0x' + sArray[i][0].toString(16) + '_' + sArray[i][1].toString(16) + '_' + i_cfg;
						//alert(targetID);
                        showTest = document.getElementById(targetID);
                        if (showTest) {
                            showTest.checked = "";
                        }
                    }
                    break;
                default:
                    targetID = '0x' + sArray[i][0].toString(16) + '_' + sArray[i][1].toString(16);
                    showTest = document.getElementById(targetID);
                    if (showTest) {
                        showTest.value = '';
                    } else {
//                     alert("clean Error:" + targetID);
// + Oct.19.2011
                       DAUErrRpt(" -- readData -- clean Error:" + targetID);
                    }
            }
        }
        //manually clean up the UL/DL Gain
        if (0 != band) {
            targetID = 'DLGain_' + band;
            document.getElementById(targetID).value = '';
            targetID = 'ULGain_' + band;
            document.getElementById(targetID).value = '';
        }
        //alert("sent");
    }
}



//==============================================================================
// function writeData
//==============================================================================
function writeData(dataSource, band) {
    document.getElementById('msgDiv').innerHTML = "Updating data to device...";

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
        XMLHttpRequestObject.open("POST", dataSource);
//+-----------------------------------------------------------------------------
//| Return Message Block 
//+-----------------------------------------------------------------------------
        XMLHttpRequestObject.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        XMLHttpRequestObject.onreadystatechange = function() {
            if (XMLHttpRequestObject.readyState == 4 &&
              XMLHttpRequestObject.status == 200) {

            // + Debug 29.sep.2011
            alert(" within readData()- Ajax open channel - responseText : " + XMLHttpRequestObject.responseText);

                //alert(XMLHttpRequestObject.responseText);
                fillParas(XMLHttpRequestObject.responseText, band);
            }
        }

//+-----------------------------------------------------------------------------
//| set up fields with read-write ( excluding read only fields)
//+-----------------------------------------------------------------------------
        if (0 == band) {
//        var oidArray = new Array(0x4a1, 0x4a1);
          var oidArray = new Array(0x4a1);
        } else {
            var oidArray = new Array(0x440, 0x450, 0x402, 0x4cd, 0x4a7, 0x4d0);
	    //var oidArray = new Array(0x440, 0x402, 0x4cd);
        }


        //var oidArray = new Array(0x441, 0x453, 0x454);
        var sArray = new Array;
        var index = 0; //index for sArray
        for (i = 0; i < oidArray.length; i++) {
            switch (oidArray[i]) {
// DL Attention                
                case 0x440:
                    targetID = '0x' + oidArray[i].toString(16) + '_' + ((band * 2) - 1).toString();
                    showTest = document.getElementById(targetID);
                    if (showTest) {
                        var e = new Array(oidArray[i], showTest.value, (band * 2) - 1);
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
// PA on/off                   
                case 0x402:
// UL on/off                
                case 0x4cd:
// DPD on/off                
                case 0x4a7:
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
//CFR config                    
                case 0x4d0:  
                    var cfgStr = '';
                    for (var i_cfg = 1; i_cfg < 5; i_cfg++) {
                        targetID = '0x' + oidArray[i].toString(16) + '_' + band.toString() + '_' + i_cfg;
                        showTest = document.getElementById(targetID);
                        if (showTest) {
							
                            if (showTest.checked) {
                                cfgStr += '1';
                                showTest.checked = "";
                            } else {
                                cfgStr += '0';
                            }
                        }
                    }
                    //alert("cfgStr: " + cfgStr);
                    var e = new Array(oidArray[i], cfgStr, band);
                    sArray[index] = e;
                    index++;
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

// + Debug Oct.11.2011
alert(" -- within write data-- ") ;
       var_dump(sArray);

        var data = JSON.stringify(sArray);

alert(' -- within write data=' + data + '&type=read' + '&sid=' + sid + '&did=' + did);
        XMLHttpRequestObject.send('data=' + data + '&type=write' + '&sid=' + stationID + '&did=' + deviceID);

    }
}

//==============================================================================
// function druConfig 
// caller : dru.html
//==============================================================================
function druConfig() {

/*
var l = location.href;
var left = l.indexOf("=")+1;
var tmpstg = l.substring(left);
var right = l.indexOf("&");
// device ID
var did = l.substring(left,right) ;
//Device Mode
left = tmpstg.lastIndexOf("=")+1;
var dMode = tmpstg.substring(left);
*/

    var id = 0; 
    var DeviceName = RfBdTyp1 = RfBdTyp2 = DAUdid = deviceMode = did = "";
    var Payr1 = Payr2 = "" ;
    var DAUBT1 = DAUBT2 = DAUBT3 = DAUBT4 = DAUid = DAUMode = "" ;
    var urlStr;

    //---------------------------------
    // DRU Device Name
    //---------------------------------
    id = document.getElementById('DeviceName') ;
    if (id) {
        DeviceName = id.innerHTML ;
//alert(" -- DeviceName:"+DeviceName);
    }
    //---------------------------------
    // DRU RF Band Type 1
    //---------------------------------
    id = document.getElementById('RfBdTyp1') ;
    if (id) {
        RfBdTyp1 = id.value ;
//alert(" -- RfBdTyp1:"+RfBdTyp1);
    }
    //---------------------------------
    // DRU RF Band Type 2
    //---------------------------------
    id = document.getElementById('RfBdTyp2') ;
    if (id) {
        RfBdTyp2 = id.value ;
//alert(" -- RfBdTyp2:"+RfBdTyp2);
    }
    //---------------------------------
    // DRU Payr 1  
    //---------------------------------
    id = document.getElementById('Payr1') ;
    if (id) {
        Payr1 = id.value ;
    }
    
//alert(" -- Payr1:"+Payr1);
    //---------------------------------
    // DRU Payr 2 
    //---------------------------------
    id = document.getElementById('Payr2') ;
    if (id) {
        Payr2 = id.value ;
    }

//alert(" -- Payr2:"+Payr2);
    
    //---------------------------------
    // DRU device ID
    //---------------------------------
    id = document.getElementById('DRUdid') ;
    if (id) {
        did = id.value ;
//alert(" -- did:"+did);
    }
    //---------------------------------
    //DRU Device Mode
    //---------------------------------
    id = document.getElementById('deviceMode') ;
    if (id) {
        dMode = id.value ;
//alert(" -- dMode:"+dMode);
    }
    //---------------------------------
    //DRU Network IP Address 
    //---------------------------------
    id = document.getElementById('NetwkIP') ;
    if (id) {
        NetwkIP = id.value ;
//alert(" -- NetwkIP:"+NetwkIP);
    }
    //---------------------------------
    // DRU Indoor or OutDoor 
    //---------------------------------
    id = document.getElementById('IOdoor') ;
    if (id) {
        IOdoor = id.value ;
//alert(" -- IOdoor:"+IOdoor);
    }
    //-------------------------------------------
    // DAU RF Band 1  
    //-------------------------------------------
    id = document.getElementById('DAUBT1') ;
    if (id) {
        DAUBT1 = id.value ;
    }
    //---------------------------------
    // DAU RF Band 2  
    //---------------------------------
    id = document.getElementById('DAUBT2') ;
    if (id) {
        DAUBT2 = id.value ;
    }
    //---------------------------------
    // DAU RF Band 3  
    //---------------------------------
    id = document.getElementById('DAUBT3') ;
    if (id) {
        DAUBT3 = id.value ;
    }
    //---------------------------------
    // DAU RF Band 4  
    //---------------------------------
    id = document.getElementById('DAUBT4') ;
    if (id) {
        DAUBT4 = id.value ;
    }
    //---------------------------------
    // DAU device Id 
    //---------------------------------
    id = document.getElementById('daudid') ;
    if (id) {
        DAUid = id.value ;
//alert(" -- within rwDRU.js - druConfig() - DAUid:"+DAUid);
    }
    //---------------------------------
    // DAU device Mode
    //---------------------------------
    id = document.getElementById('daudMode') ;
    if (id) {
        DAUMode = id.value ;
        
//alert(" -- within rwDRU.js - druConfig() - DAUMode:"+DAUMode);
    }

    if (dMode=="DRU_dualband") {
// Dual Band    
//      urlStr = "druConfig.html?did=" + did +"&sid="+stationID+"&deviceMode="+dMode ;
        urlStr = "druConfig.html?";
    } else {
// Quart Band    
//      urlStr = "druQuartConfig.html?did=" + did +"&sid="+stationID+"&deviceMode="+dMode ;
        urlStr = "druQuartConfig.html?";
    }
    // device Id
    urlStr = urlStr + "did=" + did;
    // DRU Device Name
    urlStr = urlStr + "&dNm=" + DeviceName;
    // RF Band Type 1
    urlStr = urlStr + "&R1=" + RfBdTyp1;
    // RF Band Type 2
    urlStr = urlStr + "&R2=" + RfBdTyp2;
    // Payr 1
    urlStr = urlStr + "&Y1=" + Payr1;
    // Payr 2
    urlStr = urlStr + "&Y2=" + Payr2;
    //Network IP Address 
    urlStr = urlStr + "&IP=" + NetwkIP;
    // Indoor or OutDoor 
    urlStr = urlStr + "&IO=" + IOdoor;
    // Station Id - not used
    urlStr = urlStr + "&sid=" + stationID;
    // device Mode
    urlStr = urlStr + "&deviceMode=" + dMode;
    // DAU RF Band 1  
    urlStr = urlStr + "&D1=" + DAUBT1;
    // DAU RF Band 2  
    urlStr = urlStr + "&D2=" + DAUBT2;
    // DAU RF Band 3  
    urlStr = urlStr + "&D3=" + DAUBT3;
    // DAU RF Band 4  
    urlStr = urlStr + "&D4=" + DAUBT4;
    // DAU device Id
    urlStr = urlStr + "&daudid=" + DAUid;
    // DAU device mode
    urlStr = urlStr + "&daudMode=" + DAUMode;

//alert(" change location ... ");
window.location.href = urlStr;
}



