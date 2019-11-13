import DID from '../src/did';
import {generate} from 'randomstring';
import { composeAPI } from '@iota/core';
import { trytesToAscii } from '@iota/converter';

const seed = generate({ length: 81, charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9' });

const did = DID.fromSeed(seed);

const result = did.publishDid()
result.then((value) => {
  console.log('DID published')
  console.log(value)
});

const claimContent = { name: 'FZI Karlsruhe' }

const claim = did.createClaim(did.getMethodSpecificIdentifier(), 'eClass:manufacturer', claimContent)
// console.log(claim)
DID.publishClaim(claim).then((value) => {
  console.log(value)

  setTimeout(() => {
    DID.fetchClaim(did.getMethodSpecificIdentifier(), 'eClass:manufacturer')
      .then((result: any) => console.log(result))
      .catch((err: any) => console.error(err))
  }, 2000);
}).catch((err: any) => console.error(err));