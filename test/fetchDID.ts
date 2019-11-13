import DID from '../src/did';

// malformed did
DID.fetchDid('JWMNQRTTSARV9GJFZPKINBRNXVI9YDJEZNDEXSXWKVSIDPFZBOLUWZUALDFEKEIDGHUTKJBSEXMPGCMCO')
  .then((value) => console.log(value))
  .catch((error) => console.error(error));

DID.fetchDid('BCCUTCJPDSVICBAJUDCNPWBCNRDDKIITLHMQQKLNXKVIPPZHBORSXFEJHWLOKLMDZKE9DWVZFBIQT9LVH')
  .then((value) => console.log(value))
  .catch((error) => console.error(error));
  