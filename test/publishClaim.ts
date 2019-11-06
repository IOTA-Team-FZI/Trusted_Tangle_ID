import DID from "../src/did";
import {generate} from 'randomstring';

const seed = generate({ length: 81, charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9' });

const did = DID.fromSeed(seed);

console.log(did)

const claim = did.createClaim(did.getMethodSpecificIdentifier(), 'eClass:manufacturer')
console.log(claim)
DID.publishClaim(claim).then((value) => {
  console.log(value)
});