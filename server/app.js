const express = require('express');
const cors = require('cors')
const webScripting = require("./logic");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors())
app.use(express.json());

app.post('/singleDate', async (req, res) => {
    let date = req.body.date;
    console.log(date);
    try {
        let currenciesResponse = await webScripting.getCurrencies(date);
        res.status(currenciesResponse.success ? 200 : 600).send(currenciesResponse.success ? currenciesResponse.data : currenciesResponse.message);
    } catch (error) {
        res.status(400).send(`Failed to get ${date} data`)
    }
})
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