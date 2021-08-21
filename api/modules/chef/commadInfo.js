const mongoose = require('mongoose');

const propertyShcema = mongoose.Schema({
    propertyName : {type : [String], required : true},
    details : {type : [[String]], required : true}
});

const theCommandShcema = mongoose.Schema({
    productId : {type : mongoose.Schema.Types.ObjectId, ref : 'Product'},
    category : {type : mongoose.Schema.Types.ObjectId, ref : 'Category'},
    productName : {type : [String], required : true},
    productPrice : {type : Number, required : true},
    productCount : {type : Number, required : true},
    properties : {type : [propertyShcema], require : true}
});

const commandInfoSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    time : {type : Number},
    table : {type : Number, required : true},
    isComplete : {type : Boolean, default : false},
    theCommands : {type : [theCommandShcema], required : true}
});

module.exports = mongoose.model('CommandInfo', commandInfoSchema);