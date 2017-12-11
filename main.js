const amazon = require('amazon-product-api');
const InfiniteLoop = require('infinite-loop');
const fixer = require('fixer-io-node');
const five = require('johnny-five');
const EtherPortClient = require('etherport-client').EtherPortClient;


const {AWS_ID: awsId, AWS_SECRET: awsSecret, AWS_TAG: awsTag, INTERVAL=1000*60*60} = process.env;

const client = amazon.createClient({awsId, awsSecret, awsTag});
const mainLoop = new InfiniteLoop();

const amazonEchoLabel = new five.Board({
    port: new EtherPortClient({
        host: '192.168.0.107', // IP address of the ESP
        port: 3030
    }),
    timeout: 1e5,
    repl: false
});


async function displayPrice(client, lcd) {

    try {
        console.log('requesting product price...');
        const results = await client.itemLookup({
            idType: 'ASIN',
            itemId: 'B01DFKC2SO',
            responseGroup: 'Offers'
        });
        const USDPrice = Number(results[0].OfferSummary[0].LowestNewPrice[0].Amount[0]) / 100;
        console.log(`lowest new price is $${USDPrice}`);
        const {rates: {JPY}} = await fixer.base('USD');  // we fetch and display JPY price for this cluster
        const JPYPrice = Number.parseInt(USDPrice * JPY);
        lcd
            .cursor(0, 0)
            .print('Alexa Echo Dot 2')
            .cursor(1, 0)
            .print(`$${USDPrice}`)
            .cursor(1, 6)
            .print(` | JPY${JPYPrice}    `);
    } catch (error) {
        throw error;
    }
}

amazonEchoLabel.on('ready', () => {
    console.log('Amazon Echo label ready');
    const lcd = new five.LCD({
        controller: "PCF8574AT"
    });
    displayPrice(client, lcd);
    mainLoop.add(displayPrice, client, lcd).setInterval(INTERVAL).run();
});
