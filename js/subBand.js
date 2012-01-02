var stationID = 0x12345678;
var deviceID;

var band = 3;                       
//-------------------------------------------
//max number of sub bands - 
//C1 & C2 obsolete
//-------------------------------------------
var iBands = 15;                    

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
//  deviceID = theRequest['device'];
//    deviceID = theRequest['did'];
    if (0 == deviceID) {
        document.getElementById('DeviceName').innerHTML = "DAU "+ " Frequency Setting";
    } else {
        document.getElementById('DeviceName').innerHTML = "DRU_" + deviceID + " Frequency Setting";
    }
    document.getElementById('DeviceName').innerHTML = " " + deviceID + " Frequency Setting";
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


 // Debug + Oct.14.2011    
 //   alert(" within  ** subBand.js ** GetRequest() ** -- calling creatBandArray() ") ; 
    creatBandArray();

 // Debug + Oct.14.2011    
 //   alert(" within  ** subBand.js ** GetRequest() ** -- calling readData() ") ; 

    //alert ("start reading.");
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
    bandObj.name = "A1";
    bandObj.BW = 5;
//-----------------------------
// + Oct.26.2011
    bandObj.low = 0;
    bandObj.high= 4;
//-----------------------------
    bandArray[0] = bandObj;
    

    bandObj = new Object();
    bandObj.name = "A2";
    bandObj.BW = 5;
//-----------------------------
// + Oct.26.2011
    bandObj.low = 0;
    bandObj.high= 5;
//-----------------------------
    bandArray[1] = bandObj;


    bandObj = new Object();    
    bandObj.name = "A3";
    bandObj.BW = 5;
//-----------------------------
// + Oct.26.2011
    bandObj.low = 0;
    bandObj.high= 6;
//-----------------------------
    bandArray[2] = bandObj;


    bandObj = new Object();
    bandObj.name = "D";
    bandObj.BW = 5;
//-----------------------------
// + Oct.26.2011
    bandObj.low = 0;
    bandObj.high= 7;
//-----------------------------
    bandArray[3] = bandObj;


    bandObj = new Object();
    bandObj.name = "B1";
    bandObj.BW = 5;
//-----------------------------
// + Oct.26.2011
    bandObj.low = 0;
    bandObj.high= 8;
//-----------------------------
    bandArray[4] = bandObj;


    bandObj = new Object();
    bandObj.name = "B2";
    bandObj.BW = 5;
//-----------------------------
// + Oct.26.2011
    bandObj.low = 1;
    bandObj.high= 11;
//-----------------------------
    bandArray[5] = bandObj;


    bandObj = new Object();
    bandObj.name = "B3";
    bandObj.BW = 5;
//-----------------------------
// + Oct.26.2011
    bandObj.low = 2;
    bandObj.high= 12;
//-----------------------------
    bandArray[6] = bandObj;


    bandObj = new Object();
    bandObj.name = "E";
    bandObj.BW = 5;
//-----------------------------
// + Oct.26.2011
    bandObj.low = 3;
    bandObj.high= 13;
//-----------------------------
    bandArray[7] = bandObj;

    bandObj = new Object();
    bandObj.name = "F";
    bandObj.BW = 5;
//-----------------------------
// + Oct.26.2011
    bandObj.low = 4;
    bandObj.high= 14;
//-----------------------------
    bandArray[8] = bandObj;

// not supported
    bandObj = new Object();
    bandObj.name = "C1";
    bandObj.BW = 7.5;
//-----------------------------
// + Oct.26.2011
    bandObj.low = 9;
    bandObj.high= 9;
//-----------------------------
    bandArray[9] = bandObj;
    
    
// not supported
    bandObj = new Object();
    bandObj.name = "C2";
    bandObj.BW = 7.5;
//-----------------------------
// + Oct.26.2011
    bandObj.low = 10;
    bandObj.high= 10;
//-----------------------------
    bandArray[10] = bandObj;


    bandObj = new Object();
    bandObj.name = "C3";
    bandObj.BW = 5;
//-----------------------------
// + Oct.26.2011
    bandObj.low = 5;
    bandObj.high= 14;
//-----------------------------
    bandArray[11] = bandObj;


    bandObj = new Object();
    bandObj.name = "C4";
    bandObj.BW = 5;
//-----------------------------
// + Oct.26.2011
    bandObj.low = 7;
    bandObj.high= 14;
//-----------------------------
    bandArray[12] = bandObj;


    bandObj = new Object();
    bandObj.name = "C5";
    bandObj.BW = 5;
//-----------------------------
// + Oct.26.2011
    bandObj.low = 8;
    bandObj.high= 14;
//-----------------------------
    bandArray[13] = bandObj;


    bandObj = new Object();
    bandObj.name = "G";
    bandObj.BW = 5;
//-----------------------------
// + Oct.26.2011
    bandObj.low = 8;
    bandObj.high= 14;
//-----------------------------
    bandArray[14] = bandObj;

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
// function checkAvalible
// callee : bandBeforeF(), bandInC()
//==============================================================================
function checkAvalible() {
    var frqElement;
    var startBand = endBand = -1;
    var i;
    
    //search for the first selected band
    for (i = 0; i < iBands; i++) {
        frqElement = document.getElementById(bandArray[i].name);
        if (frqElement.checked) {
            startBand = i;
// Debug
alert(" band "+bandArray[i].name+" is checked !") ;

            break;
        }
    }

    //search for the last selected band
    for (i = iBands - 1; i >= 0; i--) {
        frqElement = document.getElementById(bandArray[i].name);
        if (frqElement.checked) {
            endBand = i;
            break;
        }
    }
    //alert("startBand: " + startBand + "; endBand:" + endBand);

    if (-1 == endBand) {
        // nothing has been selected, enable all sub bands
        for (i = 0; i < iBands; i++) {
            document.getElementById(bandArray[i].name).disabled = "";
        }
    } else if (endBand < 9) {
        // selected bands all before "C*" section
        bandBeforeF(startBand, endBand);
    } else if ((8 < endBand) && (endBand < 14)) {
        // the last selected bands fall into "C*" section
        if ((11 == endBand) && (document.getElementById('C2').checked)) {
            bandInC(startBand, 10);
        } else {
            bandInC(startBand, endBand);
        }
    } else {
        // G has been select; disable all sub bands before "F"
        for (i = 0; i < 8; i++) {
            document.getElementById(bandArray[i].name).disabled = "disabled";
        }

    }

    // double check C1,C2 && C3,C4,C5 overlaping cases
////    for (i = 9; i < 14; i++) {
////        switch (bandArray[i].name) {
////            case 'C1':
////                // C1 overlap with C3 && C4
////                if (document.getElementById("C1").checked) {
////                    document.getElementById("C3").disabled = "disabled";
////                    document.getElementById("C4").disabled = "disabled";
////                } else {
////                    document.getElementById("C3").disabled = "";
////                    document.getElementById("C4").disabled = "";
////                }
////                break;
////            case 'C2':
////                // C2 overlap with C3 && C4
////                if (document.getElementById("C2").checked) {
////                    document.getElementById("C4").disabled = "disabled";
////                    document.getElementById("C5").disabled = "disabled";
////                } else {
////                    document.getElementById("C4").disabled = "";
////                    document.getElementById("C5").disabled = "";
////                }
////                break;
////            case 'C3':
////                // C3 overlap with C1
////                if (document.getElementById("C3").checked) {
////                    document.getElementById("C1").disabled = "disabled";
////                } else {
////                    document.getElementById("C1").disabled = "";
////                }
////                break;
////            case 'C4':
////                // C4 overlap with C1 && C2
////                if (document.getElementById("C4").checked) {
////                    document.getElementById("C1").disabled = "disabled";
////                    document.getElementById("C2").disabled = "disabled";
////                } else {
////                    document.getElementById("C1").disabled = "";
////                    document.getElementById("C2").disabled = "";
////                }
////                break;
////            case 'C5':
////                // C5 overlap with C2
////                if (document.getElementById("C5").checked) {
////                    document.getElementById("C2").disabled = "disabled";
////                } else {
////                    document.getElementById("C2").disabled = "";
////                }
////        }
////    }
}

//==============================================================================
// function bandInC
//==============================================================================
function bandInC(sBand, eBand) {
    // eBand in "C*" section
    var currentBW, possibleBW;
    var i;

    //alert("bandArray[eBand].name: " + bandArray[eBand].name + " && eBand: " + eBand);
    switch (bandArray[eBand].name) {
        case 'C1':
            // C1 overlap with C3 && C4
            document.getElementById("C3").disabled = "disabled";
            document.getElementById("C4").disabled = "disabled";

            currentBW = (eBand - sBand) * standBW + CBW;
            //alert("currentBW: " + currentBW);
            possibleBW = currentBW + standBW;
            //check the header of the selected bands
            for (i = sBand - 1; i >= 0; i--) {
                if (possibleBW > maxBW) {
                    document.getElementById(bandArray[i].name).disabled = "disabled";
                } else {
                    document.getElementById(bandArray[i].name).disabled = "";
                }
                possibleBW += standBW;
            }

            // check the tail of the selected bands
            if ((currentBW + CBW) > maxBW) {
                document.getElementById("C2").disabled = "disabled";
                document.getElementById("C5").disabled = "disabled";
                document.getElementById("G").disabled = "disabled";
            } else {
                document.getElementById("C2").disabled = "";
                document.getElementById("C5").disabled = "";
                if ((currentBW + CBW + standBW) > maxBW) {
                    document.getElementById("G").disabled = "disabled";
                } else {
                    document.getElementById("G").disabled = "";
                }
            }
            break;
        case 'C2':
            // C2 overlap with C4 && C5
            document.getElementById("C4").disabled = "disabled";
            document.getElementById("C5").disabled = "disabled";

            if (sBand < 9) {                                    // sBand before C1
                currentBW = (eBand - sBand - 1) * standBW + 2 * CBW;
            } else if (document.getElementById("C3").checked) { // sBand==C2; eBand==C3
                currentBW = 3 * standBW;
            } else {
                currentBW = (eBand - sBand + 1) * CBW;          // sBand is C1 or C2
            }
            //alert("currentBW: " + currentBW);
            if (eBand == sBand) {
                possibleBW = currentBW + CBW;
            } else {
                possibleBW = currentBW + standBW;
            }
            //check the header of the selected bands
            for (i = sBand - 1; i >= 0; i--) {
                if (possibleBW > maxBW) {
                    document.getElementById(bandArray[i].name).disabled = "disabled";
                    if ('C1' == bandArray[i].name) {
                        document.getElementById("C3").disabled = "disabled";
                        document.getElementById("C4").disabled = "disabled";
                    }
                } else {
                    document.getElementById(bandArray[i].name).disabled = "";
                    if ('C1' == bandArray[i].name) {
                        document.getElementById("C3").disabled = "";
                    }
                }
                possibleBW += standBW;
            }

            // check the tail of the selected bands
            if ((currentBW + standBW) > maxBW) {
                document.getElementById("G").disabled = "disabled";
            } else {
                document.getElementById("G").disabled = "";
            }

            // C3 will be counted as the tail of the C2 when it has been selected
            if (document.getElementById('C3').checked) {
                document.getElementById('C1').disabled = "disabled";
            } else {
                document.getElementById('C1').disabled = "";
            }
            break;
        case 'C3':
            // C3 overlap with C1
            document.getElementById("C1").disabled = "disabled";

            if (sBand == eBand) {
                currentBW = standBW;
            //} else if (10 == sBand) {
            // will not happen, it will switch to eBand == C2
            } else {
                currentBW = (8 - sBand + 1) * standBW + standBW; // currentBW = number of bands from F + C3
            }
            
            //alert("currentBW: " + currentBW);
            //check the header of the selected bands
            possibleBW = currentBW + standBW;           // check from "F"
            for (i = 8; i >= 0; i--) {
                if (i < sBand) {
                    if (possibleBW > maxBW) {
                        document.getElementById(bandArray[i].name).disabled = "disabled";
                    } else {
                        document.getElementById(bandArray[i].name).disabled = "";
                    }
                    possibleBW += standBW;
                }
            }
            //alert("currentBW: " + currentBW);
            
            // check the tail of the selected bands
            // do not need to consider the C2 has been selected case, it will switch to "eBand == C2" case
            possibleBW = currentBW + standBW;
            //alert("possibleBW: " + possibleBW);
            if (possibleBW > maxBW) {                               // check from C4
                document.getElementById("C4").disabled = "disabled";
                document.getElementById("C5").disabled = "disabled";
                document.getElementById("C2").disabled = "disabled";
                document.getElementById("G").disabled = "disabled";
            } else {
                document.getElementById("C4").disabled = "";        //C4 is avalible
                if ((possibleBW + standBW) > maxBW) {               //check from C5
                    document.getElementById("C5").disabled = "disabled";
                    document.getElementById("C2").disabled = "disabled";
                    document.getElementById("G").disabled = "disabled";
                } else {                                            //C5 is avalible
                    document.getElementById("C5").disabled = "";
                    document.getElementById("C2").disabled = "";    //check for G
                    if ((possibleBW + 2 * standBW) > maxBW) {
                        document.getElementById("G").disabled = "disabled";
                    } else {
                        document.getElementById("G").disabled = "";
                    }
                }
            }
            break;
        case 'C4':
            // C4 overlap with C1 && C2
            document.getElementById("C1").disabled = "disabled";
            document.getElementById("C2").disabled = "disabled";

            if (sBand == eBand) {
                currentBW = standBW;
            } else if (11 == sBand) {           // sBand is C3
                currentBW = 2 * standBW;
            } else {
                currentBW = ((8 - sBand + 1) * standBW) + (2 * standBW); // currentBW = number of bands from F + C3 + C4
            }
            //alert("currentBW: " + currentBW);
            // check the header of the selected bands
            if (sBand == eBand) {
                document.getElementById("C3").disabled = "";
                possibleBW = currentBW + 2 * standBW;   //we will check from "F"
            } else {
                possibleBW = currentBW + standBW;
            }

            for (i = 8; i >= 0; i--) {                  // check from "F"
                if (i < sBand) {
                    //alert("possibleBW: " + possibleBW);
                    if (possibleBW > maxBW) {
                        document.getElementById(bandArray[i].name).disabled = "disabled";
                    } else {
                        document.getElementById(bandArray[i].name).disabled = "";
                    }
                    possibleBW += standBW;
                }
            }

            // check the tail of the selected bands
            if ((currentBW + standBW) > maxBW) {
                document.getElementById("C5").disabled = "disabled";
                document.getElementById("G").disabled = "disabled";
            } else {
                document.getElementById("C5").disabled = "";
                if ((currentBW + 2 * standBW) > maxBW) {
                    document.getElementById("G").disabled = "disabled";
                } else {
                    document.getElementById("G").disabled = "";
                }
            }
            break;
        case 'C5':
            // C5 overlap with C2
            document.getElementById("C2").disabled = "disabled";

            if (sBand == eBand) {
                currentBW = standBW;
            } else if ((11 == sBand) || (12 == sBand)) {             // sBand is C3 or C4
                currentBW = (eBand - sBand) * standBW;
            } else if (9 == sBand) {             // sBand is C3
                currentBW = 2 * CBW;
            } else {
                currentBW = ((sBand - 8 + 1) * standBW) + (2 * standBW); // currentBW = number of bands from F + C3 + C4 + C5
            }

            // check the header of the selected bands
            if (sBand == eBand) {
                document.getElementById("C4").disabled = "";
                document.getElementById("C3").disabled = "";
                document.getElementById("C1").disabled = "";
                possibleBW = currentBW + 3 * standBW;
            } else if (12 == sBand) {                                   // sBand is C4
                document.getElementById("C3").disabled = "";
                document.getElementById("C1").disabled = "disabled";
                possibleBW = currentBW + 2 * standBW;
            } else if (11 == sBand) {                                   // sBand is C3
                document.getElementById("C1").disabled = "disabled";
                possibleBW = currentBW + standBW;
            }
            //alert("possibleBW: " + possibleBW);
            for (i = 8; i >= 0; i--) {                                  // check from "F"
                if (i < sBand) {
                    if (possibleBW > maxBW) {
                        document.getElementById(bandArray[i].name).disabled = "disabled";
                    } else {
                        document.getElementById(bandArray[i].name).disabled = "";
                    }
                    possibleBW += standBW;
                }
            }

            // check the tail of the selected bands
            if ((currentBW + standBW) > maxBW) {
                document.getElementById("G").disabled = "disabled";
            }

            break;
    }
}

//==============================================================================
// function bandBeforeF
//==============================================================================
function bandBeforeF(startBand, endBand) {
    // endband before "C1"
    var currentBW = (endBand - startBand + 1) * standBW;

    var possibleBW = currentBW;
    for (i = startBand - 1; i >= 0; i--) {
        possibleBW += standBW;
        frqElement = document.getElementById(bandArray[i].name);
        if (possibleBW > maxBW) {
            frqElement.disabled = "disabled";
        } else {
            frqElement.disabled = "";
        }
    }

    possibleBW = currentBW;
    for (i = endBand + 1; i < iBands; i++) {
        if ((i < 9) || (13 < i)) {  
            possibleBW += standBW;
            frqElement = document.getElementById(bandArray[i].name);
            if (possibleBW > maxBW) {
                frqElement.disabled = "disabled";
            } else {
                frqElement.disabled = "";
            }
        } else {
            switch (bandArray[i].name) {
                case 'C1':     //C1 overlap with C3 && C4
                    //alert("possibleBW:" + possibleBW + "  bandArray[i].name:" + bandArray[i].name);
                    possibleBW += bandArray[i].BW;
                    frqElement = document.getElementById(bandArray[i].name);
                    //alert("C1 possibleBW:" + possibleBW);
                    if (possibleBW > maxBW) {
                        frqElement.disabled = "disabled";
                        if ((possibleBW - bandArray[i].BW + standBW) > maxBW) {
                            document.getElementById("C3").disabled = "disabled";
                        } else {
                            document.getElementById("C3").disabled = "";
                        }
                        document.getElementById("C4").disabled = "disabled";
                    } else {
                        frqElement.disabled = "";
                        document.getElementById("C3").disabled = "";
                        document.getElementById("C4").disabled = "";
                    }
                    break;
                case 'C2':    //C2 overlap with C4 && C5
                    possibleBW += bandArray[i].BW;
                    frqElement = document.getElementById(bandArray[i].name);
                    //alert("C2 possibleBW:" + possibleBW);
                    if (possibleBW > maxBW) {
                        frqElement.disabled = "disabled";
                        // possibleBW - C2.BW - C1.BW + C3.BW + C4.BW
                        if ((possibleBW - 2 * CBW + 2 * standBW) > maxBW) {
                            document.getElementById("C4").disabled = "disabled";
                        } else {
                            document.getElementById("C4").disabled = "";
                        }
                        document.getElementById("C5").disabled = "disabled";
                    } else {
                        frqElement.disabled = "";
                        document.getElementById("C4").disabled = "";
                        document.getElementById("C5").disabled = "";
                    }
                    break;
                default:
                    break;
            }
        }
    }
}


//==============================================================================
// function readData
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

        var data = JSON.stringify(sArray);

//+-----------------------------------------
//| rxParam() retrieves Device ID, StationID, Device Mode
//+-----------------------------------------
        XMLHttpRequestObject.send('data=' + data + '&type=read&' + rxParam());

//+-----------------------------------------
//| Clean up existing Check Boxes 
//+-----------------------------------------
        for (i = 0; i < iBands; i++) {
            document.getElementById(bandArray[i].name).checked = "";
        }
	
    }
}

//+-----------------------------------------
// function writeData
//+-----------------------------------------
function writeData(dataSource) {

    var Obj;
    var result = confirm("UL and DL will be disabled.");
    if (result) {
    
        document.getElementById('msgDiv').innerHTML = "Updating data to device...";

        var XMLHttpRequestObject = false;
        if (window.XMLHttpRequest) {
            XMLHttpRequestObject = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            XMLHttpRequestObject = new ActiveXObject("Microsoft.XMLHTTP");
        }
        if (XMLHttpRequestObject) {
            XMLHttpRequestObject.open("POST", dataSource);
            XMLHttpRequestObject.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            XMLHttpRequestObject.onreadystatechange = function() {
                if (XMLHttpRequestObject.readyState == 4 &&
                    XMLHttpRequestObject.status == 200) {
                    
// + Debug 29.sep.2011
//alert(" within writeData - Ajax open channel - responseText : " + XMLHttpRequestObject.responseText);
	//+-----------------------------------------------------------------------------
        // In terms of write, if SET is ok, notify but no message update
	//+-----------------------------------------------------------------------------
                    rspDAUBSet(XMLHttpRequestObject.responseText);
                }
            }

            //create the subband string
            var ssubBands = '';
            for (var i = 0; i < iBands; i++) {
                Obj = document.getElementById(bandArray[i].name);
                if (Obj) {
//
                    if (Obj.checked) {
                        ssubBands = ssubBands + '1';
                    } else {
                        ssubBands = ssubBands + '0';
                    }
//
                }
//                document.getElementById(bandArray[i].name).checked = ""; //clean up the selection
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
            
// + Debug - to dump array
//var msg = " - SArray contents\n"; 
//for(i=0;i<sArray.length;i++) { msg += sArray[i] + "\n"; }
//alert(msg);  
            
//            XMLHttpRequestObject.send('data=' + data + '&type=write' + '&sid=' + stationID + '&did=' + deviceID);
            XMLHttpRequestObject.send('data=' + data + '&type=write' + '&' + rxParam());
        
        }
    }
}

//+-----------------------------------------
//  function fillParas
//+-----------------------------------------
function fillParas(responseText) {
//alert (responseText);
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

//alert ("subBandString: " + subBandString);
    var iArray = subBandString.split("");

    for (var i = 0; i < iArray.length; i++) {
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

//+ Oct.07.2011
//alert(" -- calling dauChkSws ... ");
//	checkAvalible();
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
