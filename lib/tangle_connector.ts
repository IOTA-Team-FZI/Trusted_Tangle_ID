import { API } from "@iota/core";
import { Trytes } from "@iota/core/typings/types";
import { DidDocument, Did, Claim, methodSpecId } from "./types";

/**
 * @classdesc This class is used to interact with the tangle.
 *
 * @typicalname tangle_connector
 */
export class TangleConnector {
  /**
   * the classs' own api
   */
  public readonly iota: API;

  /**
   * @constructs TangleConnector
   * @param {API} [options.iota] - A composed IOTA API for communication with a full node
   */
  constructor( iota?: API ) {
    this.iota = iota;
  }

  /**
   *
   * Fetches the DID document of the requested id from the tangle
   *
   * @param {API} [options.iota]
   * @param {Trytes} id - The id of that shall be fetched
   */
  static async fetchDID(id: methodSpecId, {iota}:{iota?: API}): Promise<DidDocument> {
    // TODO
  }

  /**
   *
   * Fetches the list of trusted ids of the requested id from the tangle
   *
   * @param {API} [options.iota] - A composed IOTA API for communication with a full node
   * @param {Trytes} id - The id of which the trusted ids shall be fetched
   */
  static async fetchTrustedIDs(id: methodSpecId, {iota}:{iota?: API}): Promise<Trytes[]> {
    // TODO
    return new Promise<Trytes[]>
  }

  /**
   *
   * @param {API} [options.iota] - A composed IOTA API for communication with a full node
   * @param {Trytes} id - The id about which the claim refers
   * @param {string} claimIdentifier - The claim identifier composed of 'standard':'type'
   */
  static async fetchClaim(id:methodSpecId, claimIdentifier:string, {iota}:{iota?: API}) : Claim {
    // TODO
  }

  /**
   *
   * @param {API} [optionsiota] - A composed IOTA API for communication with a full node
   * @param {Trytes} certifier - The id which attested the claim
   * @param {*} target - The id about which the claim was made
   * @param {*} bundleHash - Bundle hash of the claim transaction for identification
   */
  static async fetchAttestation(
    certifier: methodSpecId,
    target: methodSpecId,
    {iota, bundleHash}:{iota?: API, bundleHash?: Trytes}
  ) {
    // TODO
  }

  static publishDid(did: DidDocument): void {

  }
}
