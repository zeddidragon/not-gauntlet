require('../src')

document.documentElement.innerHTML = require('./view')
  title: "Not Gauntlet"
  message: "More action than you can shake a stick at!"

require('insert-css')(require './style')

