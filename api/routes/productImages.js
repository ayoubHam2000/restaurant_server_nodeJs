const express = require('express');
const router = express.Router();
const mongose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');


const Category = require('../modules/category');
const Product = require('../modules/product');

/*-------------------------------------------------------------------*/
/*-------------------------- get all images ------------------------ */
/*-------------------------------------------------------------------*/

const storage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null, './images/');

    },
    filename : function(req, file, cb){
        cb(null, "newProduct.jpg");
    }
});

const upload = multer({
    storage : storage, 
    limits : {fileSize : 1024*512}, //1024*512
    //fileFilter : fileFilter
});


router.post("/:categoryId", upload.single('productImage'), (req, res, next) => {
    //if you want to upload it just in local server for test
    const test = false
    //about Product
    const productId = new mongose.Types.ObjectId();
    const productName = [req.body.frenchName, req.body.englishName];
    const productDetail = [req.body.frenchDetail, req.body.englishDetail];
    const productPrice = req.body.price;
    const productDiscount = req.body.discount;
    const productProperties = [];
    const date = new Date();
    const imageCreatedTime = parseInt(date.getTime() / 1000);

    //about RestaurantId
    const restautantId = req.body.restaurantId;

    //Id of the category that the product belong to it
    const categoryId = req.params.categoryId;

    if(test){
        createProduct("", "");
    }else{
        createAndUploadProductImage();
    }

    //upload image to cloudinary
    function createAndUploadProductImage(){
        cloudinary.uploader.upload(req.file.path, 
            { folder: restautantId , public_id: productId, timeout:9000 },
            function(error, result) {
                printConsole(result, error);
                if(!error){
                    printConsole("succeess upload image");
                    printConsole("URL : " + result.secure_url)
                    createProduct(result.secure_url, result.public_id);
                }else{
                    printConsole("failed to upload image")
                    printConsole(error)
                    res.status(500).json({
                        discription : "failed to upload image",
                        error : error
                    })
                }
            }
        );
    }

    //create a new product
    function createProduct(productURL, public_id){
        const product = new Product({
            _id : productId,
            name : productName,
            price : productPrice,
            discount : productDiscount,
            details : productDetail,
            properties : productProperties,
            imageUrl : productURL,
            publicIdOfImage : public_id,
            imageCreatedTime : imageCreatedTime
        });
        product
        .save()
        .then(result => {
            printConsole("posting product ...");
            printConsole(result);
            getTheCategory();
        })
        .catch(err => {
            printConsole(err);
            res.status(500).json({
                description : "post a product",
                error : err
            });
            printConsole("failed to posting product.");
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
                description : "getting the category for updating it",
                error : error
            });
            printConsole("failed getting the category for updating it ...");
        });
    }

    //patch category
    function patchCategory(theCategory){

        //new products in the category
        theCategory.products.push(productId);

        Category.updateOne({_id : categoryId}, {$set : {
            name : theCategory.name,
            products : theCategory.products,
        }})
        .exec()
        .then(result => {
            printConsole("patching the category for updating it ...");
            printConsole(result);
            res.status(201).json({
                productId : productId
                //result : result
            });
            printConsole("success to update the category");
        })
        .catch(error => {
            printConsole(error);
            res.status(500).json({
                description : "update category by adding product",
                error : error
            });
            printConsole("failed to update the category");
        });       
    }

});


router.patch("/:productId/", upload.single('productImage'), (req, res, next) => {

    const productId = req.params.productId;

    const productName = [req.body.frenchName, req.body.englishName];
    const productDetail = [req.body.frenchDetail, req.body.englishDetail];
    const productPrice = req.body.price;
    const productDiscount = req.body.discount;
    const date = new Date();
    const imageCreatedTime = parseInt(date.getTime() / 1000);

    const restautantId = req.body.restaurantId;

    createAndUploadProductImage();

    //upload image to cloudinary
    function createAndUploadProductImage(){
        cloudinary.uploader.upload(req.file.path, 
            { folder: restautantId , public_id: productId },
            function(error, result) {
                printConsole(result, error);
                if(!error){
                    printConsole("succeess upload image");
                    printConsole("URL : " + result.secure_url)
                    patchProduct(result.secure_url, result.public_id);
                }else{
                    printConsole("failed to upload image")
                    res.status(500).json({
                        discription : "failed to upload image",
                        error : error
                    })
                }
            }
        );
    }

    function patchProduct(productURL, public_id){
        

        Product.update({_id : productId}, {$set : {
            //id and properties still the same.
            name : productName,
            price : productPrice,
            discount : productDiscount,
            details : productDetail,
            imageUrl : productURL,
            imageCreatedTime : imageCreatedTime,
            publicIdOfImage : public_id
        }})
            .exec()
            .then(result => {
                printConsole("----patching the product ------");
                printConsole(result);
                res.status(200).json({
                    productId : productId
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
    }
});



const consolePrint = true;
function printConsole(message){
    if (consolePrint){
        console.log(message);
    }
}

/*

width : result.width,
height : result.height,
format : result.format,
public_id : result.public_id,
created_at : result.created_at,
bytes : result.bytes,
url : result.url,
secure_url : result.secure_url,
original_filename : result.original_filename

*/



module.exports = router;