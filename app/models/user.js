var log4js = require('log4js');
var logger = log4js.getLogger('app.models.user');

var nconf = require('nconf');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var log4js = require('log4js');
var logger = log4js.getLogger('users');

var mongoUrl = nconf.get('users:url') + nconf.get('users:db');
var connection = mongoose.createConnection(mongoUrl);

connection.on('error', function (err) {
    console.log('connection error:' + err);
});
connection.once('open', function (ref) {
    console.log('users connection open');
    User.count({}, function (err, count) {
        if (err) {
            console.log(err);
        }
        if (count === 0) {
//            seedDb();
        }
    });
});

var userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: Array,
    meta: {
        merchantId: String,
        encryptionKey: String,
        email : String,
    },
    created_at: Date,
    updated_at: Date
});

//methods
userSchema.methods.hasRole = function (role) {
    if (this.roles.indexOf(role.toLowerCase()) == -1) {
        return false;
    } else {
        return true;
    }
};

userSchema.methods.isAdmin = function () {
    if (this.roles.indexOf('admin') == -1) {
        return false;
    } else {
        return true;
    }
};

//triggers
userSchema.pre('save', function (next) {
    var currentDate = new Date();
    this.updated_at = currentDate;
    if (!this.created_at) {
        this.created_at = currentDate;
    }
    next();
});

var User = connection.model('User', userSchema);

module.exports = User;