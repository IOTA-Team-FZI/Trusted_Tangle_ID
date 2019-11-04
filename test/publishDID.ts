import DID from "../src/did";
import {generate} from 'randomstring';

var SEED =generate({length:81, charset:'ABCDEFGHIJKLMNOPQRSTUVWXYZ9'});

var did = DID.fromSeed(SEED);

console.log(did)

var result = did.publishDid()
result.then(function (value) {
    console.log(value)
});
