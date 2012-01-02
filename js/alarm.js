
//==============================================================================
// function GetRequest
//==============================================================================
function GetRequest() {
    //alert(location.href);
    var url = location.href;
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(url.indexOf("?")+1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }
//    alert(theRequest['device']);
//    alert(theRequest['band']);
//    alert(theRequest['alarm']);
    switch (theRequest['device']) {
        case 'DAU_quadband':
        case 'DRU_quadband':
        case 'DAU_dualband':
//            showDAUDAlarm(theRequest['alarm'], theRequest['band']);
//            break;
        case 'DRU_dualband':
//            showDRUDAlarm(theRequest['alarm'], theRequest['band']);
            showAlarm(theRequest['alarm'], theRequest['band'], theRequest['device']);
            break;
        default:
            alert('Error for reading alarm information!');
    }
}

//==============================================================================
// function fillAlarmOnPage
//    caller: fillParas()
//==============================================================================
function fillAlarmOnPage(alarmString, dMode) {
    var targetID, showTest;

    var bandNum;
    if ('DAU_dualband' == dMode) {
        bandNum = 2;
    } else {
        bandNum = 4;
    }
// + Debug Oct.14.2011
//alert(" -- within fillAlarmOnPage -- bandNum: "+bandNum);	   

 //  + Bug fix Oct.14.2011   
 //   for (var iBand = 0; iBand <= bandNum; iBand++) {
   for (var iBand = 0; iBand<bandNum; iBand++) {

        targetID = '0x3ab_' + iBand;

// + Debug Oct.14.2011
//alert(" -- within fillAlarmOnPage -- targetID: "+targetID);	   
	   
        showTest = document.getElementById(targetID);
        if (showTest) {
            if (checkAlarm(alarmString['Content'], dMode, iBand)) {
                showTest.innerHTML = "________";
                showTest.className = "hasAlarm";
            } else {
                showTest.innerHTML = "________";
                showTest.className = "noAlarm";
            }
            showTest.href = "alarm.html?device=" + dMode + "&band=" + iBand + "&alarm=" + alarmString['Content'];
        } else {
            alert(" -- within fillAlarmOnPage -- Data error:" + targetID);
        }
    }
}

//==============================================================================
// function showAlarm
//==============================================================================
function showAlarm(alarmString, band, device) {
    var iArray = alarmString.split("");

    var hasAlarm = "Alarm on:<ul>";
    var noAlarm = "No Alarm:<ul>";

    for (var i = 0; i < iArray.length; i++) {
        switch (i) {
            case 0:
                if (1 == band && 'DRU_dualband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>PA Fwd Power</li>";
                    } else {
                        noAlarm += "<li>PA Fwd Power</li>";
                    }
                } else if (1 == band && (('DAU_quadband' == device) || ('DRU_quadband' == device))) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>DNC Lock Detect</li>";
                    } else {
                        noAlarm += "<li>DNC Lock Detect</li>";
                    }
                }
                break;
            case 1:
                if (1 == band && 'DRU_dualband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>PA VSWR</li>";
                    } else {
                        noAlarm += "<li>PA VSWR</li>";
                    }
                } else if (1 == band && (('DAU_quadband' == device) || ('DRU_quadband' == device))) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>PLL Lock Detect</li>";
                    } else {
                        noAlarm += "<li>PLL Lock Detect</li>";
                    }
                }
                break;
            case 2:
                if (1 == band && 'DRU_dualband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>PA Temperature</li>";
                    } else {
                        noAlarm += "<li>PA Temperature</li>";
                    }
                } else if (1 == band && 'DAU_quadband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>DL Input Power Low</li>";
                    } else {
                        noAlarm += "<li>DL Input Power Low</li>";
                    }
                } else if (1 == band && 'DRU_quadband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>UL Input Power Low</li>";
                    } else {
                        noAlarm += "<li>UL Input Power Low</li>";
                    }
                }
                break;
            case 3:
                if (1 == band && 'DRU_dualband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>PA Low Gain</li>";
                    } else {
                        noAlarm += "<li>PA Low Gain</li>";
                    }
                } else if (1 == band && 'DAU_quadband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>DL Input Power High</li>";
                    } else {
                        noAlarm += "<li>DL Input Power High</li>";
                    }
                } else if (1 == band && 'DRU_quadband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>UL Input Power High</li>";
                    } else {
                        noAlarm += "<li>UL Input Power High</li>";
                    }
                }
                break;
            case 4:
                if (1 == band && 'DRU_dualband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>PA Shutdown</li>";
                    } else {
                        noAlarm += "<li>PA Shutdown</li>";
                    }
                } else if (1 == band && 'DRU_quadband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>DL Input Power Low</li>";
                    } else {
                        noAlarm += "<li>DL Input Power Low</li>";
                    }
                }
                break;
            case 5:
                if (2 == band && 'DRU_dualband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>PA Fwd Power</li>";
                    } else {
                        noAlarm += "<li>PA Fwd Power</li>";
                    }
                } else if (1 == band && (('DAU_quadband' == device) || ('DRU_quadband' == device))) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>RF DL ShutDown</li>";
                    } else {
                        noAlarm += "<li>RF DL ShutDown</li>";
                    }
                }
                break;
            case 6:
                if (2 == band && 'DRU_dualband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>PA VSWR</li>";
                    } else {
                        noAlarm += "<li>PA VSWR</li>";
                    }
                } else if (1 == band && (('DAU_quadband' == device) || ('DRU_quadband' == device))) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>RF UL ShutDown</li>";
                    } else {
                        noAlarm += "<li>RF UL ShutDown</li>";
                    }
                }
                break;
            case 7:
                if (2 == band && 'DRU_dualband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>PA Temperature</li>";
                    } else {
                        noAlarm += "<li>PA Temperature</li>";
                    }
                } else if (2 == band && (('DAU_quadband' == device) || ('DRU_quadband' == device))) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>DNC Lock Detect</li>";
                    } else {
                        noAlarm += "<li>DNC Lock Detect</li>";
                    }
                }
                break;
            case 8:
                if (2 == band && 'DRU_dualband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>PA Low Gain</li>";
                    } else {
                        noAlarm += "<li>PA Low Gain</li>";
                    }
                } else if (2 == band && (('DAU_quadband' == device) || ('DRU_quadband' == device))) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>PLL Lock Detect</li>";
                    } else {
                        noAlarm += "<li>PLL Lock Detect</li>";
                    }
                }
                break;
            case 9:
                if (2 == band && 'DRU_dualband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>PA Shutdown</li>";
                    } else {
                        noAlarm += "<li>PA Shutdown</li>";
                    }
                } else if (2 == band && 'DAU_quadband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>DL Input Power Low</li>";
                    } else {
                        noAlarm += "<li>DL Input Power Low</li>";
                    }
                } else if (2 == band && 'DRU_quadband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>UL Input Power Low</li>";
                    } else {
                        noAlarm += "<li>UL Input Power Low</li>";
                    }
                }
                break;
            case 10:
                if (1 == band && ('DRU_dualband' == device || 'DAU_dualband' == device)) {
                    if ('1' == iArray[i]) {
                        hasAlarm += "<li>DNC Lock Detect</li>";
                    } else {
                        noAlarm += "<li>DNC Lock Detect</li>";
                    }
                } else if (2 == band && 'DAU_quadband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>DL Input Power High</li>";
                    } else {
                        noAlarm += "<li>DL Input Power High</li>";
                    }
                } else if (2 == band && 'DRU_quadband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>UL Input Power High</li>";
                    } else {
                        noAlarm += "<li>UL Input Power High</li>";
                    }
                }
                break;
            case 11:
                if (1 == band && 'DRU_dualband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>LNA Alarm</li>";
                    } else {
                        noAlarm += "<li>LNA Alarm</li>";
                    }
                } else if (2 == band && 'DRU_quadband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>DL Input Power Low</li>";
                    } else {
                        noAlarm += "<li>DL Input Power Low</li>";
                    }
                }
                break;
            case 12:
                if (1 == band && ('DRU_dualband' == device || 'DAU_dualband' == device)) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>PLL Lock Detect</li>";
                    } else {
                        noAlarm += "<li>PLL Lock Detect</li>";
                    }
                } else if (2 == band && (('DAU_quadband' == device) || ('DRU_quadband' == device))) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>RF DL ShutDown</li>";
                    } else {
                        noAlarm += "<li>RF DL ShutDown</li>";
                    }
                }
                break;
            case 13:
                if (1 == band) {
                    if ('DAU_dualband' == device) {
                        if (1 == iArray[i]) {
                            hasAlarm += "<li>DL Input Power Low</li>";
                        } else {
                            noAlarm += "<li>DL Input Power Low</li>";
                        }
                    } else if ('DRU_dualband' == device) {
                        if (1 == iArray[i]) {
                            hasAlarm += "<li>UL Input Power Low</li>";
                        } else {
                            noAlarm += "<li>UL Input Power Low</li>";
                        }
                    }
                } else if (2 == band && (('DAU_quadband' == device) || ('DRU_quadband' == device))) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>RF UL ShutDown</li>";
                    } else {
                        noAlarm += "<li>RF UL ShutDown</li>";
                    }
                }
                break;
            case 14:
                if (1 == band) {
                    if ('DAU_dualband' == device) {
                        if (1 == iArray[i]) {
                            hasAlarm += "<li>DL Input Power High</li>";
                        } else {
                            noAlarm += "<li>DL Input Power High</li>";
                        }
                    } else if ('DRU_dualband' == device) {
                        if (1 == iArray[i]) {
                            hasAlarm += "<li>UL Input Power High</li>";
                        } else {
                            noAlarm += "<li>UL Input Power High</li>";
                        }
                    }
                } else if (3 == band && (('DAU_quadband' == device) || ('DRU_quadband' == device))) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>DNC Lock Detect</li>";
                    } else {
                        noAlarm += "<li>DNC Lock Detect</li>";
                    }
                }
                break;
            case 15:
                if (3 == band && (('DAU_quadband' == device) || ('DRU_quadband' == device))) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>PLL Lock Detect</li>";
                    } else {
                        noAlarm += "<li>PLL Lock Detect</li>";
                    }
                }
                break;
            case 16:
                if (3 == band && 'DRU_quadband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>UL Input Power Low</li>";
                    } else {
                        noAlarm += "<li>UL Input Power Low</li>";
                    }
                }
                break;
            case 17:
                if (2 == band && ('DRU_dualband' == device || 'DAU_dualband' == device)) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>DNC Lock Detect</li>";
                    } else {
                        noAlarm += "<li>DNC Lock Detect</li>";
                    }
                } else if (3 == band && 'DAU_quadband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>DL Input Power High</li>";
                    } else {
                        noAlarm += "<li>DL Input Power High</li>";
                    }
                } else if (3 == band && 'DRU_quadband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>UL Input Power High</li>";
                    } else {
                        noAlarm += "<li>UL Input Power High</li>";
                    }
                }
                break;
            case 18:
                if (2 == band && 'DRU_dualband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>LNA Alarm</li>";
                    } else {
                        noAlarm += "<li>LNA Alarm</li>";
                    }
                } else if (3 == band && 'DRU_quadband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>DL Input Power Low</li>";
                    } else {
                        noAlarm += "<li>DL Input Power Low</li>";
                    }
                }
                break;
            case 19:
                if (2 == band && ('DRU_dualband' == device || 'DAU_dualband' == device)) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>PLL Lock Detect</li>";
                    } else {
                        noAlarm += "<li>PLL Lock Detect</li>";
                    }
                } else if (3 == band && (('DAU_quadband' == device) || ('DRU_quadband' == device))) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>RF DL ShutDown</li>";
                    } else {
                        noAlarm += "<li>RF DL ShutDown</li>";
                    }
                }
                break;
            case 20:
                if (2 == band) {
                    if ('DAU_dualband' == device) {
                        if (1 == iArray[i]) {
                            hasAlarm += "<li>DL Input Power Low</li>";
                        } else {
                            noAlarm += "<li>DL Input Power Low</li>";
                        }
                    } else if ('DRU_dualband' == device) {
                        if (1 == iArray[i]) {
                            hasAlarm += "<li>UL Input Power Low</li>";
                        } else {
                            noAlarm += "<li>UL Input Power Low</li>";
                        }
                    }
                } else if (3 == band && (('DAU_quadband' == device) || ('DRU_quadband' == device))) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>RF UL ShutDown</li>";
                    } else {
                        noAlarm += "<li>RF UL ShutDown</li>";
                    }
                }
                break;
            case 21:
                if (2 == band) {
                    if ('DAU_dualband' == device) {
                        if (1 == iArray[i]) {
                            hasAlarm += "<li>DL Input Power High</li>";
                        } else {
                            noAlarm += "<li>DL Input Power High</li>";
                        }
                    } else if ('DRU_dualband' == device) {
                        if (1 == iArray[i]) {
                            hasAlarm += "<li>UL Input Power High</li>";
                        } else {
                            noAlarm += "<li>UL Input Power High</li>";
                        }
                    }
                } else if (4 == band && (('DAU_quadband' == device) || ('DRU_quadband' == device))) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>DNC Lock Detect</li>";
                    } else {
                        noAlarm += "<li>DNC Lock Detect</li>";
                    }
                }
                break;
            case 22:
                if (4 == band && (('DAU_quadband' == device) || ('DRU_quadband' == device))) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>PLL Lock Detect</li>";
                    } else {
                        noAlarm += "<li>PLL Lock Detect</li>";
                    }
                }
                break;
            case 23:
                if (4 == band && 'DAU_quadband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>DL Input Power Low</li>";
                    } else {
                    noAlarm += "<li>DL Input Power Low</li>";
                    }
                } else if (4 == band && 'DRU_quadband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>UL Input Power Low</li>";
                    } else {
                        noAlarm += "<li>UL Input Power Low</li>";
                    }
                }
                break;
            case 24:
                if (4 == band && 'DAU_quadband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>DL Input Power High</li>";
                    } else {
                        noAlarm += "<li>DL Input Power High</li>";
                    }
                } else if (4 == band && 'DRU_quadband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>UL Input Power High</li>";
                    } else {
                        noAlarm += "<li>UL Input Power High</li>";
                    }
                }
                break;
            case 25:
                if (4 == band && 'DRU_quadband' == device) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>DL Input Power Low</li>";
                    } else {
                        noAlarm += "<li>DL Input Power Low</li>";
                    }
                }
                break;
            case 26:
                if (4 == band && (('DAU_quadband' == device) || ('DRU_quadband' == device))) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>RF DL ShutDown</li>";
                    } else {
                        noAlarm += "<li>RF DL ShutDown</li>";
                    }
                }
                break;
            case 27:
                if (4 == band && (('DAU_quadband' == device) || ('DRU_quadband' == device))) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>RF UL ShutDown</li>";
                    } else {
                        noAlarm += "<li>RF UL ShutDown</li>";
                    }
                }
                break;
            case 28:
                if (0 == band) {
                    if (0 < iArray[i]) {
                        hasAlarm += "<li>Optical Alarm</li>";
                    } else {
                        noAlarm += "<li>Optical Alarm</li>";
                    }
                }
                break;
            case 29:
                if (0 == band && (('DAU_dualband' == device) || ('DAU_quadband' == device))) {
                    if (1 == iArray[i]) {
                        hasAlarm += "<li>Communication</li>";
                    } else {
                        noAlarm += "<li>Communication</li>";
                    }
                }
                break;
            case 30:
                if (0 == band && (('DAU_dualband' == device) || ('DAU_quadband' == device))) {
                    //alert('iArray: ' + iArray[i]);
                    if (1 == iArray[i]) {
                        //alert('IN band: ' + band + 'device:  ' + device);
                        hasAlarm += "<li>Power Fail</li>";
                    } else {
                        noAlarm += "<li>Power Fail</li>";
                    }
                }
                break;
            case 31:
                break;


        }
    }

    var obj = document.getElementById('msgDiv');
    obj.innerHTML = hasAlarm + "</ul><ul>";
    obj.innerHTML += noAlarm + "</ul>";

}

////function checkAlarm(alarmString, deviceMd, band) {
////    if (('DAU_dualband' == deviceMode) || ('DRU_dualband' == deviceMode)) {
////        return checkDualAlarm(alarmString, deviceMd, band);
////    } else {

////    }
////}

//==============================================================================
// function checkAlarm
//==============================================================================
function checkAlarm(alarmString, deviceMd, band) {
    var iArray = alarmString.split("");
    //alert(deviceMd);

    var ifAlarm = false;
    for (var i = 0; i < iArray.length; i++) {
        if (0 < iArray[i]) {
            switch (i) {
                case 0:
                    if ((1 == band) && ('DAU_dualband' != deviceMd)) {
                        ifAlarm = true;
                    }
                    break;
                case 1:
                    if ((1 == band) && ('DAU_dualband' != deviceMd)) {
                        ifAlarm = true;
                    }
                    break;
                case 2:
                    if ((1 == band) && ('DAU_dualband' != deviceMd)) {
                        ifAlarm = true;
                    }
                    break;
                case 3:
                    if ((1 == band) && ('DAU_dualband' != deviceMd)) {
                        ifAlarm = true;
                    }
                    break;
                case 4:
                    if ((1 == band) && (('DRU_dualband' == deviceMd) || ('DRU_quadband' == deviceMd))) {
                        ifAlarm = true;
                    }
                    break;
                case 5:
                    if ((1 == band)) {
                        ifAlarm = true;
                    }
                    if ((2 == band) && ('DRU_dualband' == deviceMd)) {
                        ifAlarm = true;
                    }
                    break;
                case 6:
                    if ((1 == band)) {
                        ifAlarm = true;
                    }
                    if ((2 == band) && ('DRU_dualband' == deviceMd)) {
                        ifAlarm = true;
                    }
                    break;
                case 7:
                    if ((2 == band) && ('DAU_dualband' != deviceMd)) {
                        ifAlarm = true;
                    }
                    break;
                case 8:
                    if ((2 == band) && ('DAU_dualband' != deviceMd)) {
                        ifAlarm = true;
                    }
                    break;
                case 9:
                    if ((2 == band) && ('DAU_dualband' != deviceMd)) {
                        ifAlarm = true;
                    }
                    break;
                case 10:
                    ifAlarm = true;
                    break;
                case 11:
                    if ((1 == band) && ('DRU_dualband' == deviceMd)) {
                        ifAlarm = true;
                    }
                    if ((2 == band) && ('DRU_quadband' == deviceMd)) {
                        ifAlarm = true;
                    }
                    break;
                case 12:
                case 13:
                    if ((1 == band) && (('DAU_dualband' == deviceMd) || ('DRU_dualband' == deviceMd))) {
                        ifAlarm = true;
                    }
                    if ((2 == band) && (('DAU_quadband' == deviceMd) || ('DRU_quadband' == deviceMd))) {
                        ifAlarm = true;
                    }
                    break;
                case 14:
                    if ((1 == band) && (('DAU_dualband' == deviceMd) || ('DRU_dualband' == deviceMd))) {
                        ifAlarm = true;
                    }
                    if ((3 == band) && (('DAU_quadband' == deviceMd) || ('DRU_quadband' == deviceMd))) {
                        ifAlarm = true;
                    }
                    break;
                case 15:
                case 16:
                    if (3 == band) {
                        ifAlarm = true;
                    }
                    break;
                case 17:
                    if ((2 == band) && (('DAU_dualband' == deviceMd) || ('DRU_dualband' == deviceMd))) {
                        ifAlarm = true;
                    }
                    if ((3 == band) && (('DAU_quadband' == deviceMd) || ('DRU_quadband' == deviceMd))) {
                        ifAlarm = true;
                    }
                    break;
                case 18:
                    if ((2 == band) && ('DRU_dualband' == deviceMd)) {
                        ifAlarm = true;
                    }
                    if ((3 == band) && ('DRU_quadband' == deviceMd)) {
                        ifAlarm = true;
                    }
                    break;
                case 19:
                case 20:
                    if ((2 == band) && (('DAU_dualband' == deviceMd) || ('DRU_dualband' == deviceMd))) {
                        ifAlarm = true;
                    }
                    if ((3 == band) && (('DAU_quadband' == deviceMd) || ('DRU_quadband' == deviceMd))) {
                        ifAlarm = true;
                    }
                    break;
                case 21:
                    if ((2 == band) && (('DAU_dualband' == deviceMd) || ('DRU_dualband' == deviceMd))) {
                        ifAlarm = true;
                    }
                    if ((4 == band) && (('DAU_quadband' == deviceMd) || ('DRU_quadband' == deviceMd))) {
                        ifAlarm = true;
                    }
                    break;
                case 22:
                case 23:
                    if (4 == band) {
                        ifAlarm = true;
                    }
                    break;
                case 24:
                    if (4 == band) {
                        ifAlarm = true;
                    }
                    break;
                case 25:
                    if ((4 == band) && ('DRU_quadband' == deviceMd)) {
                        ifAlarm = true;
                    }
                    break;
                case 26:
                case 27:
                    if (4 == band) {
                        ifAlarm = true;
                    }
                    break;
                case 28:
                    if (0 == band) {
                        ifAlarm = true;
                    }
                    break;
                case 29:
                    if ((0 == band) && (('DAU_dualband' == deviceMd) || ('DAU_quadband' == deviceMd))) {
                        ifAlarm = true;
                    }
                    break;
                case 30:
                    if ((0 == band) && (('DAU_dualband' == deviceMd) || ('DAU_quadband' == deviceMd))) {
                        ifAlarm = true;
                    }
                    break;
                case 31:
                    break;

            }
        }
    }

    ////        if ('1' == iArray[i]) {
    ////            //alert('alarm happens in: ' + i);
    ////            ifAlarm = true;
    ////            break;
    ////        }

    return ifAlarm;
}

//////function checkDualAlarm(alarmString, deviceMd, band) {
//////    var iArray = alarmString.split("");
//////    //alert(deviceMd);
//////    
//////    var ifAlarm = false;
//////    for (var i = 0; i < iArray.length; i++) {
//////        if (0 < iArray[i]) {
//////            switch (i) {
//////                case 0:
//////                    if ((1 == band) && ('DRU_dualband' == deviceMd)) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 1:
//////                    if ((1 == band) && ('DRU_dualband' == deviceMd)) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 2:
//////                    if ((1 == band) && ('DRU_dualband' == deviceMd)) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 3:
//////                    if ((1 == band) && ('DRU_dualband' == deviceMd)) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 4:
//////                    if ((1 == band) && ('DRU_dualband' == deviceMd)) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 5:
//////                    if ((2 == band) && ('DRU_dualband' == deviceMd)) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 6:
//////                    if ((2 == band) && ('DRU_dualband' == deviceMd)) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 7:
//////                    if ((2 == band) && ('DRU_dualband' == deviceMd)) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 8:
//////                    if ((2 == band) && ('DRU_dualband' == deviceMd)) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 9:
//////                    if ((2 == band) && ('DRU_dualband' == deviceMd)) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 10:
//////                    if (1 == band) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 11:
//////                    if ((1 == band) && ('DRU_dualband' == deviceMd)) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 12:
//////                    if (1 == band) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 13:
//////                    if (1 == band) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 14:
//////                    if (1 == band) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 15:
//////                    if (1 == band) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 16:
//////                    if (1 == band) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 17:
//////                    if (2 == band) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 18:
//////                    if ((2 == band) && ('DRU_dualband' == deviceMd)) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 19:
//////                    if (2 == band) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 20:
//////                    if (2 == band) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 21:
//////                    if (2 == band) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 22:
//////                    if (2 == band) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 23:
//////                    if (2 == band) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 24:
//////                    break;
//////                case 25:
//////                    break;
//////                case 26:
//////                    break;
//////                case 27:
//////                    break;
//////                case 28:
//////                    if (0 == band) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 29:
//////                    if ((0 == band) && ('DAU_dualband' == deviceMd)) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 30:
//////                    if ((0 == band) && ('DAU_dualband' == deviceMd)) {
//////                        ifAlarm = true;
//////                    }
//////                    break;
//////                case 31:
//////                    break;

//////            }
//////        }
//////    }
//////    
//////////        if ('1' == iArray[i]) {
//////////            //alert('alarm happens in: ' + i);
//////////            ifAlarm = true;
//////////            break;
//////    ////        }

//////    return ifAlarm;
//////}