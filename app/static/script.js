'use strict';

var previousDate,
  currentDate = new Date(),
  xmlhttp = new XMLHttpRequest(),
  logit = document.getElementById('logit'),
  snapit = document.getElementById('snapit'),
  cancel = document.getElementById('cancel'),
  upload = document.getElementById('upload'),
  endlog = document.getElementById('endlog'),
  picker = document.getElementById('picker'),
  preview = document.getElementById('preview'),
  newtimelog = document.getElementById('newtimelog'),
  newlogmodal = document.getElementById('newlogmodal'),
  timeloglist = document.getElementById('timeloglist'),
  gifSupport = gifshot.isWebCamGIFSupported(),
  logitem = '<div class="time">{{time}}</div><hr>' +
    '<div class="selfie"><img class="camera" src="{{url}}"></div>',
  monthNames = ['January', 'February', 'March',
    'April', 'May', 'June', 'July',
    'August', 'September', 'October',
    'November', 'December'];

navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.webkitGetUserMedia;

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
  var selectedDate = new Date(picker.value);
  return selectedDate.getFullYear() +
    '.' + selectedDate.getMonth() +
    '.' + selectedDate.getDate();
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
    if (gifSupport) {
      dataUri = preview.src;
    }
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
  snapit.style.display = 'none';
  if (gifSupport) {
    gifshot.createGIF({
      gifWidth: 320,
      gifHeight: 240,
      video: document.querySelector('video').src,
      keepCameraOn: true,
      interval: 0.1,
      numFrames: 15,
      progressCallback: function (progress) {
        upload.innerText = 'Recording ' + Math.round(progress * 100) + '%';
      }
    }, function (obj) {
      if (obj.error) {
        upload.innerText = 'Recording failed';
        snapit.style.display = 'inline-block';
      } else {
        upload.innerText = '';
        logit.style.display = 'inline-block';
        preview.style.visibility = 'visible';
        preview.src = obj.image;
      }
    });
  } else {
    Webcam.freeze();
  }
  console.log(document.querySelector('video'));
}

function cancelIt() {
  if (snapit.style.display === 'inline-block') {
    newlogmodal.style.display = 'none';
    Webcam.reset();
  } else {
    preview.style.visibility = 'hidden';
    snapit.style.display = 'inline-block';
    logit.style.display = 'none';
    Webcam.unfreeze();
  }
  upload.innerText = '';
}

function newTimeLog() {
  preview.style.visibility = 'hidden';
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
  picker.value = monthNames[currentDate.getMonth()] +
    ' ' + currentDate.getDate() +
    ', ' + currentDate.getFullYear();
  previousDate = picker.value;
  listLogs();
};

window.onsubmit = function () {
  return false;
};

picker.onblur = function () {
  if (picker.value !== previousDate) {
    previousDate = picker.value;
    listLogs();
  }
};

datepickr(picker);
