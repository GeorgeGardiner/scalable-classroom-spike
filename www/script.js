const backdropHubBase = 'https://z2bnusowi9.execute-api.us-east-1.amazonaws.com';

let connectedDevices = [];
let queryLock = false;

$(document).ready(function () {
    setInterval(refreshVisibleDevices, 1000);
    setInterval(queryConnectedDevices, 1000);
    queryConnectedDevices();
});

function queryConnectedDevices() {
    if(queryLock) {
        return;
    }
    queryLock = true;
    $.ajax({
        url: backdropHubBase + '/devices',
        data: null,
        success: function(data) {
            connectedDevices = data.device_ids;
            renderDevices();
        },
        complete: function() {
            queryLock = false;
        },
        dataType: 'JSON'
    });
}

function renderDevices() {
    // Remove devices that are no longer connected
    $('.device').each(function(index) {
        if(connectedDevices.indexOf($(this).attr('data-id')) === -1) {
            $(this).remove();
        }
    });

    // Append devices that are new
    for(var i=0; i<connectedDevices.length; i++) {
        if($('*[data-id="'+ connectedDevices[i] +'"]').length === 0) {
            $('#device-container').append($(renderDeviceTemplate(connectedDevices[i])));
        }
    }
}

function renderDeviceTemplate(deviceId) {
    var template = "";
    template+="<div class='col-sm-4 mb-5 device' data-id='" + deviceId + "' data-thumbage='0'>";
    template+="<div class='card'>";
    template+="<div class='card-body'>";
    template+="<img src='no-connection.gif' style='width: 100%; height:100%; object-position:contain;'>";
    template+="</div>";
    template+="</div>";
    template+="</div>";
    return template;
}

function refreshVisibleDevices() {
    $('.device').each(function(index) {
        if(isVisible($(this))) {
            refreshThumb($(this).attr('data-id'));
        }
        else {
            $(this).find('img').attr('src', 'no-connection.gif');
        }
    });
}

function refreshThumb(deviceId) {

    $devices = $('*[data-id="'+ deviceId +'"]');

    let maxAge = 0;
    $devices.each(function(i) {
        let thumbAge = parseInt($(this).attr('data-thumbage'));
        if(thumbAge > maxAge) {
            maxAge = thumbAge;
        }
    });

    console.log(maxAge);

    if((maxAge + 1000) < Date.now()) {
        let thumb = new Image();
        thumb.onload = function () {
            $devices = $('*[data-id="' + deviceId + '"]');
            $devices.each(function (i) {
                $(this).attr('data-thumbage', Date.now());
                $(this).find('img').attr('src', thumb.src);
            });
            thumb = null;
        };
        thumb.src = backdropHubBase + '/thumb/' + deviceId + '?' + 'cachebuster=' + Date.now();
    }
}

function isVisible($el) {
    var topEl = $el.offset().top;
    var bottomEl = $el.offset().top + $el.outerHeight();
    var topScr = $(window).scrollTop();
    var bottomScr = $(window).scrollTop() + $(window).innerHeight();

    if ((bottomScr > topEl) && (topScr < bottomEl)){
        return true;
    } else {
        return false;
    }
}
