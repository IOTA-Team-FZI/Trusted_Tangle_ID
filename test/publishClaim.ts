import DID from "../src/did";
import {generate} from 'randomstring';
import { composeAPI } from "@iota/core";
import { trytesToAscii } from "@iota/converter";

const seed = generate({ length: 81, charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9' });

const did = DID.fromSeed(seed);

// console.log(did)

const claim = did.createClaim(did.getMethodSpecificIdentifier(), 'eClass:manufacturer')
// console.log(claim)
DID.publishClaim(claim).then((value) => {
  console.log(value)

  const iota = composeAPI({
    provider: 'https://nodes.devnet.thetangle.org:443'
  })
  setTimeout(() => {
    iota.getBundle(value[0].hash).then((bundle: any) => {
      const result = trytesToAscii(bundle[0].message)
      console.log(result)
    }).catch((err: any) => {
      console.error(err)
    })
  }, 2000);
  
}).catch((err: any) => console.error(err));