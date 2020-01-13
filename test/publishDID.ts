import DID from '../src/did';
import { generate } from 'randomstring';

const seed = generate({ length: 81, charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9' });

const did = DID.fromSeed(seed);

console.log(did);

did.publishDid()
  .then((value) => console.log('DID published. Bundle hash:', value![0].bundle))
  .then(() => DID.fetchDid(did.getMethodSpecificIdentifier()))
  .then((result) => console.log(result));
