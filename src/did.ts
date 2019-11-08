import { Trytes, Hash } from '@iota/core/typings/types';
import { publishDid, fetchDid, publishClaim, fetchClaim, publishTrustedIds } from './tangleConnector';
import { DidDocument, MethodSpecId, Claim } from './types';
import { API } from '@iota/core';
import * as Mam from '@iota/mam';
import elliptic from 'elliptic';
import { createHash } from 'crypto';

export const DEFAULT_PROVIDER = 'https://nodes.devnet.thetangle.org:443';
export const METHOD_NAME = 'trusttangle';
export const CALIM_CONTENT_LIMIT = 140

const ec = new elliptic.ec('ed25519');

export default class DID {
  private published = false;
  private trustedIds = new Map<Trytes, number>();
  private lastTrustedIdBundle?: Hash;

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

  getMethodSpecificIdentifier() {
    return this.document.id.split(':')[2]
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
    // TODO sync trusted id's as well
  }

  public async publishTrustedIds(entries: Map<Trytes, number>, provider = DEFAULT_PROVIDER) {  
    const obj = Array.from(entries.keys())
      .map((k) => ({[k]: entries.get(k)!}))
      .reduce((kv, acc) => ({...kv, ...acc}), {});
    
    const payload = {
      entries: obj,
      predecessor: this.lastTrustedIdBundle,
    };
    const signature = this.keyPair.sign(Buffer.from(JSON.stringify(payload))).toDER('hex');
    const message = {
      ...payload,
      signature,
    };
    const save = this.mamChannel.channel.start;
    const patched = {
      ...this.mamChannel,
      channel: {
        ...this.mamChannel.channel,
        start: 1,
      }
    };
    const address = Mam.getRoot(patched);
    this.mamChannel.channel.start = save;
    const result = await publishTrustedIds(message, address, provider);
    if (result) {
      this.lastTrustedIdBundle = result[0].bundle;
      Array.from(entries.keys()).forEach((k) => this.trustedIds.set(k, entries.get(k)!));
    }
    return result;
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

  createClaim(target: MethodSpecId, type: string, content={}) {
    if ( !target ) {
      throw new Error('Claim parameters not complete. Specify target.')
    }
    if ( !type ) {
      throw new Error('Claim parameters not complete. Specify type.')
    }
    if (JSON.stringify(content).length > CALIM_CONTENT_LIMIT) {
      throw new Error('Claim content exceeds the limit of '+ CALIM_CONTENT_LIMIT + ' characters')
    }
    // build claim to publish
    let newClaim:Claim = { type: type, content: content, target: target, issuer: this.getMethodSpecificIdentifier() }
    // find predecessor
    const predecessors = []// await fetchClaim(target, type)
    if ( predecessors.length > 0 ) {
      // TODO get latest claim and add to claim
    }
    let buffer = Buffer.from(JSON.stringify(newClaim)).toString('hex')
    const signature = this.keyPair.sign(buffer).toDER('hex')
    return {claim: newClaim, signature: signature}
  }

  static async publishClaim(signedClaim:{claim: Claim, signature: any}, provider=DEFAULT_PROVIDER) {
    return publishClaim(signedClaim, provider)
  }

  static async fetchClaim(id:MethodSpecId, type:string, provider=DEFAULT_PROVIDER) {
    return fetchClaim(id, type, provider)
  }


}
