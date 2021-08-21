const express = require('express');
const router = express.Router();
const mongose = require('mongoose');

const Product = require('../modules/product');
const Property = require('../modules/property');

/*-------------------------------------------------------------------*/
/*-------------------------- get all Properties -------------------- */
/*-------------------------------------------------------------------*/

router.get(('/'), (req, res, next) => {
    printConsole("geting all Properties");

    Property.find()
    .exec()
    .then(result => {
        printConsole(result);
        res.status(200).json(result);
        printConsole("----success ------");
    })
    .catch(err => {
        printConsole(err);
        res.status(500).json({
            description : "Get all Properties",
            error : err
        });
        printConsole("----failed geting all Properties ------");
    });
});

/*-------------------------------------------------------------------*/
/*------------------------ get Property by Id ---------------------- */
/*-------------------------------------------------------------------*/

router.get(('/:PropertyId'), (req, res, next) => {
    printConsole("geting the Property by id ...");

    const id = req.params.PropertyId;
    Property.findById(id)
    .exec()
    .then(doc => {
        if (doc){
            printConsole(doc);
            res.status(200).json(doc);
            printConsole("----success ------");
        }else{
            res.status(404).json({
                description : "get Property by id",
                error : "not fond"
            });
            printConsole("----failed geting the Property by id ------");
        }
    })
    .catch(err => {
        printConsole(err);
        res.status(500).json({
            description : "get Property by id",
            error : err
        });
        printConsole("----failed geting the Property by id ------");
    });
})

/*-------------------------------------------------------------------*/
/*------------------------ get property details -------------------- */
/*-------------------------------------------------------------------*/

router.get(('/:propertyID/details'), (req, res, next) => {

    //assuming that the product is already exist 
    const propertyID = req.params.propertyID;
    Property.findById(propertyID)
    .exec()
    .then(result => {
        printConsole("getting  Property  ...");
        printConsole(result);
        res.status(200).json(result.details);
    })
    .catch(error => {
        printConsole(error)
        res.status(500).json({
            description : "Error : getting Property for getting details failed.",
            error : error
        });
        printConsole("-------failed to get Property details-------");
    });

});

/*-------------------------------------------------------------------*/
/*------------------------ prost property  ------------------------- */
/*-------------------------------------------------------------------*/

router.post(('/:productId'), (req, res, next) => {

    const propertyId = new mongose.Types.ObjectId();
    //Id of the category that the product belong to it
    const productId = req.params.productId;

    //create a new property
    const property = new Property({
        _id : propertyId,
        name : req.body.name,
        require : req.body.require,
        max : req.body.max,
        min : req.body.min,
        details : req.body.details
    });
    property
    .save()
    .then(result => {
        printConsole("posting property ...");
        printConsole(result);
        getTheProduct();
    })
    .catch(err => {
        printConsole(err);
        res.status(500).json({
            description : "post a property",
            error : err
        });
        printConsole("failed to posting property.");
    });

    //get the product
    function getTheProduct(){
        Product.findById(productId)
        .exec()
        .then(result => {
            printConsole("getting the product for updating it ...");
            patchProduct(result);
        })
        .catch(error => {
            printConsole(error);
            res.status(500).json({
                description : "getting the product for updating it",
                error : error
            });
            printConsole("failed getting the product for updating it ...");
        });
    }

    //patch product
    function patchProduct(theProduct){

        //new products in the category
        theProduct.properties.push(propertyId);

        Product.updateOne({_id : productId}, {$set : {
            properties : theProduct.properties
        }})
        .exec()
        .then(result => {
            printConsole("patching the Product for updating it ...");
            printConsole(result);
            res.status(201).json({
                propertyId : propertyId,
                result : result
            });
            printConsole("success to update the Product");
        })
        .catch(error => {
            printConsole(error);
            res.status(500).json({
                description : "update Product by adding property",
                error : error
            });
            printConsole("failed to update the Product");
        });       
    }
});

/*-------------------------------------------------------------------*/
/*-------------------------- patch property  ----------------------- */
/*-------------------------------------------------------------------*/

router.patch(('/:propertyId'), (req, res, next) => {

    const id = req.params.propertyId;
    Property.update({_id : id}, {$set : req.body})
    .exec()
    .then(result => {
        printConsole("---- patching the property ------");
        printConsole(result);
        res.status(200).json(result);
        printConsole("---- success ------");
    })
    .catch(err => {
        printConsole(err);
        res.status(500).json({
            error : err
        });
        printConsole("---- failed to patching the property ------");
    });
});

/*-------------------------------------------------------------------*/
/*--------------------- delete all properties  ----------------------- */
/*-------------------------------------------------------------------*/

router.delete(('/deleteAll'), (req, res, next) => {
    printConsole("delete all properties.");

    Property.remove({})
    .exec()
    .then(result => {
        res.status(200).json(result);
    })
    .catch(error => {
        res.status(500).json(error);
    })
})



/*-------------------------------------------------------------------*/
/*-------------------------- delete property ----------------------- */
/*-------------------------------------------------------------------*/

router.delete(('/:productId/:propertyId'), (req, res, next) => {
    const productId = req.params.productId;
    const propertyId = req.params.propertyId;

    Property.remove({_id : propertyId})
    .exec()
    .then(result => {
        printConsole("removing the property");
        printConsole(result);
        getTheProduct();
    })
    .catch(err => {
        printConsole(err);
        res.status(500).json({
            error : err
        });
        printConsole("---- failed removing the property ----");
    });


    //get the category
    function getTheProduct(){
        Product.findById(productId)
        .exec()
        .then(result => {
            printConsole("getting the product for updating it ...");
            patchProduct(result);
        })
        .catch(error => {
            printConsole(error);
            res.status(500).json({
                description : "failed getting the product for updating it",
                error : error
            });
            printConsole("failed getting the product for updating it ...");
        });
    }

    //patch category
    function patchProduct(theProduct){

        //new products in the category
        const index = theProduct.properties.indexOf(propertyId);
        if (index > -1) {
            theProduct.properties.splice(index, 1);
        }

        Product.updateOne({_id : productId}, {$set : {
            properties : theProduct.properties
        }})
        .exec()
        .then(result => {
            printConsole("patching the product for updating it ...");
            printConsole(result);
            res.status(200).json({
                result : result
            });
            printConsole("success to update the product");
            printConsole("----success -----");
        })
        .catch(error => {
            printConsole(error);
            res.status(500).json({
                description : "failed to update the product",
                error : error
            });
            printConsole("failed to update the product");
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