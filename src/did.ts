import { Trytes } from "@iota/core/typings/types";
import { publishDid } from "./tangleConnector";
import { DidDocument } from "./types";
import { API } from "@iota/core";
import * as Mam from '@iota/mam';
import elliptic from 'elliptic';
import { createHash } from 'crypto';

export const DEFAULT_PROVIDER = "https://nodes.devnet.thetangle.org:443";
export const METHOD_NAME = '';

export default class DID {
  constructor(private readonly seed: Trytes, public document: DidDocument, private mamChannel: Mam.MamState) {}

  static fromSeed(seed: Trytes, provider = DEFAULT_PROVIDER) {
    const channel = Mam.init(provider, seed);
    const root = Mam.getRoot(channel);
    const ec = new elliptic.ec('curve25519');
    const secret = createHash('sha256').update(seed).digest('hex');
    const keyPair = ec.keyFromPrivate(secret);
    const document: DidDocument = {
      "@context": 'https://www.w3.org/2019/did/v1',
      id: `did:${METHOD_NAME}:${root}`,
      publicKey: keyPair.getPublic('hex')
    }
    return new DID(seed, document, channel)
  }

  public async publishDid() {
    // TODO check if already published
    return publishDid(this.mamChannel, this.document)
  }
}
