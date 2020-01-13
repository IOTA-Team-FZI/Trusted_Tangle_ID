import DID from '../src/did';
import {generate} from 'randomstring';

const seed = generate({ length: 81, charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9' });

const did = DID.fromSeed(seed);

const targetId = 'STFIUIKWWOXKUOPLXQYCOYRXPYKVIB9BQKWZGAMAVDNNMTAACLBTUNSJWKZIBHKPVVBGWXEFOCSXFDBVS';

DID.fetchClaim(targetId, 'eClass:manufacturer')
            .then((result) => {
              console.log('Fetched Claim')
              console.log(result)
            })
            .catch((err) => console.error(err))