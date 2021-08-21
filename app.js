const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');

//require
app.use(morgan('dev'));
app.use('/images', express.static('images'));
app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());


//mongoose Mongodb
//mongoose.connect('mongodb+srv://ayoubben:' + process.env.MONGO_ATLAS_PW  + '@cluster0-8oill.mongodb.net/test?retryWrites=true&w=majority',
mongoose.connect('mongodb://localhost:27017/',  
{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.Promise = global.Promise;


app.use((req, res, next) =>{
    //access to the url (*) anything.
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if(req.methode === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, DELETE, PATCH, GET');
        return res.status(200).jason({});
    }
    next();
});

//the app
const restaurantRoutes = require('./api/routes/retaurants');
app.use('/restaurants', restaurantRoutes);

const synchronizeRoutes = require('./api/routes/Synchronize');
app.use('/synchronize', synchronizeRoutes);

const categoriesRoutes = require('./api/routes/categories');
app.use('/categories', categoriesRoutes);

const productsRoutes = require('./api/routes/products');
app.use('/products', productsRoutes);

const propertiesRoutes = require('./api/routes/properties');
app.use('/properties', propertiesRoutes);

const ordersRoutes = require('./api/routes/orders');
app.use('/orders', ordersRoutes);

const productImages = require('./api/routes/productImages');
app.use('/productImages', productImages);

const commandsRoutes = require('./api/routes/commands');
app.use('/commands', commandsRoutes);

const testk = require('./api/routes/test');
app.use('/test', testk);

//handling error
app.use((req, res, next) => {
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    console.log(error);
    if(error.message == "image type"){
        res.json({
            message : "image type"
        })
    }else{
        res.json({
            error : {
                messgae : error.message
            }
        });
    }
    
});

module.exports = app;