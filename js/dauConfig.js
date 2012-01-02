function setSubBand(subband) {
    // show sub-Band setting
    var urlStr;

    if ('1900' == subband) {
        urlStr = "subBand.html";
    } else if ('AWS' == subband) {
        urlStr = "subBand_N.html";
    }
    window.location.href = urlStr;
}