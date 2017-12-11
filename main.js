const amazon = require('amazon-product-api');
const InfiniteLoop = require('infinite-loop');
const fixer = require('fixer-io-node');


const {AWS_ID: awsId, AWS_SECRET: awsSecret, AWS_TAG: awsTag, interval=10000} = process.env;

const client = amazon.createClient({awsId, awsSecret, awsTag});
const loop = new InfiniteLoop();

async function fetchPrice(client) {

    try {
        console.log('requesting product price...');
        const results = await client.itemLookup({
            idType: 'ASIN',
            itemId: 'B01DFKC2SO',
            responseGroup: 'Offers'
        });
        const USD = Number(results[0].OfferSummary[0].LowestNewPrice[0].Amount[0]) / 100;
        console.log(`lowest new price is $${USD}`);
        const {rates: {JPY}} = await fixer.base('USD');
        console.log('JPY price is', Number.parseInt(USD * JPY));
    } catch (error) {
        throw error;
    }
}

loop
    .add(fetchPrice, client)
    .setInterval(interval)
    .run();
