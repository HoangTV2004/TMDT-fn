const express = require('express');
const cors = require('cors');
const path = require('path');

const router = require('./PhotoRouter.jsx');
const app = express();
app.use(cors());
app.use(express.json());
app.use("/photo", router);
app.use('/images', express.static(path.join(__dirname, 'assets')));
app.listen(8081, () => {
    console.log("File server is running !!!");
})