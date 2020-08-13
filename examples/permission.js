const { create: createApiInstance, MAINNET_CONFIG } = require('../dist/waves-api');
const nodeFetch = require('node-fetch');

const nodeAddress = 'https://trump.vostokservices.com/node-1';
const seedPhrase = 'examples seed phrase';

const fetch = (url, options = {}) => {
    const headers = options.headers || {}
    return nodeFetch(url, { ...options, headers: {...headers, 'x-api-key': 'vostok'} });
}

(async () => {
    const { chainId, minimumFee, gostCrypto } = await (await fetch(`${nodeAddress}/node/config`)).json();

    const wavesApiConfig = {
        ...MAINNET_CONFIG,
        nodeAddress,
        crypto: gostCrypto ? 'gost' : 'waves',
        networkByte: chainId.charCodeAt(0),
    };

    const Waves = createApiInstance({
        initialConfiguration: wavesApiConfig,
        fetchInstance: fetch
    });

    // Create Seed object from phrase
    const seed = Waves.Seed.fromExistingPhrase(seedPhrase);

    const tx = {
        target: seed.address,
        opType: 'add',
        role: 'contract_developer',
        fee: minimumFee[102],
        timestamp: Date.now(),
    }

    try {
        const result = await Waves.API.Node.transactions.broadcast('permit', tx, seed.keyPair);
        console.log('Broadcast ADD PERMIT: ', result)

        const waitTimeout = 10

        console.log(`Wait ${waitTimeout} seconds while tx mining...`)

        await new Promise(resolve => {
            setTimeout(resolve, waitTimeout * 1000)
        })

        const removePermit = {
            ...tx,
            opType: 'remove',
            timestamp: Date.now()
        }

        const removePermitResult = await Waves.API.Node.transactions.broadcast('permit', removePermit, seed.keyPair);
        console.log('Broadcast REMOVE PERMIT: ', removePermitResult)
    } catch (err) {
        console.log('Broadcast error:', err)
    }

})();
