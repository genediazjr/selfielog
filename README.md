# Selfielog
Time log through selfies... or groupies, that also works.

[![Build Status](https://travis-ci.org/letsblumit/selfielog.svg)](https://travis-ci.org/letsblumit/selfielog)
[![Coverage Status](https://coveralls.io/repos/letsblumit/selfielog/badge.svg)](https://coveralls.io/r/letsblumit/selfielog)
[![Code Climate](https://codeclimate.com/github/letsblumit/selfielog/badges/gpa.svg)](https://codeclimate.com/github/letsblumit/selfielog)


### Maintainers
* Gene Diaz Jr. <gene@letsblumit.com>

### Technologies
* [gifshot]https://github.com/yahoo/gifshot - gif image
* [webcamjs](http://pixlcore.com/read/WebcamJS) - image capture
* [multiparty](https://github.com/andrewrk/node-multiparty/) - image upload
* [imagemin](https://github.com/imagemin/imagemin) - image minify
* [hashids](http://hashids.org/) - image names
* [aws S3](http://aws.amazon.com/s3/) - image storage
* [express](http://expressjs.com/) - http server
* [redis](http://redis.io/) - in-memory cache

### Usage
Make sure that [nodejs is installed](http://nodejs.org/download/) first.
For osx, its best to [use homebrew](http://shapeshed.com/setting-up-nodejs-and-npm-on-mac-osx/).

#### Install dependencies
```
npm install
```

#### Run server
```
npm run [environment]
```

Environments:
* `dev` - development
* `prod` - production

### License
* All codes are under [MIT License](https://github.com/letsblumit/selfielog/blob/master/LICENSE)
