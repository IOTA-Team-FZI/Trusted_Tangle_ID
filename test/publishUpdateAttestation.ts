import DID from '../src/did';
import {generate} from 'randomstring';

const claimBundleHash = 'VRJNLKSGFIZQQKFWQEYKYLTPJNXHZK9LCTIETYJJHBRQTTYZBRLQICIIYLZYXYFZLI9YJLLBZDCCDUUG9'

const seed = generate({ length: 81, charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9' });
const did = DID.fromSeed(seed);
did.publishDid().then((value) => console.log('DID published. Bundle:', value![0].bundle));

did.createAttestation(claimBundleHash)
  .then(attestation1 => DID.publishAttestation(did.getMethodSpecificIdentifier(), attestation1))
  .then((value) => {
    console.log('attestation 1 published');
    setTimeout(() => did.createAttestation(claimBundleHash, 0)
      .then(attestation2 => DID.publishAttestation(did.getMethodSpecificIdentifier(), attestation2))
      .then((value) => {
        console.log('attestation 2 published');
        setTimeout(() => {
          DID.fetchAttestation(did.getMethodSpecificIdentifier(), claimBundleHash)
          .then((result) => console.log(result))
          .catch((err) => console.error(err))
        }, 2000);
      }), 
    2000);
}).catch((err) => console.error(err))