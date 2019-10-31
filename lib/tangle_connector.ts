import { API, composeAPI } from "@iota/core";
import { Trytes } from "@iota/core/typings/types";
import { DidDocument, Did, Claim, methodSpecId } from "./types";

/**
 * @classdesc This class is used to interact with the tangle.
 *
 * @typicalname tangle_connector
 */
export class TangleConnector {
  public static readonly DEFAULT_PROVIDER = "nodes.dev.iota.org";
  /**
   * the classs' own api
   */
  public readonly iota: API;

  /**
   * @constructs TangleConnector
   * @param {string} provider - A full node URL
   */
  constructor(provider?: string) {
    if (provider === undefined) {
      this.iota = composeAPI({
        provider: TangleConnector.DEFAULT_PROVIDER
      });
    } else {
      this.iota = composeAPI({
        provider: provider
      });
    }
  }

  /**
   *
   * Fetches the DID document of the requested id from the tangle
   *
   * @param {Trytes} id - The id of that shall be fetched
   */
  async fetchDID(id: methodSpecId): Promise<DidDocument> {
    // TODO
  }

  /**
   *
   * Fetches the list of trusted ids of the requested id from the tangle
   *
   * @param {Trytes} id - The id of which the trusted ids shall be fetched
   */
  async fetchTrustedIDs(id: methodSpecId): Promise<Trytes[]> {
    // TODO
    return [];
  }

  /**
   *
   * @param {Trytes} id - The id about which the claim refers
   * @param {string} claimIdentifier - The claim identifier composed of 'standard':'type'
   */
  async fetchClaim(id: methodSpecId, claimIdentifier: string): Promise<Claim> {
    // TODO
  }

  /**
   *
   * @param {Trytes} certifier - The id which attested the claim
   * @param {*} target - The id about which the claim was made
   * @param {*} bundleHash - Bundle hash of the claim transaction for identification
   */
  async fetchAttestation(
    certifier: methodSpecId,
    target: methodSpecId,
    { bundleHash }: { bundleHash?: Trytes }
  ) {
    // TODO
  }

  static publishDid(did: DidDocument): void {}
}
