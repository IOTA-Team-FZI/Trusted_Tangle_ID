import { Trytes } from '@iota/core/typings/types';
import { publishDid, fetchDid, publishClaim } from './tangleConnector';
import { DidDocument, MethodSpecId, Claim } from './types';
import * as Mam from '@iota/mam';
import elliptic from 'elliptic';
import { createHash } from 'crypto';

export const DEFAULT_PROVIDER = 'https://nodes.devnet.thetangle.org:443';
export const METHOD_NAME = 'trusttangle';

const ec = new elliptic.ec('curve25519');

export default class DID {
  constructor(public document: DidDocument, private readonly seed: Trytes, private keyPair: elliptic.ec.KeyPair, private mamChannel: Mam.MamState) {}

  static fromSeed(seed: Trytes, provider = DEFAULT_PROVIDER) {
    const channel = Mam.init(provider, seed);
    const root = Mam.getRoot(channel);
    
    const secret = createHash('sha256').update(seed).digest('hex');
    const keyPair = ec.keyFromPrivate(secret);
    const document: DidDocument = {
      '@context': 'https://www.w3.org/2019/did/v1',
      id: `did:${METHOD_NAME}:${root}`,
      publicKey: keyPair.getPublic('hex')
    }
    return new DID(document, seed, keyPair, channel)
  }

  async sync() {
    const result = await Mam.fetch(Mam.getRoot(this.mamChannel), 'public');
    if (result instanceof Error) {

    } else {

    }
  }

  async publishDid() {
    // TODO check if already published
    return publishDid(this.mamChannel, this.document)
  }

  static async fetchDid(did: MethodSpecId, provider=DEFAULT_PROVIDER) {
    return fetchDid(did, provider);
  }

  static async publishClaim(claim: Claim, provider=DEFAULT_PROVIDER) {
    // TODO offer build claim
    return publishClaim(claim, provider)
  }

  
}
