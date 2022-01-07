export class InternalError extends Error {

    constructor (public message: string, protected code: number = 500, protected description?: string) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
    }

}