var stationID = 0x12345678;
var deviceID;

//-------------------------------------------
// RF Band 4 - AWS
//-------------------------------------------
var band = 4;                       
//-------------------------------------------
//Total number of sub bands - 
//-------------------------------------------
var iBands = 6;                    

var bandArray = new Array(iBands);  //sub band array
var standBW = 5;
var CBW = 7.5;
var maxBW = 25;

//==============================================================================
// function GetRequest
//==============================================================================
function GetRequest() {
    
    //getting sub-band setting from device
// Debug + oct.24.2011
//alert(" -- with GetRequest(), subBand.js location href : "+location.href);

    var deviceNm = bandno = caller = "" ;

    var url = location.href;
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(url.indexOf("?")+1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }

// Device Name
    deviceNm = theRequest['dvnm'];
// Band No
    bandno   = theRequest['bno'];    
// Caller Id
    caller   = theRequest['cid'];
//------------------------------------------------------
// Caption heading
//------------------------------------------------------
/*
    deviceID = theRequest['did'];
    if (0 == deviceID) {
        document.getElementById('DeviceName').innerHTML = "DAU "+ " Frequency Setting";
    } else {
        document.getElementById('DeviceName').innerHTML = "DRU_" + deviceID + " Frequency Setting";
    }
*/
    document.getElementById('DeviceName').innerHTML = deviceNm + " Frequency Setting";
//------------------------------------------------------
// DAU_Name
//------------------------------------------------------
    document.getElementById('DAU_Name').value = deviceNm ;
//------------------------------------------------------
// Band No
//------------------------------------------------------
    document.getElementById('bandno').innerHTML = bandno;


//    alert(" within  ** subBand.js ** GetRequest() ** -- calling creatBandArray() ") ; 
    creatBandArray();

//    alert(" within  ** subBand.js ** GetRequest() ** -- calling readData() ") ; 
    readData('php/rwParas.php');

}

//==============================================================================
// function creatBandArray - build the band array according "DW-TS010-DAS-SW_rev02" p11.
// note: Object properties - name, BW, Low (low bounary), High (High boundary) 
// i.e. scope between low and High not exceeding 25  
//==============================================================================
function creatBandArray() {

    document.getElementById('msgDiv').innerHTML = "initializing buffer ...";

    var bandObj;

    bandObj = new Object();
    bandObj.name = "A";
    bandObj.BW = 10;
//-----------------------------
// + Oct.26.2011
    bandObj.low = 0;
    bandObj.high= 2;
//-----------------------------
    bandArray[0] = bandObj;
    

    bandObj = new Object();
    bandObj.name = "B";
    bandObj.BW = 10;
//-----------------------------
// + Oct.26.2011
    bandObj.low = 0;
    bandObj.high= 4;
//-----------------------------
    bandArray[1] = bandObj;


    bandObj = new Object();    
    bandObj.name = "C";
    bandObj.BW = 5;
//-----------------------------
// + Oct.26.2011
    bandObj.low = 0;
    bandObj.high= 5;
//-----------------------------
    bandArray[2] = bandObj;


    bandObj = new Object();
    bandObj.name = "D";
    bandObj.BW = 5;
//-----------------------------
// + Oct.26.2011
    bandObj.low = 1;
    bandObj.high= 5;
//-----------------------------
    bandArray[3] = bandObj;


    bandObj = new Object();
    bandObj.name = "E";
    bandObj.BW = 5;
//-----------------------------
// + Oct.26.2011
    bandObj.low = 1;
    bandObj.high= 5;
//-----------------------------
    bandArray[4] = bandObj;


    bandObj = new Object();
    bandObj.name = "F";
    bandObj.BW = 10;
//-----------------------------
// + Oct.26.2011
    bandObj.low = 1;
    bandObj.high= 5;
//-----------------------------
    bandArray[5] = bandObj;


}

//==============================================================================
// function resetChkBox()
//==============================================================================
function resetChkBox() {
    for (i = 0; i < iBands; i++) {
        obj = document.getElementById(bandArray[i].name);
        if (obj){
           obj.disabled = "";
           obj.checked  = false;
        }
    }
}

//==============================================================================
// function dauSwsToggle - toggle checked box based on teh scope of the current
//  checked box
//==============================================================================
function dauSwsToggle(lwValue,hgValue) {

var obj;
// Debug
//alert(" -- within dauSwsToggle() -- low: "+lwValue+" - high: "+hgValue) ;

    for (i = 0; i < iBands; i++) {
        obj = document.getElementById(bandArray[i].name);
        
        if (obj){
// Debug
//alert(" -- i: "+i) ;
            //-------------------------------
            // Only take care the one currently available
            //-------------------------------
                if ((i >= lwValue) && (i <= hgValue))  {
                    obj.disabled = "";
                }  else {
                    obj.disabled = "disabled";
                }
        }

    }
    
}

//==============================================================================
// function dauChkSws - Id which box is checked
//==============================================================================
function dauChkSws() {

var l = 0;
var h = 0;

//alert(" -- dauChkSws ! ") ;
//search for the first selected band
    for (i = 0; i < iBands; i++) {
        frqElement = document.getElementById(bandArray[i].name);
        if (frqElement) {
            //--------------------------------
            // Obtain the min allowable range if new checked
            //--------------------------------
            if (frqElement.checked) {
// Debug
//alert(" band "+bandArray[i].name+" is checked !") ;
//----------------------------------------
// obtain the lowest range
//----------------------------------------
                if (l == 0){
                   l = bandArray[i].low ;
               }  else { 
                   if ( l < bandArray[i].low ){
                       l = bandArray[i].low ;
                   }
               }
//----------------------------------------
// obtain the highest range
//----------------------------------------
               if (h == 0){
                   h = bandArray[i].high ;
               }  else { 
                   if ( h > bandArray[i].high ){
                       l = bandArray[i].high ;
                   }
               }
            }  


        }
    }

//alert(" -- within dauChkSws - l:"+l+" - h:"+h);
//----------------------------------------
// toggle only the allowable range
//----------------------------------------
    if ((l >= 0) && ( h > 0)) {
        dauSwsToggle(l,h);
    } else {
        resetChkBox();    
    }
        

}

//==============================================================================
// Retrieve content from caller
//==============================================================================
function rxParam() {
   var deviceID   = 0;
   var l = location.href;
   var left = l.indexOf("?")+1;
   var tmpstg = l.substring(left);
   return tmpstg;
}


//==============================================================================
// function readData
// callee : fillParas()
//==============================================================================
function readData(dataSource) {
    document.getElementById('msgDiv').innerHTML = "Loading data from device...";

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
//alert(" -- within subBand.js - readData() - Ajax open channel - responseText : " + XMLHttpRequestObject.responseText);
                fillParas(XMLHttpRequestObject.responseText);
		}
        }

//+-----------------------------------------
//| create the oid array with npCmd setting 
//+-----------------------------------------
        var oidArray = new Array();
	oidArray[0] = 0x4d1;
		
        var sArray = new Array;
        var index = 0; //index for sArray
        for (i = 0; i < oidArray.length; i++) {
            var e = new Array(oidArray[i], band);
            sArray[index] = e;
            index++;
        }

//alert(" -- dump array of data send --\n");
//var msg = "";
//for(i=0;i<sArray.length;i++) { msg += sArray[i] + "\n"; }
//alert(msg);



        var data = JSON.stringify(sArray);
//+-----------------------------------------
//| rxParam() retrieves Device ID, StationID, Device Mode
//+-----------------------------------------
//        XMLHttpRequestObject.send('data=' + data + '&type=read' + '&sid=' + stationID + '&did=' + deviceID);
        XMLHttpRequestObject.send('data=' + data + '&type=read&' + rxParam());

//+-----------------------------------------
//| Clean up existing Check Boxes 
//+-----------------------------------------
        for (i = 0; i < iBands; i++) {
            document.getElementById(bandArray[i].name).checked = "";
        }
	
    }
}


//==============================================================================
// function writeData
// callee : rspDAUBSet()
//==============================================================================
function writeData(dataSource) {

// + Debug 29.sep.2011
//alert(" within writeData  ... ");

    var result = confirm("UL and DL will be disabled.");
    if (result) {
    
        document.getElementById('msgDiv').innerHTML = "Updating data to device...";

//+-------------------------------------------
//| Check Browser and Open Ajax channel 
//+-------------------------------------------
        var XMLHttpRequestObject = false;
        
        if (window.XMLHttpRequest) {
            XMLHttpRequestObject = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            XMLHttpRequestObject = new ActiveXObject("Microsoft.XMLHTTP");
        }
        
        if (XMLHttpRequestObject) {
        //+-------------------------------------------
        //|  if use async=false, do NOT write an onreadystatechange function - just put the code after the send() statement:
        //+-------------------------------------------
//          XMLHttpRequestObject.open("POST", dataSource);
            XMLHttpRequestObject.open("POST", dataSource, true);  //send the request synchronously 

	//+-----------------------------------------------------------------------------
	//| Return Message Block 
	//+-----------------------------------------------------------------------------
            XMLHttpRequestObject.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            XMLHttpRequestObject.onreadystatechange = function() {
                if (XMLHttpRequestObject.readyState == 4 &&
                    XMLHttpRequestObject.status == 200) {

// + Debug 29.sep.2011
//alert(" within writeData - Ajax open channel - responseText : " + XMLHttpRequestObject.responseText);
//                    fillParas(XMLHttpRequestObject.responseText, band);
	//+-----------------------------------------------------------------------------
        // In terms of write, if SET is ok, notify but no message update
	//+-----------------------------------------------------------------------------
                    rspDAUBSet(XMLHttpRequestObject.responseText);
                    
                }
            }

            //+-----------------------------------------------------------------
            //create the subband string
            //+-----------------------------------------------------------------
            var ssubBands = '';
            for (var i = 0; i < iBands; i++) {
                if (document.getElementById(bandArray[i].name).checked) {
                    ssubBands = ssubBands + '1';
                } else {
                    ssubBands = ssubBands + '0';
                }
// + Debug 29.sep.2011
//alert(" within writeData - selected subband: "+ssubBands);
//document.getElementById(bandArray[i].name).checked = ""; //clean up the selection

            }

            //create the oid array with npCmd setting
            var oidArray = new Array();
            oidArray[0] = 0x4d1;

            var sArray = new Array;
            var index = 0; //index for sArray
            for (var i = 0; i < oidArray.length; i++) {
                var e = new Array(oidArray[i], ssubBands, band);
                sArray[index] = e;
                index++;
            }

            var data = JSON.stringify(sArray);
            //----------------------------------------
            // Retrieve content from caller
            //----------------------------------------
// + Debug Oct.24.2011
//alert(" -- within subBandAWS.js - test - param from caller - "+rxParam()) ; 

// + Debug - to dump array
//var msg = " - SArray contents\n"; 
//for(i=0;i<sArray.length;i++) { msg += sArray[i] + "\n"; }
//alert(msg);  


//alert('test again:data=' + data + '&type=write' + '&sid=' + stationID + '&did=' + deviceID);
// + Oct.27.2011
//      XMLHttpRequestObject.send('data=' + data + '&type=write' + '&sid=' + stationID + '&did=' + deviceID);
        XMLHttpRequestObject.send('data=' + data + '&type=write' + '&' + rxParam());

        }
    }
}

//==============================================================================
//  function fillParas
//==============================================================================
function fillParas(responseText) {
    
// Debug + Oct.07.2011
//alert(" -- within fillParas - responseText :"+ responseText);
    var rData = JSON.parse(responseText);
    var targetID;
    var subBandString;
    var Obj;

    for (i = 0; i < rData.length; i++) {
        switch (rData[i]['OID']) {
            case 0x4d1:
                subBandString = rData[i]['Content'];
                break;
        }
    }

// Debug + Oct.07.2011
//alert("subBandString: " + subBandString);
    var iArray = subBandString.split("");
    
// Debug + Oct.07.2011
//alert("array length " + iArray.length);
//--------------------------------------------
// Return Msg may still collects 15 bands, AWS band only applies the first 6
//--------------------------------------------
//    for (var i = 0; i < iArray.length; i++) {
    for (var i = 0; i < iBands; i++) {
        Obj=document.getElementById(bandArray[i].name);
        if (Obj) {
//
            if (1 == iArray[i]) {
                Obj.checked = "checked";
            } else {
                Obj.checked = "";
            }
//
        }
    }

// Debug + Oct.07.2011
//alert(" calling dauChkSws ... ");
//    checkAvalible();
    dauChkSws();
	
    // mark the updating time
    var dt = new Date();
    document.getElementById('msgDiv').innerHTML = "Last Update: " + dt.toString();
}

//==============================================================================
// function rspDAUBSet simply Aknowledges, no return content for update 
// caller : writeData()
//==============================================================================
function rspDAUBSet(responseText) {
    
// Debug + Oct.07.2011
//alert(" -- within rspDAUBSet - responseText :"+ responseText);
	
	var rData = JSON.parse(responseText);
	var showTest, targetID, StgFlag ;
        var StgRpt = '';
	
// + Debug Oct.07.2011
//alert(" -- within rspDAUBSet -- rData.length : " + rData.length) ;
//alert(" -- OID is "+rData[0]['OID']);

        if (rData[0]['OID'] == 0x4d1  ) {
            subBandString = rData[0]['Content'];
// Debug + Oct.07.2011
//alert ("subBandString: " + subBandString);
                StgFlag= rData[0]['Content'].toString(16) ;                     // Content
                targetID = '0x' + rData[0]['OID'].toString(16);                 // Obj Id         
//showTest = document.getElementById(targetID);
//if (showTest) {
// flag obj is processed 
                 StgRpt = StgRpt + " ; field " + targetID + "-" + StgFlag + " " ;

//} else {
//StgRpt = StgRpt + " ; field " + targetID + " RX error ! " ;
//}
        }  else {
                targetID = '0x' + rData[0]['OID'].toString(16) 
                StgRpt = StgRpt + " ; ** " + targetID + " RX error ! " ;
        }
//---------------------------------
// notify user what the outcome
//---------------------------------
    // mark the updating time
    var dt = new Date();
    document.getElementById('msgDiv').innerHTML = " result" + StgRpt + " - last Update: " + dt.toString();

}


