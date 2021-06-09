const puppeteer = require('puppeteer');

async function getCurrencies(date) {

    // go to currencies page on israel bank website
    const browser = await puppeteer.launch({headless:true});
    const page = await browser.newPage();
    await page.goto("https://www.boi.org.il/he/markets/ExchangeRates/Pages/Default.aspx");
    
    // change date to the wanted user date
    await page.focus('.BoiCalendar');
    await page.$eval('.BoiCalendar',(datePickerInput,date) => {
        return datePickerInput.value = date
    },date);

    // click search button
    let [searchBtn] = await page.$x('//*[@id="btnSearchRateDate"]');
    await searchBtn.click();

    // wait for the new wanted data to render
    await page.waitForFunction((date) => {
        return document.getElementById("hidTempMaxRateDate").value == date || !document.getElementById("hidTempMaxRateDate").value;
    },{},date);

    let isDateValid = await page.$eval('#hidTempMaxRateDate', el => el.value !== '');

    if (!isDateValid) {
        await browser.close();
        return { success: false, message: 'Date has no currencies data' };
    }

    // get the currencies table data without thead & weird 'נומינאלי אפקטיבי' rows
    const tableData = await page.$$eval('.BoiExchangeRateSearchTable tr', trs => trs.slice(1,(trs.length-1)).map(tr => {
        let data = tr.getElementsByClassName('tableTRText');
        return {
            coin: data[0].textContent,
            amount: +data[1].textContent,
            country: data[2].textContent,
            currency: +data[3].textContent
        };
    }));
    await browser.close();

    return {success: true, data: tableData};
}


async function getRangeDatesCurrencies(start,end, coins) {
    // go to currencies page on israel bank website
    const browser = await puppeteer.launch({headless:true});
    const page = await browser.newPage();
    await page.goto("https://www.boi.org.il/he/markets/ExchangeRates/Pages/Default.aspx");

    // go to range dates tab
    let [rangeTabBtn] = await page.$x('//*[@id="BoiPreviousDatesExchangeRatesTabAncor"]');
    await rangeTabBtn.click();

    // grab select element options
    let selectElement = await page.$('#selCurrency');
    let options = await selectElement.getProperties();

    let selectedCoinsValues = []; /* will keep the selected options values */

    for (const option of options.values()) {
        // get every option
        const optionElement = option.asElement();
        if (optionElement){
            // extract option text
          let hText = await optionElement.getProperty("text");
          let text = await hText.jsonValue();
            // check if the user picked this option   
          if(isSelectedCoin(text,coins)){
            // extract option value ('5'/'6'...)
            let hValue = await optionElement.getProperty("value");
            let value = await hValue.jsonValue();
            selectedCoinsValues.push(value); /* save value to an array*/
          }
        }
      }

    await page.select('#selCurrency',...selectedCoinsValues); /* select all the coins that the user picked */
    
    // change dates to the wanted user date
    await page.focus('.BoiCalendar');
    await page.$eval('#txtDateStart',(dateStartInput, start) => {
        return dateStartInput.value = start;
    },start);
    await page.$eval('#txtDateEnd',(dateEndInput, end) => {
        return dateEndInput.value = end
    },end);
    
    // click the search button
    await page.$eval('#btnSearchPreviousDates', (elem) => elem.click());

    // wait for results to render
    await page.waitForSelector('.BoiPreviousDatesExchangeRates')
    
        const tableData = await page.$$eval('.BoiPreviousDatesExchangeRates tr', trs => trs.map((tr,index) => {

            // load table header row data 
            if (index == 0) {
                let rows = Array.from(tr.children);
                return rows.map(th => {
                    return th.textContent;
                });
            }
            // load the rest of the data - all dates & coin values
            else{
                let rows = Array.from(tr.children);
                return rows.map(td => {
                    return td.querySelector(".tableTRText").textContent;
                });
            }
        }));


    await browser.close();

    return {success: true, data: tableData};
}

function isSelectedCoin(coin , userRequestedCoins) {
    for (const userCoinName of userRequestedCoins) {
        if (coin.includes(userCoinName)) {
            return true;
        }
    }
    return false;
}

module.exports = {
    getCurrencies,
    getRangeDatesCurrencies
}