import { Trytes, Hash } from '@iota/core/typings/types';
import { MethodSpecId, WOTEntry } from './types';

export default class WOT {

private wot:Map<Trytes, WOTEntry>[] = []

private max_depth = 3

static naiveTrustFunction(layer:Map<Trytes, WOTEntry>, target:Trytes, depth:number) {
    // calculate the trust dependent on the depth on the WOT and the trust origin (predecessor)
    // if there are multiple origins take the highest score in the update iteration
    let origins = 0
    let trust = 0
    for (let entry of layer.entries()){
        if (entry[1].entries.has(target)) {
            trust += entry[1].trust * entry[1].entries.get(target) / depth
            origins++
        }
    }
    return trust/origins
}


seedWOT(seedEntries: Map<Trytes, WOTEntry>) {
    this.wot[0] = seedEntries;
}

synchWOT() {
    // TODO fetch the entire wot as an asynchronous task
}

calulateWOT() {
    if (this.wot[0] == undefined) {
        throw new Error('WOT not seeded!')
    }
    if (this.wot[this.max_depth-1] == undefined) {
        throw new Error('WOT not fetched!')
    }
    for (var d = 1; d < this.max_depth; d++) {
        for (var entry of this.wot[d].entries()) {
            entry[1].trust = WOT.naiveTrustFunction(this.wot[d-1], entry[0], d)
        }
    }
}

getDIDTrustScore(id:MethodSpecId) {
    // TODO
}

getClaimTrustScore(claim:Hash) {
    // TODO
}

}
