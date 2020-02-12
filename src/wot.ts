import { Trytes, Hash } from '@iota/core/typings/types';
import { MethodSpecId, WOTEntry } from './types';
import DID, { DEFAULT_PROVIDER } from './did';

export default class WOT {
    private wot: Map<MethodSpecId, WOTEntry>[] = [];

    private maxDepth: number;

    constructor(seedEntries: Map<MethodSpecId, WOTEntry>, maxDepth = 3) {
        this.wot[0] = seedEntries;
        this.maxDepth = maxDepth;
    }

    static naiveTrustFunction(layer: Map<MethodSpecId, WOTEntry>, target: Trytes, depth: number) {
        // calculate the trust dependent on the depth on the WOT and the trust origin (predecessor)
        // if there are multiple origins take the highest score in the update iteration
        let origins = 0;
        let trust = 0;
        for (const entry of layer.values()) {
            if (entry.trustedIdentities.has(target)) {
                trust += entry.trust * entry.trustedIdentities.get(target)! / depth;
                origins++;
            }
        }
        return trust / origins;
    }

    async synchWOT(provider = DEFAULT_PROVIDER) {
        // fetch the entire wot as an asynchronous task
        const visited: Map<MethodSpecId, Map<string, number>> = new Map();
        for (let depth = 0; depth < this.maxDepth; depth++) {
            for (const {0: trustedId, 1: entry} of this.wot[depth]) {
                entry.trustedIdentities = visited.get(trustedId) || await DID.fetchTrustedIds(trustedId, provider);
                visited.set(trustedId, entry.trustedIdentities);

                if (!this.wot[depth + 1]) {
                    this.wot[depth + 1] = new Map();
                }
                for (const id of entry.trustedIdentities.keys()) {
                    this.wot[depth + 1].set(id, {
                        trust: 0,
                        trustedIdentities: new Map()
                    });
                }
            }
        }
    }

    calulateWOT() {
        if (this.wot[0] === undefined) {
            throw new Error('WOT not seeded!');
        }
        if (this.wot[this.maxDepth - 1] === undefined) {
            throw new Error('WOT not fetched!');
        }
        for (let d = 1; d < this.maxDepth; d++) {
            for (const {0: id, 1: entry} of this.wot[d].entries()) {
                entry.trust = WOT.naiveTrustFunction(this.wot[d - 1], id, d);
            }
        }
    }

    getDIDTrustScore(target: MethodSpecId) {
        const entries: WOTEntry[] = [];
        for (let i = 0; i < this.wot.length; i++) {
            Array.from(this.wot[i].entries()).filter(e => e[0] === target).forEach(e => entries.push(e[1]));
        }
        return entries.map(e => e.trust).reduce((acc, v) => acc + v, 0) / entries.length;
    }

    getClaimTrustScore(claim: Hash) {
        // TODO
    }
}
