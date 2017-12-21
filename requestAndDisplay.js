const amazon = require('amazon-product-api');
const fixer = require('fixer-io-node');


const {AWS_ID: awsId, AWS_SECRET: awsSecret, AWS_TAG: awsTag} = process.env;
const client = amazon.createClient({awsId, awsSecret, awsTag});

module.exports = async function (itemId, lcd) {

    process.stdout.write(`${itemId}: requesting product price and JPY rate...`);
    try {
        const results = await client.itemLookup({
            idType: 'ASIN',
            itemId,
            responseGroup: 'ItemAttributes,OfferSummary'
        });
        console.log('done');
        const title = results[0].ItemAttributes[0].Title[0];
        const USDPrice = Number(results[0].OfferSummary[0].LowestNewPrice[0].Amount[0]) / 100;
        const {rates: {JPY}} = await fixer.base('USD');  // we fetch and display JPY price for this cluster
        const JPYPrice = Number.parseInt(USDPrice * JPY);
        lcd
        .cursor(0, 0).print(title)
        .cursor(1, 0).print(`$${USDPrice} | JPY${JPYPrice}    `);
        console.log(`${itemId}: label updated`);

    } catch (error) {
        console.log(JSON.stringify(error));
    }
};