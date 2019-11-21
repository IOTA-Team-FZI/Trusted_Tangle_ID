import { Trytes } from '@iota/core/typings/types';
import DID from '../src/did';

import { generate } from 'randomstring';

const seed = generate({ length: 81, charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9' });

const entries = new Map<Trytes, number>();
entries.set('WERTZUIKVDSDFGHJKJHGFDFGFFGHFGHHHDGJKGHSGIOHGELFGJHTRTZUJFVUJZTSDRZFDGREOOFZHUVIH', .8);
entries.set('XCBFGJRUHSKRUFGEEOVNTUREIVGNHLOSRDIUTGSZNVHOUISRDEZIVNZHUGIZRHOGIREZHGZUIGKNBGGSD', .3);
entries.set('YXCVBNMJHFDXVSFLWOUSFDZSHVGZRRRRRRRRRRRRRRRRRRRRRRRRRRRDIUFHUIZFUGDHJSDKJFSDJGHDF', 1);


const did = DID.fromSeed(seed)

console.log(did)


did.publishDid().then(value => {
did.publishTrustedIds(entries).then((bundle) => {
    console.log(bundle)
    setTimeout(() => {
    DID.fetchTrustedIds(did.getMethodSpecificIdentifier()).then(value => {
        console.log(value)
    }).catch((err) => console.error(err))
}, 2000)
})
})
