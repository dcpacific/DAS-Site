var deviceMode = 'DRU_daulband';
var stationID = 0x12345678;
var deviceID = 0xc3;
var dauDeviceID = 0x0;
var dauULOutPower;
var dauDLInPower;
var druULInPower;
var druDLOutPower;

function readAllParas() {
//    readData('php/rwParas.php', 0);
//    setTimeout("readData('php/rwParas.php', 1)", 500);
//    setTimeout("readData('php/rwParas.php', 2)", 1500);
    readData('php/rwParas.php', 0);
    setInterval("readData('php/rwParas.php', 1)", 5000);
}

function verifyData(targetID) {
    ////    var oid = targetID.substr(0, targetID.length - 2); //targetID should be "0xoid_band"
    ////    var data = document.getElementById(targetID).value;
    ////    var reg = 
    ////    switch (oid) {
    ////        case '0x441':
    ////            if (data 
    ////            break;
    ////        default:
    ////    }
}

function fillParas(responseText, band) {
    //alert (responseText);
    var rData = JSON.parse(responseText);
    var showTest;
    var targetID;
    for (i = 0; i < rData.length; i++) {
        switch (rData[i]['OID']) {
            case 0x3ab:
                targetID = '0x3ab_' + rData[i]['npCmd'].toString();
                showTest = document.getElementById(targetID);
                if (showTest) {
                    if (checkAlarm(rData[i]['Content'], deviceMode, rData[i]['npCmd'])) {
                        showTest.innerHTML = "Error";
                        showTest.className = "hasAlarm";
                    } else {
                        showTest.innerHTML = "No Alarm";
                        showTest.className = "noAlarm";
                    }
                    showTest.href = "alarm.html?device=" + deviceMode + "&band=" + rData[i]['npCmd'] + "&alarm=" + rData[i]['Content'];
                } else {
                    alert("Data error:" + targetID);
                }
                break;
            case 0x402:
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
            case 0x503:
                druDLOutPower = parseFloat(rData[i]['Content']);  //DRU
                targetID = '0x' + rData[i]['OID'].toString(16) + '_' + rData[i]['npCmd'].toString();
                showTest = document.getElementById(targetID);
                if (showTest) {
                    showTest.value = rData[i]['Content'];
                } else {
                    alert("Data error:" + targetID);
                }
                break;
            case 0x5a7:
                if (dauDeviceID == rData[i]['did']) {
                    dauDLInPower = parseFloat(rData[i]['Content']);  //DAU
                } else {
                    druULInPower = parseFloat(rData[i]['Content']);  //DRU
                    targetID = '0x' + rData[i]['OID'].toString(16) + '_' + rData[i]['npCmd'].toString();
                    showTest = document.getElementById(targetID);
                    if (showTest) {
                        showTest.value = rData[i]['Content'];
                    } else {
                        alert("Data error:" + targetID);
                    }
                }
                break;
            case 0x5a8:
                if (dauDeviceID == rData[i]['did']) {
                    dauULOutPower = parseFloat(rData[i]['Content']);  //DAU
                }
                break;
            default:
                targetID = '0x' + rData[i]['OID'].toString(16) + '_' + rData[i]['npCmd'].toString();
                showTest = document.getElementById(targetID);
                if (showTest) {
                    showTest.value = rData[i]['Content'];
                } else {
                    alert("Data error:" + targetID);
                }
        }
    }

    // calculate the system DL/UL Gain
    if (0 != band) {
        //alert('druDLOutPower=' + druDLOutPower + 'dauDLInPower=' + dauDLInPower + '&dauULOutPower = ' + dauULOutPower + '&druULInPower=' + druULInPower);
        targetID = 'DLGain_' + band;
        document.getElementById(targetID).value = Math.round((druDLOutPower - dauDLInPower) * 100) / 100;
        targetID = 'ULGain_' + band;
        document.getElementById(targetID).value = Math.round((dauULOutPower - druULInPower) * 100) / 100;
    }

    // mark the updating time
    var dt = new Date();
    document.getElementById('msgDiv').innerHTML = "Last Update: " + dt.toString();
}

function readData(dataSource, band) {
    document.getElementById('msgDiv').innerHTML = "Loading data from device...";

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
                //alert(XMLHttpRequestObject.responseText);
                fillParas(XMLHttpRequestObject.responseText, band);
            }
        }

        //create the oid array with npCmd setting
        if (0 == band) {
            var oidArray = new Array(0x3ab, 0x5, 0xa, 0x4a0, 0x4a1);
        } else {
                                    //0x440, 0x440, 0x4a0, 0x4a1, 0x503, 0x501, 0x506
            //var oidArray = new Array(0x440, 0x440, 0x503, 0x501, 0x506, 0x450, 0x402, 0x4cd, 0x3ab);
            var oidArray = new Array(0x440, 0x440, 0x503, 0x5a7, 0x501, 0x506, 0x450, 0x402, 0x4cd, 0x3ab);
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
        //manually add "0x440"
        if (0 != band) {
            sArray[index] = new Array(0x440, (band * 2) - 1);
            sArray[index + 1] = new Array(0x440, band * 2);
        }

        var data = JSON.stringify(sArray);
        //alert('test again:data=' + data + '&type=read' + '&sid=' + sid + '&did=' + did);
        XMLHttpRequestObject.send('data=' + data + '&type=read' + '&sid=' + stationID + '&did=' + deviceID);

        for (i = 0; i < sArray.length; i++) {
            switch (sArray[i][0]) {
                case 0x3ab:
                    targetID = '0x' + sArray[i][0].toString(16) + '_' + sArray[i][1].toString(16);
                    showTest = document.getElementById(targetID);
                    if (showTest) {
                        showTest.innerHTML = 'Updating...';
                    } else {
                        alert("clean Error:" + targetID);
                    }
                    break;
                case 0x402:
                case 0x4cd:
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
                default:
                    targetID = '0x' + sArray[i][0].toString(16) + '_' + sArray[i][1].toString(16);
                    showTest = document.getElementById(targetID);
                    if (showTest) {
                        showTest.value = '';
                    } else {
                        alert("clean Error:" + targetID);
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

function writeData(dataSource, band) {
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
                //alert(XMLHttpRequestObject.responseText);
                fillParas(XMLHttpRequestObject.responseText, band);
            }
        }

        var oidArray = new Array(0x440, 0x450, 0x402, 0x4cd);
        //var oidArray = new Array(0x441, 0x453, 0x454);
        var sArray = new Array;
        var index = 0; //index for sArray
        for (i = 0; i < oidArray.length; i++) {
            switch (oidArray[i]) {
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
                case 0x402:
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
        XMLHttpRequestObject.send('data=' + data + '&type=write' + '&sid=' + stationID + '&did=' + deviceID);

    }
}

//////function readData(dataSource) {
//////    document.getElementById('msgDiv').innerHTML = "Loading data from device...";

//////    var XMLHttpRequestObject = false;
//////    if (window.XMLHttpRequest) {
//////        XMLHttpRequestObject = new XMLHttpRequest();
//////    } else if (window.ActiveXObject) {
//////        XMLHttpRequestObject = new ActiveXObject("Microsoft.XMLHTTP");
//////    }
//////    if (XMLHttpRequestObject) {
//////        XMLHttpRequestObject.open("POST", dataSource);
//////        XMLHttpRequestObject.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
//////        XMLHttpRequestObject.onreadystatechange = function() {
//////            if (XMLHttpRequestObject.readyState == 4 &&
//////              XMLHttpRequestObject.status == 200) {
//////                alert(XMLHttpRequestObject.responseText);
//////                var rData = JSON.parse(XMLHttpRequestObject.responseText);
//////                var showTest;
//////                var targetID;
//////                for (i = 0; i < rData.length; i++) {
//////                    if (null != rData[i]['OID']) {
//////                        targetID = '0x' + rData[i]['OID'].toString(16) + '_' + rData[i]['npCmd'].toString();
//////                        showTest = document.getElementById(targetID);
//////                        if (showTest) {
//////                            showTest.value = rData[i]['Content'];
//////                        } else {
//////                            alert("Error");
//////                        }
//////                    }
//////                }
//////                var dt = new Date();
//////                document.getElementById('msgDiv').innerHTML = "Last Update: " + dt.toString();
//////            }
//////        }

//////        //create the oid array with npCmd setting
//////        //            var oidArray = new Array(0x440, 0x441);
//////        //            var sArray = new Array;
//////        //            var npCmd = 1;
//////        //            for (i = 0; i < oidArray.length; i++) {
//////        //                var e = new Array(oidArray[i], npCmd);
//////        //                sArray[i] = e;
//////        //            }

//////        var oidArray = new Array(0x440, 0x440, 0x4a0, 0x4a1, 0x503, 0x501, 0x506); //
//////        var sArray = new Array;
//////        var npCmd = 1;
//////        var index = 0; //index for sArray
//////        for (i = 0; i < oidArray.length; i++) {
//////            if (0x440 != oidArray[i]) {
//////                var e = new Array(oidArray[i], npCmd);
//////                sArray[index] = e;
//////                index++;
//////            }
//////        }
//////        //manually add "0x440"
//////        sArray[index] = new Array(0x440, 1);
//////        sArray[index + 1] = new Array(0x440, 2);

//////        var data = JSON.stringify(sArray);
//////        alert(data);
//////        var sid = parseInt("0x12345678", 16);
//////        var did = parseInt("0xc3", 16);
//////        //alert('test again:data=' + data + '&type=read' + '&sid=' + sid + '&did=' + did);
//////        XMLHttpRequestObject.send('data=' + data + '&type=read' + '&sid=' + sid + '&did=' + did);

//////        for (i = 0; i < oidArray.length; i++) {
//////            targetID = '0x' + oidArray[i].toString(16) + '_1';
//////            showTest = document.getElementById(targetID);
//////            if (showTest) {
//////                showTest.value = '';
//////            } else {
//////                alert("clean Error");
//////            }
//////        }
//////        //alert("sent");
//////    }
//////}