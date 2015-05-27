/**
 * @file index.js
 * @project trashcan
 * @license GPLv3.
 * @copyright 2015 Online Health Database.
 */

"use strict";

var rc = require('rc')
  , fs = require('fs')
  , events = new (require('events').EventEmitter)
  , nodemailer = require('nodemailer')
  , timestamp = function (msg) {
      return '[' + (new Date) + '] ' + String(msg)
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

      handle.exec = function (cb) {
        try {
          fn.apply(context, arguments)
        } catch (error) {
          tc.throw(error)
          if (typeof cb === 'function') cb(error)
        }
      }

      return handle
    }
  , prototype = {

      title: null,

      /**
       * Attach an event listener.
       * @public
       * @method on
       * @params {String} event - the event to attach to
       * @params {Function} callback - an event handler
       */
      on: function () {
        events.on.apply(events, arguments)
        return tc
      }

      /**
       * Detach an event listener.
       * @public
       * @method off
       * @params {String} event - the event to detach from
       * @params {Function} callback - an event handler
       */
    , off: function () {
        events.off.apply(events, arguments)
        return tc
      }

      /**
       * Emit an event.
       * @public
       * @method emit
       * @params {String} event - the event to emit
       * @params {Variant} data - some data to pass
       */
    , emit: function () {
        events.emit.apply(events, arguments)
        return tc
      }

      /**
       * Throw an error safely.
       * @public
       * @method throw
       * @params {Error|String} error - the error to throw
       */
    , throw: function (error) {
        this.emit('error', error)
        return tc
      }

      /**
       * Create a callback for logging errors to a file.
       * @public
       * @method log
       * @params {String} filename - the file to log to
       * @returns {Function} callback - the callback to aattach to the error event
       */
    , log: function (filename) {
        var self
        fs.writeFileSync(filename, timestamp('Error log started.') + '\n')

        /** simply append all error info to the file */
        return (self = function (error) {
          fs.appendFile(filename, timestamp(error) + '\n')
          return self
        })
      }

      /**
       * Create a callback for sending errors as emails.
       * @public
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
            , subject: tc.title || String(error)
            , text: String(error)
            , html: '<code><pre>' + String(error) + '</pre></code>'
          })
  
          return self
        })
      }

      /**
       * Handle rejections of a promise.
       * @public
       * @method swear
       * @params {Promise} promise - a promise object work handle for
       * @params {Function} callback - a success callback to execute on resolution
       */
    , swear: function (promise, success) {
        promise.then(success, tc.throw)
        return tc
      }

      /**
       * Catch all error events of an emitter.
       * @public
       * @method catch
       * @params {EventEmitter} emitter - the event emitter/object to catch errors from
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
