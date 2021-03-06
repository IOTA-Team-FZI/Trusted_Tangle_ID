import DID from '../src/did';
import {generate} from 'randomstring';

const seed = generate({ length: 81, charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9' });
const did = DID.fromSeed(seed);
did.publishDid().then((value) => console.log('DID published. Bundle hash:', value![0].bundle));

const claimContent1 = { name: 'FZI Karlsruhe' };
const claimContent2 = { name: 'FZI Berlin' };

did.createClaim(did.getMethodSpecificIdentifier(), 'eClass:manufacturer', claimContent1)
  .then((claim1) => DID.publishClaim(claim1))
  .then((value) => {
    console.log('Claim 1. Bundle hash:', value![0].bundle);

    setTimeout(() => did.createClaim(did.getMethodSpecificIdentifier(), 'eClass:manufacturer', claimContent2)
      .then((claim2) => DID.publishClaim(claim2))
      .then((value) => {
        console.log('Claim 2. Bundle hash:', value![0].bundle);
        setTimeout(() => {
          DID.fetchClaim(did.getMethodSpecificIdentifier(), 'eClass:manufacturer')
            .then((result) => {
              console.log('Fetched Claim');
              console.log(result);
          }).catch((err) => console.error(err))
        }, 2000);
    }), 2000);
}).catch((err) => console.error(err));
