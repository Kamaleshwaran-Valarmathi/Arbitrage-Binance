const UniswapV2_ABI = require('@uniswap/v2-periphery/build/IUniswapV2Pair.json').abi;
const UniswapV3_ABI = require('@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json').abi;
const WBNB_ABI = require('./resources/WBNB_ABI.json');


const HTTPS_URL = 'https://green-distinguished-sea.bsc.quiknode.pro/fc3606a0cbfaed167862c98af5c37d4c67ca4d3f/';
const WSS_URL = 'wss://green-distinguished-sea.bsc.quiknode.pro/fc3606a0cbfaed167862c98af5c37d4c67ca4d3f/';


// Exchanges
const EXCHANGES = {
    PancakeSwap_V2: 'PancakeSwap V2 (BSC)',
    PancakeSwap_V3: 'PancakeSwap V3 (BSC)',
    Biswap_V2: 'Biswap V2',
    Uniswap_V3: 'Uniswap V3 (BSC)',
    ApeSwap: 'ApeSwap (BSC)',
    THENA_FUSION: 'THENA FUSION',
    BabySwap: 'BabySwap',
    Baby_Doge_Swap: 'Baby Doge Swap',
    MDEX: 'MDEX (BSC)',
    THENA: 'THENA',
    DOOAR: 'DOOAR (BSC)',
    Nomiswap: 'Nomiswap',
    JulSwap: 'JulSwap',
    BakerySwap: 'BakerySwap',
    Nomiswap_Stable: 'Nomiswap (Stable)',
    SushiSwap: 'SushiSwap (BSC)',
    Trader_Joe: 'Trader Joe V2.1 (BSC)'
};


// ABIs
const ABIS = {};
ABIS[EXCHANGES.UniSwap_V2] = UniswapV2_ABI;
ABIS[EXCHANGES.UniSwap_V3] = UniswapV3_ABI;
ABIS['WBNB'] = WBNB_ABI; // JSON.parse(fs.readFileSync('./resources/WBNB_ABI.json', 'utf8'));


const POOLS = []; // Pools
const TOKEN_CONTRACTS = new Map(); // Token Contracts


module.exports = {
    HTTPS_URL,
    WSS_URL,
    EXCHANGES,
    ABIS,
    POOLS, 
    TOKEN_CONTRACTS
};
