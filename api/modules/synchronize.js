const mongoose = require('mongoose');

const Synchronize = mongoose.Schema({
    id : {type : mongoose.Schema.Types.ObjectId, require : true},
    time : {type : Number}
})

module.exports = mongoose.model('Synchronize', Synchronize);