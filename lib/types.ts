import { Trytes } from "@iota/core/typings/types";

export type methodSpecId = string | Trytes[];
export type DidDocument = {
  "@context": string | string[];
  id: methodSpecId;
  publicKey?: string; // TODO choose encryption scheme
};
export type Claim = {};
