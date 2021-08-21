const experss = require('express');
const router = experss.Router();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

const Restaurant = require('../modules/restaurant');
const Category = require('../modules/category');
const Product = require('../modules/product');
const Property = require('../modules/property');

/*-------------------------------------------------------------------*/
/*-------------------------- get all categories -------------------- */
/*-------------------------------------------------------------------*/

router.get(('/'), (req, res, next) => {
    printConsole("get all categories");

    Category.find()
    .exec()
    .then(result => {
        printConsole(result);
        res.status(200).json(result);
    })
    .catch(error => {
        printConsole(error);
        res.status(500).json({
            description : "Get all categories",
            err : error
        });
    });
});

/*-------------------------------------------------------------------*/
/*-------------- get all products of an category by id ------------- */
/*-------------------------------------------------------------------*/
//the result is a list of products

router.get(('/:categoryId/products'), (req, res, next) => {
    printConsole("get category products");

    //category id
    const id = req.params.categoryId;

    //Products Ids that belong to this Category
    //assuming that category is exist
    const productsCategory = [];

    Category.findById(id)
    .exec()
    .then(result => {
        printConsole(result);
        const productIds = result.products;
        for(x in productIds){
            productsCategory.push(mongoose.Types.ObjectId(productIds[x]));
        }
        findCategoryProducts()
    })
    .catch(error => {
        printConsole(error);
        res.status(500).json({
            description : "Get category for get its products",
            error : error
        });
    });

    function findCategoryProducts(){
        Product.find({_id : {$in : productsCategory}})
        .exec()
        .then(result => {
            printConsole(result);
            res.status(200).json(result)
        })
        .catch(error => {
            printConsole(error);
            res.status(500).json({
                description : "Get category products",
                error : error
            });
        });
    }
});

/*-------------------------------------------------------------------*/
/*-------------- get all restaurant categories  -------------------- */
/*-------------------------------------------------------------------*/

router.get(('/:restaurantId'), (req, res, next) => {
    printConsole("getting restaurant categories ...")

    const restaurantId = req.params.restaurantId
    Restaurant.findById(restaurantId)
    .exec()
    .then(result => {
        printConsole("success to get restaurant categories id");
        populateCategories(result.categories);
    })
    .catch(error => {
        printConsole("failed");
        res.status(500).json({
            discription : "failed to get restaurant categries id",
            error : error
        })
    })

    function populateCategories(categories){
        Category.find({_id : {$in : categories}})
        .exec()
        .then(result => {
            printConsole("success pipulate categories id");
            res.status(201).json(result)
        })
        .catch(error => {
            printConsole("failed populate categories id");
            res.status(500).json({
                discription : "failed populate categories id",
                error : error
            })
        })
    }
})

/*-------------------------------------------------------------------*/
/*---------------------------- post -------------------------------- */
/*-------------------------------------------------------------------*/


router.post(('/:restaurantId'), (req, res, next) => {
    printConsole("post category");

    restaurantId = req.params.restaurantId;
    categoryId = new mongoose.Types.ObjectId();

    const categry = new Category({
        _id : categoryId,
        name : req.body.name,
        products : req.body.products
    });
    categry
    .save()
    .then(result => {
        printConsole(result)
        putchRestaurant();
    })
    .catch(error => {
        printConsole(error)
        res.status(500).json({
            description : "post category",
            error : error
        });
    });

    function putchRestaurant(){
        Restaurant.updateOne({_id : restaurantId}, {$push : {categories : categry}})
        .exec()
        .then(result => {
            printConsole("success update restaurant");
            printConsole("new added category Id : " + categoryId);
            printConsole("updated restaurant : "+ restaurantId);
            res.status(201).json({
                categoryId : categoryId,
                restaurantId : restaurantId,
                result : result
            })
        })
        .catch(error => {
            printConsole("failed update restaurant");
            printConsole("category Id : " + categoryId);
            printConsole("restaurant : "+ restaurantId);
            res.status(201).json({
                categoryId : categoryId,
                restaurantId : restaurantId,
                error : error
            })
        })
    }
});

/*-------------------------------------------------------------------*/
/*---------------------------- patch ------------------------------- */
/*-------------------------------------------------------------------*/

router.patch(('/:categoryId'), (req, res, next) => {
    printConsole("patch category ...");

    const id = req.params.categoryId;

    Category.updateOne({_id : id}, {$set : req.body })
    .exec()
    .then(result => {
        printConsole("patching the category  ...");
        printConsole(result);
        res.status(200).json({
            categoryId : id,
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


});

/*-------------------------------------------------------------------*/
/*--------------------- delete all categories  ----------------------- */
/*-------------------------------------------------------------------*/

router.delete(('/deleteAll'), (req, res, next) => {
    printConsole("delete all categories.");

    Category.remove({})
    .exec()
    .then(result => {
        res.status(200).json(result)
    })
    .catch(error => {
        res.status(500).json(error)
    })
})


/*-------------------------------------------------------------------*/
/*---------------------------- delete ------------------------------ */
/*-------------------------------------------------------------------*/

router.delete(('/:restaurantId/:categoryId'), (req, res, next) => {
    printConsole("delete category");

    //Category Id
    const id = req.params.categoryId;
    const restaurantId = req.params.restaurantId;

    //Products Ids that belong to this Category
    //assuming that category is exist
    const categoryProducts = [];
    const productsProperties = [];
    const productPublicImageIDs = [];

    //delete the category and get the products id
    Category.findByIdAndRemove(id)
    .exec()
    .then(result => {
        printConsole(result);
        const productIds = result.products;
        for(x in productIds){
            categoryProducts.push(mongoose.Types.ObjectId(productIds[x]));
        }
        updateRestaurantCategories()
    })
    .catch(error => {
        printConsole(error);
        res.status(500).json({
            description : "Failed to deleting category",
            error : error
        });
    });

    function updateRestaurantCategories(){
        Restaurant.findById(restaurantId)
        .exec()
        .then(result => {
            const index = result.categories.indexOf(id);
            if (index > -1) {
                result.categories.splice(index, 1);
            }
            updaterestaurant(result.categories)
        })
        .catch(error => {
            printConsole("failed to get restaurant category");
            res.status(500).json({
                discription : "failed to get restaurant categories",
                error : error
            })
        })
        //Restaurant.updateOne()
    }

    function updaterestaurant(newCategoriesList){
        printConsole("update restaurant");
        Restaurant.updateOne({_id : restaurantId}, {$set : {categories : newCategoriesList}})
        .exec()
        .then(result => {
            printConsole("success to update restaurant 100%");
            findPropertiesAndPublicIds();
        })
        .catch(error => {
            printConsole("failed to update restaurant");
            res.status(500).json({
                message : "failed to update restaurant",
                error : error
            })
        })
    }

    //get the properties id and delete the products
    function findPropertiesAndPublicIds(){

        Product.find({_id : { $in : categoryProducts }})
        .exec()
        .then(result => {
            printConsole("finding properties");
            for(ob in result){
                for (prop in result[ob].properties){
                    productsProperties.push(result[ob].properties[prop]);
                }
                if(result[ob].publicIdOfImage != ""){
                    productPublicImageIDs.push(result[ob].publicIdOfImage);
                }
            }
            deleteImages();
            deleteProducts();
        })
        .catch(error => {
            printConsole(error);
            res.status(500).json({
                description : "failed to find properties",
                error : error
            });
        }); 

    }
    
    function deleteImages(){
        for(i in productPublicImageIDs){
            removeProductImageFromCloudinary(productPublicImageIDs[i]);
        }
    }

    function removeProductImageFromCloudinary(publicIdOfImage){
        cloudinary.uploader.destroy(publicIdOfImage,
        function(error,result) {
            console.log(result, error);
        });
    }

    function deleteProducts(){

        Product.remove({_id : {$in : categoryProducts}})
        .exec()
        .then(result => {
            printConsole("deleting products");
            delteProperties()
        })
        .catch(error => {
            printConsole(error);
            res.status(500).json({
                description : "failed to deleting products",
                error : error
            });
        });
    }

    function delteProperties(){

        Property.remove({_id : {$in : productsProperties}})
        .exec()
        .then(result => {
            printConsole("removing properties");
            res.status(200).json({
                statue : "Seccess deleting",
                restaurantId : restaurantId,
                categoryId : id,
                productsId : categoryProducts,
                propertiesId : productsProperties, 
                result : result
            })
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

    

});

const consolePrint = true;
function printConsole(message){
    if (consolePrint){
        console.log(message);
    }
}

module.exports = router;