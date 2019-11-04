import { Trytes, Hash } from "@iota/core/typings/types";
import { DidDocument, MethodSpecId } from "./types";
import { init, fetchSingle, MamState, create, attach } from "@iota/mam";
import { asciiToTrytes, trytesToAscii } from '@iota/converter'

export const MWM = 9 // for mainnet use 14
export const tag = 'TRUSTED9DID'

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
  return [];
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

export async function publishDid(mamChannel: MamState, did: DidDocument) {
  const message = create(mamChannel, asciiToTrytes(JSON.stringify(did)))
  const response = await attach(message.payload, message.address, undefined, MWM, tag)
  return response
}
