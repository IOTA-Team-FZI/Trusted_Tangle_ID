import { Trytes } from "@iota/core/typings/types";
import TangleConnector from "./tangleConnector";

export default class DID {
  private seed!: Trytes;

  fromSeed(seed: Trytes): void {
    this.seed = seed;
    // generate key pair from seed
    // build DidDocument

    TangleConnector.publishDid({});
  }
}
