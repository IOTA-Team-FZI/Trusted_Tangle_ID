import DID from "../src/did";
import {generate} from 'randomstring';
import { composeAPI } from "@iota/core";
import { trytesToAscii } from "@iota/converter";

const seed = generate({ length: 81, charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9' });

const did = DID.fromSeed(seed);

const claimContent = {name: "FZI Karlsruhe"}

const claim = did.createClaim(did.getMethodSpecificIdentifier(), 'eClass:manufacturer', claimContent)
// console.log(claim)
DID.publishClaim(claim).then((value) => {
  console.log(value)

  const iota = composeAPI({
    provider: 'https://nodes.devnet.thetangle.org:443'
  })
  setTimeout(() => {
    iota.getBundle(value[0].hash).then((bundle: any) => {
      console.log(bundle[0].signatureMessageFragment.length)
      console.log(bundle[0].signatureMessageFragment)
      const result = trytesToAscii(bundle[0].signatureMessageFragment+'9')
      console.log(result)
    }).catch((err: any) => {
      console.error(err)
    })
  }, 2000);
  
}).catch((err: any) => console.error(err));