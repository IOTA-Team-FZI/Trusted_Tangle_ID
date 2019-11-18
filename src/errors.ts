const INVALID_SIGNATURE = 'Invalid signature!'
const ID_NOT_FOUND = 'The requested id was was not found on the tangle!'

export class IdNotFoundError extends Error {
    constructor() {
        super(ID_NOT_FOUND);

    }
}
