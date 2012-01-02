

//================================================
// function isInteger
//================================================
function isInteger(val)
{
    alert(val.value);
    if(val==null)
    {
        alert(val);
        return false;
    }
    if (val.length==0)
    {
        alert(val);
        return false;
    }
    for (var i = 0; i < val.length; i++) 
    {
        var ch = val.charAt(i)
        if (i == 0 && ch == "-")
        {
            continue
        }
        if (ch < "0" || ch > "9")
        {
            return false
        }
    }
    return true
}



//================================================
// function chkdau
//================================================
function chkdau() {
// validate 	
//var t = OpenWindow.document.getElementById('0x440').innerHTML; 	
//	OpenWindow.document.myform.submit();
var flag = true;

setTimeout(alert(" -- WITHIN chkdau() --"),3000);

return flag;

}	