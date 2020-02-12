import { Trytes, Hash } from '@iota/core/typings/types';

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

export type Attestation = {
  claim: Hash;
  trust: number;
  predecessor?: Hash;
};

export type TrustedIdMessage = {
  payload: {
    entries: {
      [x: string]: number;
    };
    predecessor?: Hash;
  };
  signature: string;
}

export type WOTEntry = {
  trust: number;
  trustedIdentities: Map<Trytes, number>
}
