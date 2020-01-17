import DID from '../src/did';
import {generate} from 'randomstring';

const seed = generate({ length: 81, charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9' });

const did = DID.fromSeed(seed);

did.publishDid().then((value) => console.log('DID published. Bundle hash:', value![0].bundle))

const claimContent = { name: 'FZI Karlsruhe' }

did.createClaim(did.getMethodSpecificIdentifier(), 'eClass:manufacturer', claimContent)
  .then((claim) => DID.publishClaim(claim))
  .then((value) => {
    console.log('Claim published. Bundle hash:', value![0].bundle);

    setTimeout(() => DID.fetchClaim(did.getMethodSpecificIdentifier(), 'eClass:manufacturer')
      .then((result) => console.log(result))
      .catch((err) => console.error(err)), 
    2000);
}).catch((err) => console.error(err));
