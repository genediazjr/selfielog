'use strict';

var util = require('util'),
  chalk = require('chalk'),
  stringify = require('json-stringify-safe'),

  config = require('../../config');

chalk.enabled = true;

/**
 * @returns {Logger}
 * @constructor
 */
function Logger() {
  if (!(this instanceof Logger)) {
    return new Logger(this.concat(arguments, ' '));
  }
  if (arguments !== undefined) {
    this.prefix = this.concat(arguments, ' ');
  }
}

Logger.prototype = {

  /**
   * @param color
   * @param prefix
   * @param messages
   */
  log: function (color, prefix, messages) {

    if (prefix === undefined ||
      prefix === null ||
      prefix === {} ||
      prefix === '') {
      util.log(color(this.concat([messages], ' ')));
    } else {
      util.log(color(this.concat([prefix, messages], ' ')));
    }
  },

  /**
   * @param array of strings or objects
   * @param separator string
   * @returns concatenated string
   */
  concat: function (strings, separator) {
    var s, stringed, concatenated = '';

    if (separator === undefined) {
      separator = '';
    }
    if (typeof separator === 'object') {
      separator = stringify(separator);
    }

    for (s = 0; s < strings.length; s++) {
      stringed = strings[s];
      if (typeof strings[s] === 'object') {
        stringed = stringify(strings[s]);
      }
      if (s) {
        concatenated += separator + stringed;
      } else {
        concatenated += stringed;
      }
    }

    return concatenated;
  },

  /**
   * @description Severe errors that cause premature termination.
   */
  fatal: function () {
    if (config.logger.fatal) {
      this.log(chalk.red, this.prefix, this.concat(arguments, ' '));
    }
  },

  /**
   * @description Other runtime errors or unexpected conditions.
   */
  error: function () {
    if (config.logger.error) {
      this.log(chalk.yellow, this.prefix, this.concat(arguments, ' '));
    }
  },

  /**
   * @description Use of deprecated APIs, poor use of API, 'almost' errors, other runtime situations that are undesirable or unexpected, but not necessarily "wrong".
   */
  warn: function () {
    if (config.logger.warn) {
      this.log(chalk.magenta, this.prefix, this.concat(arguments, ' '));
    }
  },

  /**
   * @description Interesting runtime events (startup/shutdown).
   */
  info: function () {
    if (config.logger.info) {
      this.log(chalk.green, this.prefix, this.concat(arguments, ' '));
    }
  },

  /**
   * @description Detailed information on the flow through the system.
   */
  debug: function () {
    if (config.logger.debug) {
      this.log(chalk.gray, this.prefix, this.concat(arguments, ' '));
    }
  },

  /**
   * @description Most detailed information.
   */
  trace: function () {
    if (config.logger.trace) {
      this.log(chalk.cyan, this.prefix, this.concat(arguments, ' '));
    }
  }
};

module.exports = Logger;
