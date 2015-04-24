/**
 * @file index.js
 * @project trashcan
 * @license GPLv3.
 * @copyright 2015 Online Health Database.
 */

"use strict";

var rc = require('rc')
  , events = new (require('events').EventEmitter)
  , nodemailer = require('nodemailer')
  , timestamp = function (msg) {
      return '[' + (new Date) + '] ' + msg
    }
  , tc = function (fn, context) {
      context = context || tc

      var handle = function (error) {
        if (error) {
          tc.throw(error)
        } else {
          var args = Array.prototype.slice.call(arguments, 1)
          return fn.apply(context, args)
        }
      }

      /**
       * @memberof Handler
       */
      handle.exec = function () {
        try {
          fn.apply(context, arguments)
        } catch (error) {
          tc.throw(error)
        }
      }

      return handle
    }
  , prototype = {

      /**
       * Attach an event listener.
       * @memberof trashcan
       * @method on
       * @params {String} event - the event to attach to
       * @params {Function} callback - an event handler
       */
      on: function () {
        return events.on.apply(events, arguments)
      }

      /**
       * Detach an event listener.
       * @memberof trashcan
       * @method off
       * @params {String} event - the event to detach from
       * @params {Function} callback - an event handler
       */
    , off: function () {
        return events.off.apply(events, arguments)
      }

      /**
       * Emit an event.
       * @memberof trashcan
       * @method emit
       * @params {String} event - the event to emit
       * @params {Variant} data - some data to pass
       */
    , emit: function () {
        return events.emit.apply(events, arguments)
      }

      /**
       * Expand an error into its full form (with extra details).
       * @memberof trashcan
       * @method full
       * @params {String} error - an error message
       * @returns {String} message - an expanded error message
       */
    , full: function (error) {
        return JSON.stringify({
            error: error
          , freemem: 0
        }, null, 2)
      }

      /**
       * Throw an error safely.
       * @memberof trashcan
       * @method throw
       * @params {Error|String} error - the error to throw
       */
    , throw: function (error) {
        return this.emit('error', error)
      }

      /**
       * Create a callback for logging errors to a file.
       * @memberof trashcan
       * @method log
       * @params {String} filename - the file to log to
       * @returns {Function} callback - the callback to aattach to the error event
       */
    , log: function (filename) {
        var self
        fs.writeFileSync(filename, timestamp('Error log started.') + '\n')

        /** simply append all error info to the file */
        return (self = function (error) {
          fs.appendFile(filename, timestamp(tc.full(error)) + '\n')
          return self
        })
      }

      /**
       * Create a callback for sending errors as emails.
       * @memberof trashcan
       * @method notify
       * @params {Array|String} email(s) - the email address(es) to notify
       * @returns {Function} callback - the callback to attach to the error event
       */
    , notify: function (emails, config) {
        var self, transport

        // prefer arrays
        if (typeof emails === 'string') emails = [emails]

        // try loading mail configuration
        if (!config) config = rc('mail', {})

        // create a nodemailer transporter
        transport = nodemailer.createTransport(config)

        /** use nodemailer to transport a full notification */
        return (self = function (error) {
          transport.sendMail({
              to: emails
            , from: config.auth.user
            , subject: String(error)
            , text: tc.full(error)
            , html: '<code><pre>' + tc.full(error) + '</pre></code>'
          })
  
          return self
        })
      }

      /**
       * Handle rejections of a promise.
       * @memberof trashcan
       * @method swear
       * @params {Promise} promise - a promise object work handle for
       * @params {Function} callback - a success callback to execute on resolution
       * @returns {Promise} promise - the original promise
       */
    , swear: function (promise, success) {
        return promise.then(success, tc.throw)
      }

      /**
       * Catch all error events of an emitter.
       * @memberof trashcan
       * @method catch
       * @params {EventEmitter} emitter - the event emitter/object to catch errors from
       * @returns {Object} trashcan - for chaining
       */
    , catch: function (emitter) {
        emitter.on('error', tc.throw)
        return tc
      }

    }
  , i

// also handle uncaught exceptions
process.on('uncaughtException', function (error) {
  tc.throw(error)
})

// expand prototype onto function
for (i in prototype) {
  if (prototype.hasOwnProperty(i)) {
    tc[i] = prototype[i]
  }
}

/** @module trashcan */
module.exports = tc
