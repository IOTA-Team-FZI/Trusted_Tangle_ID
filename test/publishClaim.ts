import DID from "../src/did";
import { getClaimAddress } from '../src/tangleConnector';
import {generate} from 'randomstring';

var SEED = generate({ length: 81, charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9' });

var did = DID.fromSeed(SEED);

// console.log(did)

var claim = did.createClaim(did.getMethodSpecificIdentifier(), 'eClass:manufacturer')
claim.then((value) => {
    console.log(value)
    return DID.publishClaim(value)
})
.then((value) => {
    console.log(value)
});