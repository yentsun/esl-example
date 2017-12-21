const InfiniteLoop = require('infinite-loop');
const five = require('johnny-five');
const {EtherPortClient} = require('etherport-client');
const MAP = require('./map');
const requestAndDisplay = require('./requestAndDisplay');


const {INTERVAL=1000*60*60} = process.env;
const boards = [];

Object.keys(MAP).map((host) => {
    const asin = MAP[host];
    boards.push({
        id: asin,
        port: new EtherPortClient({host, port: 3030}),
        repl: false
    });
});

const labels = new five.Boards(boards);

labels.on('ready', function () {
    console.log('boards ready');
    const boards = this;
    boards.each(async (board) => {
        const lcd = new five.LCD({controller: "PCF8574AT", board});
        console.log(`${board.id}: label display ready`);
        await requestAndDisplay(board.id, lcd);  // initial display
        const loop = new InfiniteLoop();
        loop.add(requestAndDisplay, board.id, lcd).setInterval(Number(INTERVAL)).run(); // looped update
    });
});
