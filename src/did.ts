import { Trytes, Hash } from '@iota/core/typings/types';
import { publishDid, fetchDid, publishClaim, fetchClaims, publishTrustedIds, publishAttestation, fetchAttestation } from './tangleConnector';
import { DidDocument, MethodSpecId, Claim } from './types';
import { API } from '@iota/core';
import * as Mam from '@iota/mam';
import elliptic from 'elliptic';
import { createHash } from 'crypto';
import './errors'

export const DEFAULT_PROVIDER = 'https://nodes.devnet.thetangle.org:443';
export const METHOD_NAME = 'trusttangle';
export const CLAIM_CONTENT_LIMIT = 140

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
    };
    return new DID(document, seed, keyPair, channel);
  }

  getMethodSpecificIdentifier() {
    return this.document.id.split(':')[2];
  }

  async sync() {
    const fromStart: Mam.MamState = {
      ...this.mamChannel,
      channel: {
        ...this.mamChannel.channel,
        start: 0,
      }
    };
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
      const result = publishDid(this.mamChannel, this.document);
      this.published = true;
      return result;
    }
  }

  static async fetchDid(did: MethodSpecId, provider = DEFAULT_PROVIDER) {
    const doc = await fetchDid(did, provider);
    if (!doc) {
      return undefined;
    }
    if (doc.id !== `did:${METHOD_NAME}:${did}`) {
      throw new Error('DID doesn\'t match location');
    } else {
      return doc;
    }
  }

  async createAttestaion(claim: Hash, trust = 1.0, provider = DEFAULT_PROVIDER, predecessor?: Hash) {
    // build claim to publish
    let newAttestation: any = {
      claim,
      trust
    };
    // find predecessor claims published by did (should be extended to unknown id later)
    if ( predecessor === undefined ) {
      newAttestation.predecessor = Object.keys(await fetchAttestation(claim, this.getMethodSpecificIdentifier(), provider))[0]
    }
    let buffer = Buffer.from(JSON.stringify(newAttestation)).toString('hex');
    const signature = this.keyPair.sign(buffer).toDER('hex');
    return {
      claim: newAttestation,
      signature 
    };
  }

  async createClaim(target: MethodSpecId, type: string, content = {}, provider = DEFAULT_PROVIDER, predecessor?: Hash) {
    if ( !target ) {
      throw new Error('Claim parameters not complete. Specify target.');
    }
    if ( !type ) {
      throw new Error('Claim parameters not complete. Specify type.');
    }
    if (JSON.stringify(content).length > CLAIM_CONTENT_LIMIT) {
      throw new Error('Claim content exceeds the limit of '+ CLAIM_CONTENT_LIMIT + ' characters');
    }
    // build claim to publish
    let newClaim: Claim = {
      type,
      content,
      target,
      issuer: this.getMethodSpecificIdentifier()
    };
    // find predecessor claims published by did (should be extended to unknown id later)
    if ( predecessor === undefined ) {
      let claims = await fetchClaims(target, type, provider)
      Object.keys(claims).forEach(hash => {
        // signature already checked by tangle connector
        if (claims[hash].claim.issuer === this.getMethodSpecificIdentifier()) {
          newClaim.predecessor = hash
        }
      })
    }
    let buffer = Buffer.from(JSON.stringify(newClaim)).toString('hex');
    const signature = this.keyPair.sign(buffer).toDER('hex');
    return {
      claim: newClaim,
      signature 
    };
  }

  static async publishClaim(signedClaim: { claim: Claim, signature: any }, provider = DEFAULT_PROVIDER) {
    return publishClaim(signedClaim, provider);
  }

  async publishAttestation(claimBundleHash: Hash, trustLevel = 1.0, provider = DEFAULT_PROVIDER) {
    const signature = this.keyPair.sign(Buffer.from(claimBundleHash+trustLevel)).toDER('hex');
    return publishAttestation(this.getMethodSpecificIdentifier(), claimBundleHash, trustLevel, signature, provider);
  }

  static async fetchClaim(id: MethodSpecId, type: string, provider = DEFAULT_PROVIDER) {
    return fetchClaims(id, type, provider);
  }

  static async fetchAttestation(issuer: MethodSpecId, claimBundleHash: Hash, provider = DEFAULT_PROVIDER) {
    return fetchAttestation(issuer, claimBundleHash, provider);
  }

  /**
   * Checks if a claim is verified by a given id
   * 
   * @param targetId
   * @param type 
   * @param verifierId 
   * @param provider 
   */
  static async verifyClaim(targetId: MethodSpecId, type: string, verifierId: MethodSpecId, provider = DEFAULT_PROVIDER) {
    const claims = await fetchClaims(targetId, type, provider);
    for (const hash of Object.keys(claims)) {
      claims[hash].trust = await fetchAttestation(verifierId, hash, provider)
    }
    return claims
  }
}
