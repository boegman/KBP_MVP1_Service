var log4js = require('log4js')
var logger = log4js.getLogger('app.models.hotels')

var nconf = require('nconf')
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var mongoUrl = nconf.get('hotels:url') + nconf.get('hotels:db')
var connection = mongoose.createConnection(mongoUrl)

connection.on('error', function (err) {
  logger.error('connection error:' + err)
})

var deviceSchema = new Schema({
  deviceToken: { type: String, required: true, unique: true },
  merchantId: { type: String, required: true },
  created_at: Date
})

// triggers
deviceSchema.pre('save', function (next) {
  var currentDate = new Date()
  if (!this.created_at) {
    this.created_at = currentDate
  }
  next()
})

var Device = connection.model('hotels', deviceSchema)

module.exports = Device
