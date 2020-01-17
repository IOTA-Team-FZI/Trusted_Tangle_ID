import DID from '../src/did';
import {generate} from 'randomstring';

const claimBundleHash = 'VRJNLKSGFIZQQKFWQEYKYLTPJNXHZK9LCTIETYJJHBRQTTYZBRLQICIIYLZYXYFZLI9YJLLBZDCCDUUG9'

const seed = generate({ length: 81, charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9' });
const did = DID.fromSeed(seed);
did.publishDid().then((value) => console.log('DID published. Bundle hash:', value![0].bundle));

did.createAttestation(claimBundleHash)
  .then(attestation => DID.publishAttestation(did.getMethodSpecificIdentifier(), attestation))
  .then((value) => {
    console.log('Attestation published. Bundle hash:', value![0].bundle);
    setTimeout(() => DID.fetchAttestation(did.getMethodSpecificIdentifier(), claimBundleHash)
      .then((result) => console.log(result))
      .catch((err) => console.error(err)), 
    2000);
}).catch((err) => console.error(err))