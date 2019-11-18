import DID from '../src/did';
import {generate} from 'randomstring';

const claimBundleHash = 'VRJNLKSGFIZQQKFWQEYKYLTPJNXHZK9LCTIETYJJHBRQTTYZBRLQICIIYLZYXYFZLI9YJLLBZDCCDUUG9'

const seed = generate({ length: 81, charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9' });

const did = DID.fromSeed(seed);

did.publishDid()
  .then((value) => {
    console.log('DID published')
    console.log(value)
});

did.publishAttestation(claimBundleHash).then((value) => {
    console.log(value)
    setTimeout(() => {
        DID.fetchAttestation(did.getMethodSpecificIdentifier(), claimBundleHash)
        .then((result) => console.log(result))
        .catch((err) => console.error(err))
      }, 2000)
})