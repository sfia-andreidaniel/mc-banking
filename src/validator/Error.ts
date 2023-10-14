export class Error {
    constructor(public readonly message: string, public field: string = '') {
    }
}