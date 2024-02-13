const fs = require('fs');

const { ABIS, EXCHANGES, POOLS, TOKEN_CONTRACTS } = require('./constants');


const getCoin = (coins, coinAddress) => {
    for (const coin of coins) {
        if (coin.hasOwnProperty('Address') && coin.Address === coinAddress) {
            return coin;
        }
    }
    return null;
};


// Sample Pool's JSON after the below function
// {
//     Exchange: 'UniSwap_V3',
//     'Pool Address': '0x88E6A0C2DDD26FEEB64F039A2C41296FCB3F5640',
//     'Coin_0 Address': '0xC02AAA39B223FE8D0A0E5C4F27EAD9083C756CC2',
//     'Coin_1 Address': '0xA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48',
//     Fees: 0.05,
//     'Coin_0 Name': 'Wrapped Ether',
//     'Coin_0 Symbol': 'WETH',
//     'Coin_0 Decimal': 18,
//     'Coin_0 Balance': null,
//     'Coin_1 Name': 'USDC',
//     'Coin_1 Symbol': 'USDC',
//     'Coin_1 Decimal': 6,
//     'Coin_1 Balance': null,
//     State: { BlockNumber: null, Price: null },
//     HttpsContract: null,
//     WssContract: null
// }
const initializePools = () => {
    const coins = readJSON('./resources/Binance.Coins.json');
    const pools = readJSON('./resources/Binance.Pools.json');

    for (const pool of pools) {
        if (pool.hasOwnProperty('_id')) {
            delete pool._id;
        }

        const coin0 = getCoin(coins, pool.Coin0_Address);
        pool.Coin0_Name = coin0.Name;
        pool.Coin0_Symbol = coin0.Symbol;
        pool.Coin0_Decimal = coin0.Decimal;
        pool.Coin0_Balance = null;

        const coin1 = getCoin(coins, pool.Coin1_Address);
        pool.Coin1_Name = coin1.Name;
        pool.Coin1_Symbol = coin1.Symbol;
        pool.Coin1_Decimal = coin1.Decimal;
        pool.Coin1_Balance = null;

        pool.State = { BlockNumber: null, Price: null };
        pool.HttpsContract = null;
        pool.WssContract = null;

        POOLS.push(pool);
    }
};


const initializeTokenContracts = (web3https) => {
    const coins = readJSON('./resources/Binance.Coins.json');
    for (const coin of coins) {
        const tokenContract = new web3https.eth.Contract(ABIS.WBNB, coin.Address);
        TOKEN_CONTRACTS[coin.Address] = tokenContract;
    }
};


const readJSON = (filepath) => {
    try {
        const data = fs.readFileSync(filepath, 'utf8');
        const jsonData = JSON.parse(data);
        return jsonData;
    } catch (err) {
        console.error('Error reading or parsing the JSON file:', err);
        return null;
    }
};


const startListening = async (pool, web3https, web3wss, outputFile) => {
    switch (pool.Exchange) {
        case EXCHANGES.PancakeSwap_V2:
        case EXCHANGES.Biswap_V2:
        case EXCHANGES.ApeSwap:
        case EXCHANGES.BabySwap:
        case EXCHANGES.Baby_Doge_Swap:
        case EXCHANGES.MDEX:
        case EXCHANGES.DOOAR:
        case EXCHANGES.Nomiswap:
        case EXCHANGES.JulSwap:
        case EXCHANGES.BakerySwap:
        case EXCHANGES.Nomiswap_Stable:
        case EXCHANGES.SushiSwap:
        case EXCHANGES.Trader_Joe:
            pool.HttpsContract = new web3https.eth.Contract(ABIS[EXCHANGES.UniSwap_V2], pool.Pool_Address);
            pool.WssContract = new web3wss.eth.Contract(ABIS[EXCHANGES.UniSwap_V2], pool.Pool_Address);
            pool.Coin0_Balance = await TOKEN_CONTRACTS[pool.Coin0_Address].methods.balanceOf(pool.Pool_Address).call();
            pool.Coin1_Balance = await TOKEN_CONTRACTS[pool.Coin1_Address].methods.balanceOf(pool.Pool_Address).call();
            // pool.State.Price = getCurrentPriceUniswapV2(pool, await getReserves(pool.HttpsContract)); // Todo
            pool.State.BlockNumber = await web3https.eth.getBlockNumber();
            outputFile.write(`${new Date().toLocaleString()} | Block Number: ${pool.State.BlockNumber} | Address: ${pool.Pool_Address} | Name: ${pool.Coin0_Name}/${pool.Coin1_Name} | Exchange: ${pool.Exchange} | Balance0: ${pool.Coin0_Balance} | Balance1: ${pool.Coin1_Balance}\n`);

            pool.WssContract.events.Swap({}).on('data', async (data) => {
                const balance0 = await TOKEN_CONTRACTS[pool.Coin0_Address].methods.balanceOf(pool.Pool_Address).call();
                const balance1 = await TOKEN_CONTRACTS[pool.Coin1_Address].methods.balanceOf(pool.Pool_Address).call();
                updateState(pool, balance0, balance1, data.blockNumber, outputFile);
            });
            break;
        
        case EXCHANGES.PancakeSwap_V3:
        case EXCHANGES.Uniswap_V3:
            pool.HttpsContract = new web3https.eth.Contract(ABIS[EXCHANGES.UniSwap_V3], pool.Pool_Address);
            pool.WssContract = new web3wss.eth.Contract(ABIS[EXCHANGES.UniSwap_V3], pool.Pool_Address);
            pool.Coin0_Balance = await TOKEN_CONTRACTS[pool.Coin0_Address].methods.balanceOf(pool.Pool_Address).call();
            pool.Coin1_Balance = await TOKEN_CONTRACTS[pool.Coin1_Address].methods.balanceOf(pool.Pool_Address).call();
            // pool.State.Price = await getCurrentPriceUniswapV3(pool); // Todo
            pool.State.BlockNumber = await web3https.eth.getBlockNumber();
            outputFile.write(`${new Date().toLocaleString()} | Block Number: ${pool.State.BlockNumber} | Address: ${pool.Pool_Address} | Name: ${pool.Coin0_Name}/${pool.Coin1_Name} | Exchange: ${pool.Exchange} | Balance0: ${pool.Coin0_Balance} | Balance1: ${pool.Coin1_Balance}\n`);

            pool.WssContract.events.Swap({}).on('data', async (data) => {
                const balance0 = await TOKEN_CONTRACTS[pool.Coin0_Address].methods.balanceOf(pool.Pool_Address).call();
                const balance1 = await TOKEN_CONTRACTS[pool.Coin1_Address].methods.balanceOf(pool.Pool_Address).call();
                updateState(pool, balance0, balance1, data.blockNumber, outputFile);
            });
            break;
            
        default:
            console.log(`Yet to find   -   Exchange: ${pool.Exchange} | Address: ${pool.Pool_Address}`);
    }
};


const updateState = (pool, balance0, balance1, blockNumber, outputFile) => {
    // pool.State.Price = price; // Todo
    pool.Coin0_Balance = balance0;
    pool.Coin1_Balance = balance1;
    pool.State.BlockNumber = blockNumber;
    outputFile.write(`${new Date().toLocaleString()} | Block Number: ${pool.State.BlockNumber} | Address: ${pool.Pool_Address} | Name: ${pool.Coin0_Name}/${pool.Coin1_Name} | Exchange: ${pool.Exchange} | Balance0: ${pool.Coin0_Balance} | Balance1: ${pool.Coin1_Balance}\n`);
};


module.exports = {
    initializePools,
    initializeTokenContracts, 
    startListening, 
};
