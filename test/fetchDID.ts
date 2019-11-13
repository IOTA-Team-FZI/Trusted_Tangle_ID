import DID from '../src/did';

const result = DID.fetchDid('JWMNQRTTSARV9GJFZPKINBRNXVI9YDJEZNDEXSXWKVSIDPFZBOLUWZUALDFEKEIDGHUTKJBSEXMPGCMCO')
result.then((value) => console.log(value));