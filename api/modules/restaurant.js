const mongoose = require('mongoose');

const restaurantSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    name : {type : String, required : true},
    english : {type : Boolean, required : true},
    priceUnit : {type : String, required : true},
    tabletSyn : {type : Number, default : 0},
    categories : [{type : mongoose.Schema.Types.ObjectId, ref : "Category", required : true}],
    commandsInfoIds : [{type : mongoose.Schema.Types.ObjectId, ref : "CommandInfo", required : true}]
});

module.exports = mongoose.model('RestaurantInfo', restaurantSchema);