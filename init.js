const {KohanaJS} = require('kohanajs')
KohanaJS.initConfig(new Map([
  ['admin', require('./config/admin')],
]));