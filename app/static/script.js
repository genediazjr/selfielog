'use strict';

var curdate = new Date(),
  xmlhttp = new XMLHttpRequest(),
  logday = document.getElementById('logday'),
  logmonth = document.getElementById('logmonth'),
  logyear = document.getElementById('logyear'),
  logit = document.getElementById('logit'),
  snapit = document.getElementById('snapit'),
  cancel = document.getElementById('cancel'),
  upload = document.getElementById('upload'),
  endlog = document.getElementById('endlog'),
  newtimelog = document.getElementById('newtimelog'),
  newlogmodal = document.getElementById('newlogmodal'),
  timeloglist = document.getElementById('timeloglist'),
  logitem = '<div class="time">{{time}}</div><hr>' +
    '<div class="selfie"><img class="camera" src="{{url}}"></div>';

logday.onchange = listLogs;
logmonth.onchange = listLogs;
logyear.onchange = listLogs;
logit.onclick = logIt;
snapit.onclick = snapIt;
cancel.onclick = cancelIt;
newtimelog.onclick = newTimeLog;

xmlhttp.onreadystatechange = function () {
  if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
    var logs = JSON.parse(xmlhttp.responseText), l;
    if (logs.length > 0) {
      logs.reverse();
      for (l = 0; l < logs.length; l++) {
        addLog(logs[l].timelog, logs[l].url);
      }
      endlog.innerText = 'end of log';
    } else {
      endlog.innerText = 'no logs';
    }
  }
};

function getLogDate() {
  return logyear.options[logyear.selectedIndex].text +
    '.' + logmonth.options[logmonth.selectedIndex].value +
    '.' + logday.options[logday.selectedIndex].text;
}

function addLog(time, url) {
  var newitem = document.createElement('li');
  newitem.innerHTML = logitem.replace('{{time}}', time).replace('{{url}}', url);
  timeloglist.appendChild(newitem);
  timeloglist.insertBefore(newitem, timeloglist.firstChild);
}

function listLogs() {
  endlog.innerText = '';
  timeloglist.innerHTML = '';
  xmlhttp.open('GET', '/selfie/logs?datelog=' + getLogDate(), true);
  xmlhttp.send();
}

function logIt() {
  logit.style.display = 'none';
  cancel.style.display = 'none';
  upload.innerText = 'Uploading...';
  Webcam.snap(function (dataUri) {
    Webcam.upload(dataUri, '/selfie/upload', function (code, text) {
      var response = JSON.parse(text);
      if (response.success) {
        newlogmodal.style.display = 'none';
        endlog.innerText = 'end of log';
        Webcam.reset();
        addLog(response.timelog, response.url);
      } else {
        upload.innerText = 'Upload error';
        cancel.style.display = 'inline-block';
        logit.style.display = 'inline-block';
      }
    });
  });
}

function snapIt() {
  Webcam.freeze();
  snapit.style.display = 'none';
  logit.style.display = 'inline-block';
}

function cancelIt() {
  if (snapit.style.display === 'inline-block') {
    newlogmodal.style.display = 'none';
    Webcam.reset();
  } else {
    snapit.style.display = 'inline-block';
    logit.style.display = 'none';
    Webcam.unfreeze();
  }
  upload.innerText = '';
}

function newTimeLog() {
  snapit.style.display = 'inline-block';
  logit.style.display = 'none';
  upload.innerText = '';
  cancel.style.display = 'inline-block';
  newlogmodal.style.display = 'table-cell';
  Webcam.attach('#webcam');
}

Webcam.set({
  width: 320,
  height: 240,
  dest_width: 640,
  dest_height: 480,
  image_format: 'png'
});

Webcam.on('uploadProgress', function (progress) {
  upload.innerText = 'Uploading ' + Math.round(progress * 100) + '%';
});

Webcam.on('error', function (err) {
  upload.innerText = err;
});

window.onload = function () {
  logday.selectedIndex = curdate.getDate() - 1;
  logmonth.selectedIndex = curdate.getMonth();
  for (var i = 0; i < logyear.options.length; i++) {
    if (logyear.options[i].text === String(curdate.getFullYear())) {
      logyear.selectedIndex = i;
      break;
    }
  }
  logday.style.visibility = 'visible';
  logmonth.style.visibility = 'visible';
  logyear.style.visibility = 'visible';
  listLogs();
};

window.onsubmit = function () {
  return false;
};
