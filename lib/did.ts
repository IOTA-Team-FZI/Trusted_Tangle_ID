import { Trytes } from "@iota/core/typings/types";
import { TangleConnector } from "./tangle_connector";

export class DID {
  private seed: Trytes;

  static fromSeed(seed: Trytes): void {
    this.seed = seed;
    // generate key pair from seed
    // build DidDocument

    TangleConnector.publishDid({});
  }
}
