const mongoose = require('mongoose');

const second = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    name : {type : String, require : true}
})

const testModule = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    name : {type : String, require : true},
    child : {type : [second], require : true}
});


module.exports = mongoose.model('testModules', testModule);