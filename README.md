# Trashcan

Safe error handling in production mode.

[![NPM](https://nodei.co/npm/trashcan.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/trashcan/)

## Usage

Install via npm (`npm install --save trashcan`) and then take advantage of the API to catch and handle errors.

## Table of Contents

Aside from the auto-catching `uncaughtException` events on `process`, trashcan is useful for making sure the exception doesn't get that far.
Use it in your code to not worry about errors in every callback you make.

 - [Error Handling](#error-handling)
 - [Asynchronous Callback Errors](#asynchronous-callbacks)
 - [Synchronous Errors](#synchronous-errors)
 - [Custom Errors](#custom-errors)

### Error Handling

```javascript
var tc = require('trashcan')

// handle the errors manually
tc.on('error', function (err) {
  // do stuff with the error
})

// or auto-email the admin
tc.on('error', tc.notify('me@email.com'))

// or to a server log
tc.on('error', tc.log('./server.log'))
```

*tc.notify() uses nodemailer in the background, and can either be passed nodemailer transport configuration as the second argument or that
configuration can be saved into a file called `.mailrc` in your project folder.*

### Asynchronous Callback Errors

```javascript
var tc = require('trashcan')
  , fs = require('fs')

fs.readFile('./my-file.txt', 'utf8', tc(function (data) {
  // handle file data
}))
```

### Synchronous Errors

```javascript
var tc = require('trashcan')
  , fs = require('fs')

tc(function () {
  var data = fs.readFileSync('./my-file.txt', 'utf8')

  // handle file data
}).exec()
```

### Custom Errors

```javascript
var tc = require('trashcan')

// throw the error manually
tc.throw(trash)
```

## License

GPLv3.

```
trashcan: safe error handling in production mode.
Copyright (C) 2015 Online Health Database

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
```
