import { Trytes, Hash } from '@iota/core/typings/types';
import { publishDid, fetchDid } from './tangleConnector';
import { DidDocument, MethodSpecId } from './types';
import { API } from '@iota/core';
import * as Mam from '@iota/mam';
import elliptic from 'elliptic';
import { createHash } from 'crypto';

export const DEFAULT_PROVIDER = 'https://nodes.devnet.thetangle.org:443';
export const METHOD_NAME = 'trusttangle';

const ec = new elliptic.ec('curve25519');

export default class DID {
  private published = false;
  private trustedIds = new Map<Trytes, number>();
  private lastTrustedIdTx?: Hash;

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
    const fromStart: Mam.MamState = {
      ...this.mamChannel,
      channel: {
        ...this.mamChannel.channel,
        start: 0,
      }
    }
    const result = await Mam.fetch(Mam.getRoot(fromStart), 'public');
    if (result instanceof Error) {
      throw result;
    } else {
      if (result.messages !== undefined && result.messages.length > 0) {
        this.published = true;
        this.document = JSON.parse(result.messages[0]);
      }
      this.mamChannel = fromStart;
    }
  }

  public publishTrustedIds(entries: Map<Trytes, number>) {
    
  }

  public async publishDid() {
    if (!this.published) {
      const result = publishDid(this.mamChannel, this.document)
      this.published = true
      return result
    }
  }

  static async fetchDid(did: MethodSpecId, provider=DEFAULT_PROVIDER) {
    return fetchDid(did, provider);
  }
}
