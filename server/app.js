const express = require('express');
const cors = require('cors');

// logic layer import
const webScripting = require("./logic");

// generate server
const app = express();
const port = process.env.PORT || 3000;
app.use(cors())
app.use(express.json());

// route for single date request
app.post('/singleDate', async (req, res) => {
    let date = req.body.date;
    try {
        let currenciesResponse = await webScripting.getCurrencies(date);
        res.status(currenciesResponse.success ? 200 : 600).send(currenciesResponse.success ? currenciesResponse.data : currenciesResponse.message);
    } catch (error) {
        res.status(400).send(`Failed to get ${date} data`)
    }
})

// route for range dates request
app.post('/rangeDates', async (req, res) => {
    let { start , end , coins} = req.body;
    try {
        let rangeCurrenciesResponse = await webScripting.getRangeDatesCurrencies(start,end,coins);
        res.status(200).send(rangeCurrenciesResponse.data);
    } catch (error) {
        res.status(400).send(`Failed to get ${start}-${end} data`)
    }
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})