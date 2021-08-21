const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

const Category = require('../modules/category');
const Product = require('../modules/product');
const Property = require('../modules/property');

/*-------------------------------------------------------------------*/
/*-------------------------- get all Products ---------------------- */
/*-------------------------------------------------------------------*/

router.get(('/'), (req, res, next) => {
    printConsole("geting all Products");

    Product.find()
    .exec()
    .then(result => {
        printConsole(result);
        res.status(200).json(result);
        printConsole("----success ------");
    })
    .catch(err => {
        printConsole(err);
        res.status(500).json({
            description : "Get all Products",
            error : err
        });
        printConsole("----failed geting all Products ------");
    });
});


/*-------------------------------------------------------------------*/
/*------------------------ get  Product by id  --------------------- */
/*-------------------------------------------------------------------*/

router.get(('/:productId'), (req, res, next) => {
    printConsole("geting the product by id ...");

    const id = req.params.productId;
    Product.findById(id)
    .exec()
    .then(doc => {
        if (doc){
            printConsole(doc);
            res.status(200).json(doc);
            printConsole("----success ------");
        }else{
            res.status(404).json({
                description : "get product by id",
                error : "not fond"
            });
            printConsole("----failed geting the product by id ------");
        }
    })
    .catch(err => {
        printConsole(err);
        res.status(500).json({
            description : "get product by id",
            error : err
        });
        printConsole("----failed geting the product by id ------");
    });
})

/*-------------------------------------------------------------------*/
/*--------------- get all products properties  --------------------- */
/*-------------------------------------------------------------------*/

router.get(('/:productId/properties'), (req, res, next) => {

    //assuming that the product is already exist 
    //the result is a list of proerties
    const productId = req.params.productId;
    Product.findById(productId)
    .exec()
    .then(result => {
        printConsole("getting  product  ...");
        printConsole(result);
        getProductProperties(result.properties);
    })
    .catch(error => {
        printConsole(error)
        res.status(500).json({
            description : "Error : getting product for getting properties failed.",
            error : error
        });
        printConsole("-------failed to get product properties-------");
    });

    function getProductProperties(properties){
        Property.find({_id : {$in : properties}})
        .exec()
        .then(result => {
            printConsole("getting all product properties ...");
            printConsole(result);
            res.status(200).json(result);
            printConsole("------succeess-------");
        })
        .catch(error => {
            printConsole(error);
            res.status(500).json({
                description : "Error : getting product properties failed."
            });
            printConsole("-------failed to get product properties-------");
        });
    }

});


/*-------------------------------------------------------------------*/
/*-------------------------- patch product  ------------------------ */
/*-------------------------------------------------------------------*/

router.patch(('/:productId'), (req, res, next) => {

    const id = req.params.productId;
    Product.update({_id : id}, {$set : req.body })
    .exec()
    .then(result => {
        printConsole("----patching the product ------");
        printConsole(result);
        res.status(200).json({
            productId : id
        });
        printConsole("---- success ------");
    })
    .catch(err => {
        printConsole(err);
        res.status(500).json({
            error : err
        });
        printConsole("---- failed to patching the product ------");
    });
});

/*-------------------------------------------------------------------*/
/*--------------------- delete all products  ----------------------- */
/*-------------------------------------------------------------------*/

router.delete(('/deleteAll'), (req, res, next) => {
    printConsole("delete all products.");

    Product.remove({})
    .exec()
    .then(result => {
        res.status(200).json(result)
    })
    .catch(error => {
        res.status(500).json(error)
    })
})

/*-------------------------------------------------------------------*/
/*-------------------------- delete product  ----------------------- */
/*-------------------------------------------------------------------*/

router.delete(('/:categoryId/:productId'), (req, res, next) => {
    
    const productId = req.params.productId;
    const categoryId = req.params.categoryId;
    const productsProperties = []

    Product.findByIdAndRemove({_id : productId})
    .exec()
    .then(result => {
        printConsole("removing the product");
        printConsole(result);

        for(prop in result.properties){
            productsProperties.push(result.properties[prop]);
        }
        removeProductProperties();
        removeProductImageFromCloudinary(result.publicIdOfImage);
    })
    .catch(err => {
        printConsole(err);
        res.status(500).json({
            error : err
        });
        printConsole("---- failed removing the product ----");
    });

    function removeProductImageFromCloudinary(publicIdOfImage){
        cloudinary.uploader.destroy(publicIdOfImage,
        function(error,result) {
            console.log(result, error);
        });
    }

    function removeProductProperties(){

        Property.remove({_id : {$in : productsProperties}})
        .exec()
        .then(result => {
            printConsole("removing properties");
            getTheCategory();
        })
        .catch(error => {
            printConsole("failed removing properties")
            printConsole(error);
            res.status(500).json({
                description : "failed removing properties",
                error : error
            });
        });
    }

    //get the category
    function getTheCategory(){
        Category.findById(categoryId)
        .exec()
        .then(result => {
            printConsole("getting the category for updating it ...");
            patchCategory(result);
        })
        .catch(error => {
            printConsole(error);
            res.status(500).json({
                description : "failed getting the category for updating it",
                error : error
            });
            printConsole("failed getting the category for updating it ...");
        });
    }

    //patch category
    function patchCategory(theCategory){

        //new products in the category
        const index = theCategory.products.indexOf(productId);
        if (index > -1) {
            theCategory.products.splice(index, 1);
        }

        Category.updateOne({_id : categoryId}, {$set : {
            name : theCategory.name,
            products : theCategory.products
        }})
        .exec()
        .then(result => {
            printConsole("patching the category for updating it ...");
            printConsole(result);
            res.status(200).json({
                status : "delete success",
                productId : productId,
                properties : productsProperties,
                status : "patch success",
                category : categoryId,
                result : result
            });
            printConsole("success to update the category");
            printConsole("----success -----");
        })
        .catch(error => {
            printConsole(error);
            res.status(500).json({
                description : "failed to update the category",
                error : error
            });
            printConsole("failed to update the category");
        });       
    }

});




const consolePrint = true;
function printConsole(message){
    if (consolePrint){
        console.log(message);
    }
}

module.exports = router;