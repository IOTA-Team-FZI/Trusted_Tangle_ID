# Trusted_Tangle_ID

[Github Page](https://iota-team-fzi.github.io/Trusted_Tangle_ID/)

---

## Installation

Clone repository
    git clone https://github.com/IOTA-Team-FZI/Trusted_Tangle_ID.git && cd Trusted_Tangle_ID

Install dependencies
    npm i

Now you can run tests or use the modules themselfs.



## Tests

The descibed tests contain hard coded DIDs. If you truely want to test an own DID
it is recommended to exchange there values in the code.
If you do so, you should carry out the tests in the order as written down.

### Create a random new DID
Creates a random DID with the corresponding key pair and publishes it to the tangle.
    ts-node test/publishDID.ts

### Fetch DIDs
Fetches two DID documents of the identities specified in the test.
    ts-node test/fetchDID.ts

### Publish claim
Fetches two DID documents of the identities specified in the test.
    ts-node test/publishClaim.ts

### Publilsh attestation
Publish an attestation about an already published claim with the own DID.
    ts-node test/publishAttestation.ts