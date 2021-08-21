const mongoose = require('mongoose');

const propertySchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    name : {type : [String], required : true},
    require : {type : Boolean, required : true},
    max : {type : Number, required : true},
    min : {type : Number, required : true},
    details : {type : [[String]], required : true}
});


module.exports = mongoose.model('Property', propertySchema);