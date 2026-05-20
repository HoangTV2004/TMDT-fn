const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs')
const ASSETS_PATH = path.join(__dirname, 'assets');

router.get("/view/:category/:fileName", (req,res) => {
    const {category, fileName} = req.params;
    const imageUrl = `${req.protocol}://${req.get('host')}/images/${category}/${fileName}`;
    res.json({url: imageUrl})
})

router.get("/", async (req, res)=>{
    try{
        console.log("File server đã sẵn sàng ở cổng 8081!");
        res.send("File server đã sẵn sàng ở cổng 8081!");

    }catch(err){

    }
})



module.exports = router;