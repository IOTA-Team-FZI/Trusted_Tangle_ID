import Kerl from '@iota/kerl'
import { composeAPI } from '@iota/core'
import { padTrits } from '@iota/pad'
import { Trytes, Tag, Hash } from '@iota/core/typings/types';
import { DidDocument, MethodSpecId, Claim, TrustedIdMessage } from './types';
import { init, fetchSingle, MamState, create, attach } from '@iota/mam';
import { asciiToTrytes, trytesToAscii, trytes, trits } from '@iota/converter'

export const DEFAULT_MWM = 9
export const DEFAULT_TAG = 'TRUSTED9DID'

export function padTritsMultipleOf(base:number, minLength:number, trits:Int8Array) {
  const length = trits.length <= minLength ? minLength : (Math.floor(trits.length / base) + 1) * base
  return padTrits(length)(trits)
}

/**
 * 
 * Takes an array of trytes which get hashed to an unique address
 * 
 * @param input - Array of Trytes
 */
export function hashToAddress(input:Trytes[]) {
  const kerl = new Kerl()
  kerl.initialize()
  input.forEach(element => {
    const padded_trits = padTritsMultipleOf(Kerl.HASH_LENGTH, Kerl.HASH_LENGTH, trits(element))
    kerl.absorb(padded_trits, 0, padded_trits.length)
  })
  const buffer = new Int8Array(Kerl.HASH_LENGTH)
  kerl.squeeze(buffer, 0, Kerl.HASH_LENGTH)
  return trytes(buffer)
}

/**
 * 
 * @param {MethodSpecId} id - id of the claim target
 * @param {string} type - claim specific type. Example: 'eClass:manufacturer'
 */
export function getClaimAddress(id: MethodSpecId, type: string) {
  const typeTrytes = asciiToTrytes(type);
  return hashToAddress([id, typeTrytes])
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

  const result = await fetchSingle(id, 'public')

  if (result instanceof Error || result.payload === undefined) {
    if (result instanceof Error) {
      throw result
    } else {
      return undefined
    }
  } else {
    return JSON.parse(trytesToAscii(result.payload))
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

/**
 *
 * @param {Trytes} target - The id about which the claim was made
 * @param {string} claimIdentifier - The claim identifier composed of 'standard':'type'
 */
export async function fetchClaim(target: MethodSpecId, type: string) {
  // Claim
  // TODO
  return []
}

/**
 *
 * @param {MethodSpecId} certifier - The id which attested the claim
 * @param {MethodSpecId} target - The id about which the claim was made
 * @param {Hash} bundleHash - Bundle hash of the claim transaction for identification
 */
async function fetchAttestation(
  certifier: MethodSpecId,
  target: MethodSpecId,
  bundleHash?: Hash
) {
  // TODO
}

export async function publishDid(mamChannel: MamState, did: DidDocument, 
    {mwm = DEFAULT_MWM, tag = DEFAULT_TAG}: {mwm?: number, tag?: Tag} = {mwm: DEFAULT_MWM, tag: DEFAULT_TAG}) {
  const message = create(mamChannel, asciiToTrytes(JSON.stringify(did)))
  const response = await attach(message.payload, message.address, undefined, mwm, tag)
  return response
}

export async function publishClaim(signedClaim:{claim: Claim, signature: string}, provider: string) {
  const iota = composeAPI({
    provider: provider
  })
  const address = getClaimAddress(signedClaim.claim.target, signedClaim.claim.type)
  const message = asciiToTrytes(JSON.stringify(signedClaim))
  const transfers = [
    {
        value: 0,
        address: address,
        message: message
    }
    ]
    const trytes = await iota.prepareTransfers('9'.repeat(81), transfers) 
    const bundle = await iota.sendTrytes(trytes, 3, DEFAULT_MWM)
    return bundle
}

export async function publishTrustedIds(trustedIdsMessage: TrustedIdMessage, address: Hash, provider: string, 
    {mwm = DEFAULT_MWM, tag = DEFAULT_TAG}: {mwm?: number, tag?: Tag} = {mwm: DEFAULT_MWM, tag: DEFAULT_TAG}) {
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