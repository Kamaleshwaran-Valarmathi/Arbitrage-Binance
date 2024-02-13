const fs = require('fs');
const cliProgress = require('cli-progress');
const { Web3 } = require('web3');

const { HTTPS_URL, WSS_URL, POOLS } = require('./constants.js');
const { 
    initializePools, 
    initializeTokenContracts,
    startListening
} = require('./helper.js');


const main = async () => {
    const web3https = new Web3(HTTPS_URL);
    const web3wss = new Web3(WSS_URL);

    initializeTokenContracts(web3https);
    initializePools();

    const outputFile = fs.createWriteStream('output/output.csv', { flags: 'a' });
    console.log('\n>>>>>>> Go to output.csv, to see the results... <<<<<<<\n');

    const bar = new cliProgress.Bar({
        format: 'Message: Initialising Pools | {bar} [{value}/{total}] | ETA: {eta}s',
        barCompleteChar: '#',
        barIncompleteChar: '-',
    });
    
    bar.start(POOLS.length, 0);
    for (const pool of POOLS) {
        startListening(pool, web3https, web3wss, outputFile);

        await new Promise(resolve => setTimeout(resolve, 750)); // Wait for 0.75 sec
        process.stdout.write('\r');
        bar.increment();
    }
    bar.stop();
};

main();


/***
 * ====
 * Todo
 * ====
 * Each pool's fee tier
 * 
 * 
 * 
 * ===============================
 * Notes (DEX's Pool count & Fork)
 * ===============================
 * DEX Name,Pools Freqency,Forked from
 * -----------------------------------
 * PancakeSwap V2 (BSC),383,Uniswap V2
 * PancakeSwap V3 (BSC),140,Uniswap V3
 * Biswap V2,23,Uniswap V2
 * Uniswap V3 (BSC),17,Uniswap V3
 * ApeSwap (BSC),16,Uniswap V2
 * THENA FUSION,12,Algebra DEX
 * BabySwap,9,Uniswap V2
 * Baby Doge Swap,5,Uniswap V2
 * MDEX (BSC),4,Uniswap V2
 * THENA,4,Solidly
 * DOOAR (BSC),3,Uniswap V2
 * Nomiswap,3,Uniswap V2
 * JulSwap,2,Uniswap V2
 * BakerySwap,1,Uniswap V2
 * Nomiswap (Stable),1,Uniswap V2
 * SushiSwap (BSC),1,Uniswap V2
 * Trader Joe V2.1 (BSC),1,Uniswap V2
 * ---------
 * Total,625
 */
