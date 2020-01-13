import { Trytes, Hash } from '@iota/core/typings/types';
import { MethodSpecId } from './types';

export default class WOT {

private wot:any = []

static trustFunction(origin, depth) {
    // calculate the trust dependent on the depth on the WOT and the trust origin (predecessor)
    // if there are multiple origins take the highest score in the update iteration
}


seedWOT(seedEntries: Map<Trytes, number>) {
    this.wot[0] = seedEntries;
}

synchWOT() {
    // TODO fetch the entire wot as an asynchronous task
}

getDIDTrustScore(id:MethodSpecId) {
    // TODO
}

getClaimTrustScore(claim:Hash) {
    // TODO
}

}
