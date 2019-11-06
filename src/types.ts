import { Trytes, Hash } from "@iota/core/typings/types";

export type MethodSpecId = Trytes;

export type DidDocument = {
  "@context": string | string[];
  id: MethodSpecId;
  publicKey: string; // TODO choose encryption scheme
};

export type Claim = {
  type: string;
  content: any;
  target: MethodSpecId;
  issuer: MethodSpecId;
  predecessor?: Hash;
};

export type TrustedIdMessage = {
  entries: Map<Trytes, number>;
  signature: string;
  predecessor?: Hash;
}
