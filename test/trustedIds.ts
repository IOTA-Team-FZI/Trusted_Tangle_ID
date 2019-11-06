import { Trytes } from '@iota/core/typings/types';
import { createHash } from 'crypto';
import elliptic from 'elliptic';
import DID from '../src/did';

const entries = new Map<Trytes, number>();
entries.set('WERTZUIKVDSDFGHJKJHGFDFGFFGHFGHHHDGJKGHSGIOHGELFGJHTRTZUJFVUJZTSDRZFDGREOOFZHUVIH', .8);
entries.set('XCBFGJRUHSKRUFGEEOVNTUREIVGNHLOSRDIUTGSZNVHOUISRDEZIVNZHUGIZRHOGIREZHGZUIGKNBGGSD', .3);
entries.set('YXCVBNMJHFDXVSFLWOUSFDZSHVGZRRRRRRRRRRRRRRRRRRRRRRRRRRRDIUFHUIZFUGDHJSDKJFSDJGHDF', 1);


const did = DID.fromSeed('ERTZJHGEJKWTVRZHEVNOUGRNHZURIDVGSGUHRIGUVZHNFGUIUSGHFDFAOGHFVJCKGNHFVGJFHDSFCJHGB');

const result = did.publishTrustedIds(entries);
console.log(JSON.stringify(result))
