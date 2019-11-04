import DID from "../src/did";

var result = DID.fetchDid('JWMNQRTTSARV9GJFZPKINBRNXVI9YDJEZNDEXSXWKVSIDPFZBOLUWZUALDFEKEIDGHUTKJBSEXMPGCMCO')
result.then(function (value) {
    console.log(value)
});