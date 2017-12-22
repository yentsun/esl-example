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
        const {rates: {EUR}} = await fixer.base('USD');  // we fetch and display EUR price for this cluster
        const EURPrice = Number.parseInt(USDPrice * EUR);
        lcd
            .home().print(title.substring(0, 16))
            .cursor(1, 0).print(`$${USDPrice} | EUR${EURPrice}    `);
        console.log(`${itemId}: label updated`);

    } catch (error) {
        console.log(JSON.stringify(error));
    }
};