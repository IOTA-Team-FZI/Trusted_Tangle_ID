import Kerl from '@iota/kerl'
import { composeAPI } from '@iota/core'
import { padTrits } from '@iota/pad'
import { Trytes, Tag, Hash, Transaction } from '@iota/core/typings/types';
import { DidDocument, MethodSpecId, Claim, TrustedIdMessage } from './types';
import { init, fetchSingle, MamState, create, attach } from '@iota/mam';
import { asciiToTrytes, trytesToAscii, trytes, trits } from '@iota/converter';
import elliptic from 'elliptic';
import './errors'

export const DEFAULT_MWM = 9;
export const DEFAULT_TAG = 'TRUSTED9DID';

const ec = new elliptic.ec('ed25519');

function trytesToString(input: Trytes) {
  if (input.length % 2) {
    input += '9';
  }
  return Array.from(trytesToAscii(input)).filter((value) => value.charCodeAt(0) !== 0).join("");
}

function padTritsMultipleOf(base: number, minLength: number, trits: Int8Array) {
  const length = trits.length <= minLength ? minLength : (Math.floor(trits.length / base) + 1) * base;
  return padTrits(length)(trits);
}

/**
 * 
 * Takes an array of trytes which get hashed to an unique address
 * 
 * @param input - Array of Trytes
 */
export function hashToAddress(input: Trytes[]) {
  const kerl = new Kerl();
  kerl.initialize();
  input.forEach(element => {
    const padded_trits = padTritsMultipleOf(Kerl.HASH_LENGTH, Kerl.HASH_LENGTH, trits(element));
    kerl.absorb(padded_trits, 0, padded_trits.length);
  });
  const buffer = new Int8Array(Kerl.HASH_LENGTH);
  kerl.squeeze(buffer, 0, Kerl.HASH_LENGTH);
  return trytes(buffer);
}

/**
 * 
 * @param {MethodSpecId} id - id of the claim target
 * @param {string} type - claim specific type. Example: 'eClass:manufacturer'
 */
export function getClaimAddress(id: MethodSpecId, type: string) {
  const typeTrytes = asciiToTrytes(type);
  return hashToAddress([id, typeTrytes]);
}

/**
 * 
 * @param {MethodSpecId} id - id of the claim target
 * @param {string} type - claim specific type. Example: 'eClass:manufacturer'
 */
export function getAttestationAddress(id: MethodSpecId, bundleHash: Hash) {
  return hashToAddress([id, bundleHash]);
}

/**
 *
 * Fetches the DID document of the requested id from the tangle
 *
 * @param {Trytes} id - The id of that shall be fetched
 * @param {string} provider - Url of the the provider node
 */
export async function fetchDid(id: MethodSpecId, provider: string): Promise<DidDocument | undefined> {
  init(provider);

  const result = await fetchSingle(id, 'public');

  if (result instanceof Error || result.payload === undefined) {
    if (result instanceof Error) {
      throw result;
    } else {
      return undefined;
    }
  } else {
    return JSON.parse(trytesToAscii(result.payload));
  }
}

/**
 *
 * Fetches the list of trusted ids of the requested id from the tangle
 *
 * @param {Trytes} id - The id of which the trusted ids shall be fetched
 */
async function fetchTrustedIDs(id: MethodSpecId): Promise<Trytes[]> {
  // TODO
  return []
}

export async function fetchAttestation(issuerId: MethodSpecId, claimBundleHash: Hash, provider: string) {
  const iota = composeAPI({
    provider: provider
  })
  const address = getAttestationAddress(issuerId, claimBundleHash)
  const attestationTransactions = await iota.findTransactionObjects({addresses: [address]})
  let attestations:any = {}
  attestationTransactions.forEach((transaction:Transaction) => {
    attestations[transaction.bundle] = (JSON.parse(trytesToString(transaction.signatureMessageFragment)))
  })
  // check if every issuer has really signed the attestation
  const issuer = await fetchDid(issuerId, provider)
  Object.keys(attestations).forEach((hash:any) => {
    if (issuer === undefined || !ec.verify(Buffer.from(claimBundleHash+attestations[hash].trust), attestations[hash].signature, ec.keyFromPublic(issuer.publicKey, 'hex'))){
      delete attestations[hash]
    }
  })
  if (Object.keys(attestations).length === 0) {
    return undefined
  }
  if (Object.keys(attestations).length > 1) {
    throw new Error('More than one attestation. Attestation revokation not implemented yet.')
  }
  return attestations
}

/**
 *
 * @param {Trytes} target - The id about which the claim was made
 * @param {string} claimIdentifier - The claim identifier composed of 'standard':'type'
 * @param {string} provider - Url of the the provider node
 */
export async function fetchClaims(target: MethodSpecId, type: string, provider: string) {
  const iota = composeAPI({
    provider: provider
  });
  const address = getClaimAddress(target, type);
  const claimTransactions = await iota.findTransactionObjects({addresses: [address]});
  let claims: any = {};
  claimTransactions
    .forEach((transaction: Transaction) => claims[transaction.bundle] = JSON.parse(trytesToString(transaction.signatureMessageFragment)));

  // check if every issuer has really signed the claim
  Object.keys(claims).forEach(async hash => {
    const issuer = await fetchDid(claims[hash].claim.issuer, provider);
    const signature = claims[hash].signature;
    if (issuer === undefined || !ec.verify(Buffer.from(JSON.stringify(claims[hash].claim)), signature, ec.keyFromPublic(issuer.publicKey, 'hex'))) {
      delete claims[hash];
    }
  });

  // if there is just one claim
  if (Object.keys(claims).length === 1) {
    return claims
  }
  let latestClaims:any = {}
  Object.keys(claims).forEach(hash => {
    if (claims[hash].claim.predecessor === undefined) {
      latestClaims[hash] = claims[hash]
    }
  });

  let changed = true

  while (changed) {
    changed = false
    Object.keys(claims).forEach(hash => {
        // TODO check for same signature
        if (claims[hash].claim.predecessor in latestClaims) {
          latestClaims[hash] = claims[hash]
          delete latestClaims[claims[hash].claim.predecessor]
          changed = true
        }
      });
  }


  return latestClaims;
}


export async function publishDid(mamChannel: MamState, did: DidDocument, 
    { mwm = DEFAULT_MWM, tag = DEFAULT_TAG }: { mwm?: number, tag?: Tag } = { mwm: DEFAULT_MWM, tag: DEFAULT_TAG }) {
  const message = create(mamChannel, asciiToTrytes(JSON.stringify(did)));
  const response = await attach(message.payload, message.address, undefined, mwm, tag);
  return response;
}

export async function publishClaim(signedClaim: { claim: Claim, signature: string }, provider: string, 
    { mwm = DEFAULT_MWM, tag = DEFAULT_TAG }: { mwm?: number, tag?: Tag } = { mwm: DEFAULT_MWM, tag: DEFAULT_TAG }) {
  const iota = composeAPI({
    provider
  });
  const address = getClaimAddress(signedClaim.claim.target, signedClaim.claim.type);
  const message = asciiToTrytes(JSON.stringify(signedClaim));
  const transfers = [{
    value: 0,
    address,
    message,
    tag
  }];
  const trytes = await iota.prepareTransfers('9'.repeat(81), transfers);
  const bundle = await iota.sendTrytes(trytes, 3, mwm);
  return bundle;
}

export async function publishTrustedIds(trustedIdsMessage: TrustedIdMessage, address: Hash, provider: string, 
    { mwm = DEFAULT_MWM, tag = DEFAULT_TAG }: { mwm?: number, tag?: Tag } = { mwm: DEFAULT_MWM, tag: DEFAULT_TAG }) {
  const iota = composeAPI({
    provider
  });
  const message = asciiToTrytes(JSON.stringify(trustedIdsMessage));
  const transfers = [{
    value: 0,
    address,
    message,
    tag
  }];
  const trytes = await iota.prepareTransfers('9'.repeat(81), transfers);
  const bundle = await iota.sendTrytes(trytes, 3, mwm);
  return bundle;
}

export async function publishAttestation(issuer: MethodSpecId, bundleHash: Hash, trust: number, signature: string, provider: string, 
    { mwm = DEFAULT_MWM, tag = DEFAULT_TAG }: { mwm?: number, tag?: Tag } = { mwm: DEFAULT_MWM, tag: DEFAULT_TAG }) {
  const iota = composeAPI({
    provider: provider
  });
  const address = getAttestationAddress(issuer, bundleHash);
  const message = asciiToTrytes(JSON.stringify({trust, signature}));
  const transfers = [{
    value: 0,
    address,
    message,
    tag
  }];
  const trytes = await iota.prepareTransfers('9'.repeat(81), transfers);
  const bundle = await iota.sendTrytes(trytes, 3, mwm);
  return bundle;
}
