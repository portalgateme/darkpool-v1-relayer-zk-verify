const { zkVerifySession } = require('zkverifyjs');
const config = require('../config/config');

async function initSession() {
    const session = await zkVerifySession.start().Testnet().withAccount(config.zkVerifySeed);
    return session;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function submitProof(proof, publicSignals, vkHash) {

    let session;
    try {
        session = await initSession();

        const { transactionResult } = await session
            .verify()
            .ultraplonk()
            .withRegisteredVk()
            .waitForPublishedAttestation()
            .execute({
                proofData: {
                    proof,
                    publicSignals,
                    vk: vkHash,
                },
            });

        const res = await transactionResult;
        console.log(res);
        await sleep(60000);

        if (res && res.attestationId) {
            const poe = await session.poe(res.attestationEvent.id, res.leafDigest);
            console.log(poe);
            return {
                attestationId: res.attestationEvent.id,
                merklePath: poe.proof,
                leafCount: poe.numberOfLeaves,
                index: poe.leafIndex,
            };
        } else {
            throw new Error("Your proof isn't correct.");
        }
    } catch (error) {
        throw new Error(`Transaction failed: ${error.message}`);
    } finally {
        if (session) {
            session.close();
        }
    }
}


module.exports = {
    submitProof
}
