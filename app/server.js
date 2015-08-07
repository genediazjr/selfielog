'use strict';

var fs = require('fs'),
  path = require('path'),
  http = require('http'),
  https = require('https'),
  redis = require('redis'),
  Hashid = require('hashids'),
  express = require('express'),
  Imagemin = require('imagemin'),
  Multiparty = require('multiparty'),
  bodyParser = require('body-parser'),
  AWS = require('aws-sdk'),
  BinaryServer = require('binaryjs').BinaryServer,

  config = require('../config'),
  Logger = require('./util/logger'),

  app = express(),
  router = express.Router(),
  hasher = new Hashid(config.hashid.salt, config.hashid.length),
  cache = redis.createClient(config.redis.port, config.redis.host),
  dir = path.join(__dirname, config.server.root),
  log = new Logger(),
  s3 = new AWS.S3({
    accessKeyId: config.aws.access,
    secretAccessKey: config.aws.secret
  }),
  clients = {}, bs;

fs.mkdir(dir, function (err) {
  if (err) {
    log.debug(err);
  }
});

router.get('/logs', function (req, res) {
  var l, logs = [];
  cache.lrange(req.query.datelog, 0, -1, function (err, datelogs) {
    if (err) {
      log.error('cache error', err);
    } else {
      for (l = 0; l < datelogs.length; l++) {
        logs.push(JSON.parse(datelogs[l]));
      }
    }
    res.json(logs);
    return;
  });
});

router.post('/upload', function (req, res) {
  var u,
    mime,
    upload,
    minify,
    newname,
    timelog,
    curdate = new Date(),
    datelog = curdate.getFullYear() +
      '.' + curdate.getMonth() +
      '.' + curdate.getDate(),
    hours = curdate.getHours(),
    minutes = curdate.getMinutes(),
    ampm = hours >= 12 ? 'pm' : 'am',
    form = new Multiparty.Form({uploadDir: dir});

  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  timelog = hours + ':' + minutes + ' ' + ampm;

  form.parse(req, function (err, fields, uploads) {
    for (u in uploads) {
      if (uploads.hasOwnProperty(u)) {
        upload = uploads[u][0];
        break;
      }
    }
    if (upload) {
      log.info(upload);
      cache.incr('fileCount', function (err, fileCount) {
        mime = upload.headers['content-type'];
        newname = hasher.encode(fileCount) + ((mime === 'image/png') ? '.png' : '.gif');
        minify = new Imagemin().src(upload.path);
        minify.use(Imagemin.optipng({optimizationLevel: config.imagemin.optimizationLevel}));
        minify.run(function (err, files) {
          if (err) {
            log.fatal('minify error', err);
            res.json({success: false});
            return;
          } else {
            log.debug('minify done', newname);
            s3.upload({
              Key: newname,
              ACL: 'public-read',
              Body: files[0].contents,
              Bucket: config.aws.bucket,
              ContentType: mime,
              ContentLength: files[0].contents.length
            }, function (err, data) {
              if (err) {
                log.fatal('upload error', err);
                res.json({success: false});
                return;
              } else {
                log.debug('upload done', newname);
                fs.unlink(upload.path, function (err) {
                  if (err) {
                    log.fatal('delete error', err);
                  }
                  cache.lpush(datelog, JSON.stringify({
                    timelog: timelog,
                    url: data.Location
                  }), function (err) {
                    if (err) {
                      log.fatal('cache error', err);
                      res.json({success: false});
                      return;
                    } else {
                      log.info(data);
                      res.json({
                        success: true,
                        timelog: timelog,
                        url: data.Location
                      });
                      return;
                    }
                  });
                });
              }
            });
          }
        });
      });
    } else {
      log.error('nothing to upload', upload);
      res.json({success: false});
      return;
    }
  });
});

app.use(express['static'](__dirname + '/static'));
app.use('/' + config.server.root, router);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

bs = new BinaryServer({ port: 5000 });

bs.on('connection', function (client) {
  clients[client.id] = {client: client};
  client.on('stream', function (data, meta) {
    var received = JSON.parse(meta);
    data.on('data', function (data) {
      for (var c in clients) {
        if(clients.hasOwnProperty(c)) {
          if(c.toString() !== client.id.toString()) {
            received['id'] = client.id.toString();
            clients[c]['client'].send(data, JSON.stringify(received));
          }
        }
      }
    });
  });

  client.on('close', function() {
    delete clients[client.id];
    for (var c in clients) {
      if(clients.hasOwnProperty(c)) {
        clients[c]['client'].send("Disconnected", JSON.stringify({id: client.id, action: 'disconnect'}));
      }
    }
  })
});

if (config.ssl.enabled) {
  http.createServer(function (req, res) {
    res.writeHead(302, {Location: 'https://' + req.headers.host + req.url});
    res.end();
  }).listen(80);
  https.createServer({
    key: fs.readFileSync(config.ssl.key, 'utf8'),
    cert: fs.readFileSync(config.ssl.cert, 'utf8')
  }, app).listen(config.server.port);
} else {
  http.createServer(app).listen(config.server.port);
}
