// https://melonking.net - Swatch Clock! v2
// The script displays a live Swatch Internet Time clock on your website!
// For more info on swatch time visit https://wiki.melonland.net/swatch_time
//
// How to this script; just paste this onto your site where ever you want the clock to show:
// <span id="swatchClock">@000</span>
// OR if you dont want the info link
// <span id="swatchClock-nolink">@000</span>
// <script defer src="https://melonking.net/scripts/swatchTime.js"></script>

var swatchClock = document.getElementById("swatchClock");
var swatchClockNoLink = document.getElementById("swatchClock-nolink");
function updateSwatchClock() {
    if (swatchClock != null) swatchClock.innerHTML = '<a style="color:red" href="https://wiki.melonland.net/swatch_time" target="_blank">&#64;' + GetSwatchTime() + "</a>";
    if (swatchClockNoLink != null) swatchClockNoLink.innerHTML = "&#64;" + GetSwatchTime();
}
setInterval(updateSwatchClock, 864);
function GetSwatchTime(showDecimals = true) {
    // get date in UTC/GMT
    var date = new Date();
    var hours = date.getUTCHours();
    var minutes = date.getUTCMinutes();
    var seconds = date.getUTCSeconds();
    var milliseconds = date.getUTCMilliseconds();
    // add hour to get time in Switzerland
    hours = hours == 23 ? 0 : hours + 1;
    // time in seconds
    var timeInMilliseconds = ((hours * 60 + minutes) * 60 + seconds) * 1000 + milliseconds;
    // there are 86.4 seconds in a beat
    var millisecondsInABeat = 86400;
    // calculate beats to two decimal places
    if (showDecimals) {
        return Math.abs(timeInMilliseconds / millisecondsInABeat).toFixed(2);
    } else {
        return Math.floor(Math.abs(timeInMilliseconds / millisecondsInABeat));
    }
}