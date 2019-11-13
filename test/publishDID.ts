import DID from '../src/did';
import { generate } from 'randomstring';

const seed = generate({ length: 81, charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9' });

const did = DID.fromSeed(seed);

console.log(did)

const result = did.publishDid()
result.then((value) => console.log(value));
