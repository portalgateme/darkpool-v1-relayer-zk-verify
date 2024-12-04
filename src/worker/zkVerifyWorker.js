const { zkVerifySession } = require('zkverifyjs');
const config = require('../config/config');

async function initSession() {
    const session = await zkVerifySession.start().Testnet().withAccount(config.zkVerifySeed);
    return session;
}

async function submitProof(job) {
    const { proof, publicSignals, vkHash } = job.data

    try {
        const session = await initSession();

        const { transactionResult } = await session
            .verify()
            .ultraplonk()
            .withRegisteredVk()
            .waitForPublishedAttestation()
            .execute({
                proofData: {
                    proof,
                    publicSignals,
                    vk:vkHash,
                },
            });

        const res = await transactionResult;

        if (res && res.attestationId) {
            return res;
        } else {
            throw new Error("Your proof isn't correct.");
        }
    } catch (error) {
        throw new Error(`Transaction failed: ${error.message}`);
    }
}


module.exports = {
    submitProof
}
