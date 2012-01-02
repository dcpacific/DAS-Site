
//==============================================================================
// Retrieve content from caller
// note:
//  caller : dauConfig.html, druConfig.html
//==============================================================================
function rxParam() {
   var deviceID   = 0;
   var l = location.href;
   var left = l.indexOf("?")+1;
   var tmpstg = l.substring(left);
   return tmpstg;
}

//==============================================================================
// function RFBdType
// 
// callee : rwDRU.js, rwDAU.js, druConfig.html, dauConfig.html 
//==============================================================================
function RFBdType(BdNum) {
    var cStgNm = "";
    switch(BdNum){
        case 0 :
            cStgNm = "700";
            break;
        case 1 :
            cStgNm = "850";
            break;
        case 2 :
            cStgNm = "1900";
            break;
        case 3 :
            cStgNm = "AWS";
            break;
        default:    
    }
    return cStgNm;
    
}

//==============================================================================
// function sleep
// 
// callee : index.html 
//==============================================================================
function sleep( seconds ) {
	var timer = new Date();
	var time = timer.getTime();
	do
		timer = new Date();
	while( (timer.getTime() - time) < (seconds * 1000) );
}

//==============================================================================
// function roundNumber - 
// round off an number with to a certain "num" of decimal places
//==============================================================================
function roundNumber(value, num) {
    var a, b, c, i
    a = value.toString();
    b = a.indexOf('.');
    c = a.length;
    if (num == 0) {
        if (b != -1)
            a = a.substring(0, b);
    }
    else {
        if (b == -1) {
            a = a + ".";
            for (i = 1; i <= num; i++)
                a = a + "0";
        }
        else {
            a = a.substring(0, b + num + 1);
            for (i = c; i <= b + num; i++)
                a = a + "0";
        }
    }
    return a;
}

//==============================================================================
// function adv_format
//cut off the tail of an number with to a certain "num" of decimal places
//==============================================================================
function adv_format(value,num){
    var a_str = roundNumber(value, num);
    var a_int = parseFloat(a_str);
    if (value.toString().length > a_str.length) {
        var b_str = value.toString().substring(a_str.length, a_str.length + 1)
        var b_int = parseFloat(b_str);
        if (b_int < 5) {
            return a_str
        }
        else {
            var bonus_str, bonus_int;
            if (num == 0) {
                bonus_int = 1;
            }
            else {
                bonus_str = "0."
                for (var i = 1; i < num; i++)
                    bonus_str += "0";
                bonus_str += "1";
                bonus_int = parseFloat(bonus_str);
            }
            a_str = formatnumber(a_int + bonus_int, num)
        }
    }
    return a_str;
}

//==============================================================================
// function verifyData - verify user's input data
//==============================================================================
function verifyData(targetID) {
    var oid = targetID.substr(0, targetID.length - 2); //targetID should be "0xoid_band"
    var data = Number(document.getElementById(targetID).value);
    var oText = document.getElementById(targetID);
    //alert('oid:' + oid + ' data:' + data + ' oText:' + oText);
    switch (oid) {
        case '0x440':   //DRU DL/UL Attenuation
        case '0x441':   //DAU DL/UL Attenuation
            if (isNaN(data)) {
                alert("Invalid input.\nPlease input 0 - 30 db.");
                window.setTimeout(function() { oText.focus(); }, 0); //obj.focus() is not applied in firefox
            } else {
                if ((data < 0) || (30 < data)) {
                    alert("Invalid input.\nPlease input 0 - 30 db.");
                    window.setTimeout(function() { oText.focus(); }, 0);
                }
            }
            break;
        case '0x450':   //DL VSWR Threshold
            if (isNaN(data)) {
                alert("Invalid input.\nPlease input 1 - 5.");
                window.setTimeout(function() { oText.focus(); }, 0); //obj.focus() is not applied in firefox
            } else {
                if ((data < 1) || (5 < data)) {
                    alert("Invalid input.\nPlease input 1 - 5.");
                    window.setTimeout(function() { oText.focus(); }, 0);
                }
            }
            break;
        case '0x453':   //DL Input Power Low Threshold
            if (isNaN(data)) {
                alert("Invalid input.\nPlease input -45 - -10 dbm.");
                window.setTimeout(function() { oText.focus(); }, 0); //obj.focus() is not applied in firefox
            } else {
                if ((data < -45) || (-10 < data)) {
                    alert("Invalid input.\nPlease input -45 - -10 dbm.");
                    window.setTimeout(function() { oText.focus(); }, 0);
                }
            }
            break;
        case '0x454':   //DL Input Power High Threshold
            if (isNaN(data)) {
                alert("Invalid input.\nPlease input -45 - +3 dbm.");
                window.setTimeout(function() { oText.focus(); }, 0); //obj.focus() is not applied in firefox
            } else {
                if ((data < -45) || (3 < data)) {
                    alert("Invalid input.\nPlease input -45 - +3 dbm.");
                    window.setTimeout(function() { oText.focus(); }, 0);
                }
            }
            break;
        case '0x4a1':   //Delay Compensation
            if (isNaN(data)) {
                alert("Invalid input.\nPlease input 0 - 160 us.");
                window.setTimeout(function() { oText.focus(); }, 0); //obj.focus() is not applied in firefox
            } else {
                if ((data < 0) || (160 < data)) {
                    alert("Invalid input.\nPlease input 0 - 160 us.");
                    window.setTimeout(function() { oText.focus(); }, 0);
                }
            }
            break;
        default:
            break;
    }
}

