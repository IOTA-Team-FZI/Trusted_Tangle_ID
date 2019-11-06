import Kerl from '@iota/kerl'
import { composeAPI } from '@iota/core'
import { Trytes, Tag, Hash } from '@iota/core/typings/types';
import { DidDocument, MethodSpecId, Claim } from './types';
import { init, fetchSingle, MamState, create, attach } from '@iota/mam';
import { asciiToTrytes, trytesToAscii, trytes, trits } from '@iota/converter'


export const DEFAULT_MWM = 9
export const DEFAULT_TAG = 'TRUSTED9DID'

/**
 * 
 * @param {MethodSpecId} id - id of the claim target
 * @param {string} type - claim specific type. Example: 'eClass:manufacturer'
 */
export function getClaimAddress(id: MethodSpecId, type: string) {
  const kerl = new Kerl()
  kerl.initialize()
  kerl.absorb(trits(id), 0, id.length)
  kerl.absorb(trits(type), 0, type.length)
  const buffer = new Int8Array(Kerl.HASH_LENGTH)
  kerl.squeeze(buffer, 0, Kerl.HASH_LENGTH)
  return trytes(buffer)
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
async function fetchClaim(target: MethodSpecId, claimIdentifier: string): Promise<any> {
  // Claim
  // TODO
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

export async function publishClaim(claim: Claim, provider: string) {
  const iota = composeAPI({
    provider: provider
  })
  const address = getClaimAddress(claim.target, claim.type)
  const message = asciiToTrytes(JSON.stringify(claim))
  const transfers = [
    {
        value: 0,
        address: address,
        message: message
    }
    ]
    const trytes = await iota.prepareTransfers('9', transfers)
    const bundle = await iota.sendTrytes(trytes, 3, DEFAULT_MWM)
    return bundle
}