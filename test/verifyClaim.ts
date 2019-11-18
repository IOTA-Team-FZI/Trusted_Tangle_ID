import DID from '../src/did';

const type = 'eClass:manufacturer'

const target = 'QXIZFMAHGTIJEPVHYMZZNNZOYERECMTIFOE9JZZCEEYWPQDMTLZJRWREVZOCQPXEYZBIKIVBAAZOQUBXL'

const verifier = 'TAMRVDJUTVQJH9GCNOOCLMES9FRCGUXMUNJMNUCXBQMLFFYRJZJMEVGGIFOEWMYRHPLYARGFBOYOQZYEX'

DID.verifyClaim(target, type, verifier).then(value => {
    console.log(value)
}).catch((error) => console.error(error));
