const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Restaurant = require('../modules/restaurant');
const Category = require('../modules/category');
const Product = require('../modules/product');
const Property = require('../modules/property');

/*-------------------------------------------------------------------*/
/*------------------------------- get  ----------------------------- */
/*-------------------------------------------------------------------*/

router.get(('/'), (req, res, next) => {

    Restaurant.find()
    .exec()
    .then(result => {
        makeMessage("success to all restaurant");
        makeMessage(result);
        res.status(200).json(result);
        //setInterval(sync,100);
    })
    .catch(error => {
        makeMessage("failed to get all restaurant");
        makeMessage(error);
        res.status(500).json({
            description : "failed to get all restaurants Info",
            error : error
        })
    })

});

/*-------------------------------------------------------------------*/
/*------------------------- get by id  ----------------------------- */
/*-------------------------------------------------------------------*/

router.get(('/:restaurantId'), (req, res, next) => {

    var categoriesNbm = 0;
    var productsNbm = 0;

    Restaurant.findById(req.params.restaurantId)
    .exec()
    .then(result => {
        makeMessage("success to get restaurant by Id");
        makeMessage(result);
        getCategriesNbm(result);
        getProductsNbm(result);
    })
    .catch(error => {
        makeMessage("failed to get restaurant by id");
        res.status(500).json({
            description : "failed to get restaurant by Id",
            error : error
        })
    })

    function getCategriesNbm(restaurant){
        categoriesNbm = restaurant.categories.length
    }

    function getProductsNbm(restaurant){
        Category.find({_id : {$in : restaurant.categories}})
        .exec()
        .then(result => {
            for(i in result){
                productsNbm += result[i].products.length
            }
            response(restaurant);
        })
        .catch(errors => {
            res.status(500).json({
                discription : "failed to get products count",
                error : errors
            })
        })
    }

    function response(result){
        res.status(200).json({
            _id : result._id,
            name : result.name,
            english : result.english,
            priceUnit : result.priceUnit,
            tabletSyn : result.tabletSyn,
            categoriesNbm : categoriesNbm,
            productsNbm : productsNbm,
            categories : result.categories,
            commandsInfoIds : result.commandsInfoIds
        });
    }

});

/*-------------------------------------------------------------------*/
/*--------------------- get by id all data  ------------------------ */
/*-------------------------------------------------------------------*/

router.get(('/:restaurantId/getAllData'), (req, res, next) => {
    Restaurant.findById(req.params.restaurantId)
    .populate({
        path : "categories",
        populate : {
            path : "products",
            model: 'Product',
            populate : {
                path : "properties",
                model: 'Property'
            }
        }
    })
    .exec()
    .then(result => {
        res.status(200).json({
            result : "get all restaurant data",
            restaurant : result
        })
    })
    .catch(error => {
        makeMessage("failed to get restaurant by id")
        res.status(500).json({
            message : "error failed to get restaurant by id",
            error : error
        })
    })
})

/*-------------------------------------------------------------------*/
/*------------------------------ post  ----------------------------- */
/*-------------------------------------------------------------------*/

router.post(('/'), (req, res, next) => {

    const newRestaurant = new Restaurant({
        _id : new mongoose.Types.ObjectId(),
        name : req.body.name,
        english : req.body.english,
        priceUnit : req.body.priceUnit
    })

    newRestaurant.save()
    .then(result => {
        makeMessage("success to post restaurant");
        makeMessage(result);
        res.status(201).json(result);
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            discription : "failed to post restaurant",
            error : error
        });
    });

});

/*-------------------------------------------------------------------*/
/*--------------------------------- patch  ------------------------- */
/*-------------------------------------------------------------------*/

router.patch(('/:restaurantId'), (req, res, next) => {
    Restaurant.update({_id : req.params.restaurantId}, {$set : req.body})
    .exec()
    .then(result => {
        makeMessage("success to update restaurant");
        makeMessage(req.body);
        res.status(200).json({
            restaurantId : req.params.restaurantId,
            request : req.body,
            result : result
        });
    })
    .catch(error => {
        makeMessage("failed to update restaurant");
        makeMessage(error);
        res.status(500).json({
            discription : "failed to patch restaurant",
            error : error
        });
    });
});

/*-------------------------------------------------------------------*/
/*------------------------ delete all ------------------------------ */
/*-------------------------------------------------------------------*/

router.delete(('/deletaAll'), (req, res, next) => {
    Restaurant.remove({})
    .exec()
    .then(result => {
        res.status(200).json(result);
    })
    .catch(error => {
        res.status(500).json({
            discription : "failed to delete all restaurantIfo",
            error : error
        });
    });
});

/*-------------------------------------------------------------------*/
/*----------------------------- delete  ---------------------------- */
/*-------------------------------------------------------------------*/

router.delete(('/:restaurantId'), (req, res, next) => {

    const RestaurantId = req.params.restaurantId;
    var categoriesId = [];
    const productsId = [];
    const propertiesId = [];

    findCategoriesId();

    function findCategoriesId(){
        makeMessage("getting categories Id ...");
        Restaurant.findById(RestaurantId)
        .exec()
        .then(result => {
            categoriesId = result.categories;
            findProductsId();
        })
        .catch(error => {
            makeMessage("failed to get categories Id/ delete restaurant");
            res.status(500).json({
                discription : "failed to get categories Id/ delete restaurant",
                error : error
            })
        })
    }

    function findProductsId(){
        makeMessage("getting Products Id ...");

        Category.find({_id : { $in : categoriesId }})
        .exec()
        .then(result => {
            for(i in result){
                const theCategoryProductsId = result[i].products;
                for(j in theCategoryProductsId){
                    productsId.push(theCategoryProductsId[j]);
                }
            }
            findPropertiesId();
        })
        .catch(error => {
            makeMessage("failed");
            res.status(500).json({
                message : "failed to get products Id /delete restaurant",
                error : error
            })
        })
    }

    function findPropertiesId(){
        makeMessage("getting Properties Id ...");

        Product.find({_id : { $in : productsId }})
        .exec()
        .then(result => {
            for(i in result){
                const theProductPropertiesId = result[i].properties;
                for(j in theProductPropertiesId){
                    propertiesId.push(theProductPropertiesId[j]);
                }
            }
            deleteProperties();
        })
        .catch(error => {
        })
    }

    function deleteProperties(){
        makeMessage("deleting Properties Id ...");
        Property.deleteMany({_id : {$in : propertiesId}})
        .exec()
        .then(result => {
            makeMessage("deleting properties done 100%");
            deleteProducts();
        })
        .catch(error => {
            makeMessage("failed");
            res.status(500).json({
                description : "failed to deleting properties",
                error : error
            });
        });
    }

    function deleteProducts(){
        makeMessage("deleting Products Id ...");
        Product.deleteMany({_id : {$in : productsId}})
        .exec()
        .then(result => {
            makeMessage("deleting products done 100%");
            deleteCategories();
        })
        .catch(error => {
            makeMessage("failed");
            res.status(500).json({
                description : "failed to deleting products",
                error : error
            });
        });
    }

    function deleteCategories(){
        makeMessage("deleting categories Id ...");
        Category.deleteMany({_id : {$in : categoriesId}})
        .exec()
        .then(result => {
            makeMessage("deleting categories done 100%");
            deleteRestaurantById();
        })
        .catch(error => {
            makeMessage("failed");
            res.status(500).json({
                description : "failed to delete categories",
                error : error
            });
        });
    }

    function deleteRestaurantById(){
        makeMessage("deleting restaurant ...");
        Restaurant.findOneAndDelete(RestaurantId)
        .exec()
        .then(result => {
            res.status(200).json({
                restaurantIds : RestaurantId,
                categoriesId : categoriesId,
                productsId : productsId,
                properties : propertiesId,
                df : "asdf"
            })
        })
        .catch(error => {
            res.status(500).json(error);
        })
        
    }


});

function makeMessage(message){
    if(true){
        console.log(message);
    }
}

module.exports = router;