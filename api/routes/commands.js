const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const CommandInfo = require('../modules/chef/commadInfo');
const Restaurant = require('../modules/restaurant');

const maxTime = 3600 * 24

/*-------------------------------------------------------------------*/
/*-------------------------- get all commands ---------------------- */
/*-------------------------------------------------------------------*/

router.get(('/'), (req, res, next) => {
    CommandInfo.find({})
    .exec()
    .then(result => {
        makeMessage(result);
        res.status(200).json(result);
    })
    .catch(error => {
        makeMessage("get commands failed");
        res.status(500).json({
            error : error,
            disription : "failed to get commands"
        })
    })
})

/*-------------------------------------------------------------------*/
/*------------------- get all restaurant commands ------------------ */
/*-------------------------------------------------------------------*/

router.get(('/:restaurantId'), (req, res, next) => {

    const restaurantId = req.params.restaurantId;
    const time = parseInt(new Date().getTime() / 1000);
    const wantToDelte = [];
    const commandsStayed = [];
    const finalResult = [];

    findCommandsInfo();

    function findCommandsInfo(){
        Restaurant.findById(restaurantId)
        .populate('commandsInfoIds')
        .exec()
        .then(result => {
            makeMessage("success to get commandsInfo for filter it");
            for(x in result.commandsInfoIds){
                result.commandsInfoIds[x].time = time - result.commandsInfoIds[x].time
                if(result.commandsInfoIds[x].time > maxTime){
                    wantToDelte.push( result.commandsInfoIds[x].id );
                }else{
                    commandsStayed.push( result.commandsInfoIds[x].id );
                    finalResult.push( result.commandsInfoIds[x] );
                }
            }
            deleteCommands();
        })
        .catch(error => {
            failedResponse(error, "failed to get restaurant commandsInfo");
        })
    }

    function deleteCommands(){
        CommandInfo.deleteMany({_id : {$in : wantToDelte}})
        .exec()
        .then(result => {
            makeMessage("success to delete old commands");
            makeMessage(wantToDelte);
            updateRestaurant();
        })
        .catch(error => {
            failedResponse(error, "failed to delete old commands");
        })
    }

    function updateRestaurant(){
        Restaurant.updateOne({_id : restaurantId}, {$set : {commandsInfoIds : commandsStayed}})
        .exec()
        .then(result => {
            successResponse(finalResult, "success to update restaurant commandsInfo");
            makeMessage("success");
        })
        .catch(error => {
            failedResponse(error, "failed to update commandsInfo of restaurant");
        })
    }

    function successResponse(result, message){
        makeMessage(message);
        //makeMessage(result);
        res.status(201).json(result);
    }

    function failedResponse(error, message){
        makeMessage(error);
        makeMessage(error);
        res.status(500).json({
            discription : message,
            error : error
        });
    }

})


/*-------------------------------------------------------------------*/
/*--------------------------- get  commandIndo --------------------- */
/*-------------------------------------------------------------------*/

router.get(('/:restaurantId/:commandInfoId'), (req, res, next) => {

    const commandInfoId = req.params.commandInfoId;

    CommandInfo.findById(commandInfoId)
    .exec()
    .then(result => {
        successResponse(result, "success to  commandsInfo");
    })
    .catch(error => {
        failedResponse(error, "failed to get commandsInfo");
    })

    function successResponse(result, message){
        makeMessage(message);
        makeMessage(result);
        res.status(201).json(result);
    }

    function failedResponse(error, message){
        makeMessage(error);
        makeMessage(error);
        res.status(500).json({
            discription : message,
            error : error
        });
    }
})

/*-------------------------------------------------------------------*/
/*--------------------------- post commandInfo --------------------- */
/*-------------------------------------------------------------------*/

router.post(('/:restaurantId'), (req, res, next) => {

    var finalResult = ""
    const restaurantId = req.params.restaurantId
    const commandInfoId = new mongoose.Types.ObjectId();
    const date = new Date();
    const timeInSeconde = parseInt(date.getTime() / 1000);
    const table = req.body.table;
    const theCommands = req.body.theCommands;

    saveNewCommandInfo();

    function saveNewCommandInfo(){

        const newCommandInfo = new CommandInfo({
            _id : commandInfoId,
            time : timeInSeconde,
            table : table,
            theCommands : theCommands
        });

        newCommandInfo.save()
        .then(result => {
            finalResult = result;
            updateRestaurant();
        })
        .catch(error => {
            failedResponse(error, "failed to post newCommandInfo (post commandInfo)")
        })
    }

    function updateRestaurant(){
        Restaurant.updateOne({_id : restaurantId}, {$push : {commandsInfoIds : commandInfoId} })
        .exec()
        .then(result => {
            makeMessage("success update restaurant (post commandInfo)");
            successResponse(finalResult, "success update restaurant (post commandInfo)");
        })
        .catch(error => {
            failedResponse(error, "failed to update restaurant (post commandInfo)");
        })
    }

    function successResponse(result, message){
        makeMessage(message);
        makeMessage(result);
        res.status(201).json(result);
    }

    function failedResponse(error, message){
        makeMessage(error);
        makeMessage(error);
        res.status(500).json({
            discription : message,
            error : error
        });
    }

});

/*-------------------------------------------------------------------*/
/*-------------------------- putch commandInfo --------------------- */
/*-------------------------------------------------------------------*/

router.patch(('/:commandInfoId'), (req, res) => {

    const commandInfoId = req.params.commandInfoId;

    CommandInfo.updateOne({_id : commandInfoId}, {$set : req.body})
    .exec()
    .then(result => {
        successResponse(result, "success putch commandInfo");
    })
    .catch(error => {
        failedResponse(error, "failed putch commandInfo");
    })

    function successResponse(result, message){
        makeMessage(message);
        makeMessage(result);
        res.status(201).json(result);
    }

    function failedResponse(error, message){
        makeMessage(error);
        makeMessage(error);
        res.status(500).json({
            discription : message,
            error : error
        });
    }

});

/*-------------------------------------------------------------------*/
/*------------------------- delete commandInfo --------------------- */
/*-------------------------------------------------------------------*/

router.delete(('/:restaurantId/:commandInfoId'), (req, res, next) => {

    const restaurantId = req.params.restaurantId;
    const commandInfoId = req.params.commandInfoId;

    deleteThecommandInfo();

    function deleteThecommandInfo(){
        CommandInfo.findByIdAndRemove(commandInfoId)
        .exec()
        .then(result => {
            makeMessage("success to delete commandInfo...");
            findRestaurant();
        })
        .catch(error => {
            failedResponse(error, "failed to delete commandInfo");
        })
    }

    function findRestaurant(){
        Restaurant.findById(restaurantId)
        .exec()
        .then(result => {
            makeMessage("success to find Restaurant ...");
            const index = result.commandsInfoIds.indexOf(commandInfoId);
            if (index > -1) {
                result.commandsInfoIds.splice(index, 1);
            }
            updaterestaurant(result.commandsInfoIds)
        })
        .catch(error => {
            failedResponse(error, "failed to findRestaurant (deleteThecommandInfo)")
        })
    }

    function updaterestaurant(newcommandsInfoList){
        Restaurant.updateOne({_id : restaurantId}, {$set : {commandsInfoIds : newcommandsInfoList}})
        .exec()
        .then(result => {
            successResponse(result, "success delete the commandInfoId from restaurant");
        })
        .catch(error => {
            failedResponse(error, "failed to updaterestaurant (deleteThecommandInfo)")
        })
    }

    function successResponse(result, message){
        makeMessage(message);
        makeMessage(result);
        res.status(201).json(result);
    }

    function failedResponse(error, message){
        makeMessage(error);
        makeMessage(error);
        res.status(500).json({
            discription : message,
            error : error
        });
    }
});

function makeMessage(message){
    if(true){
        console.log(message);
    }
}

module.exports = router;