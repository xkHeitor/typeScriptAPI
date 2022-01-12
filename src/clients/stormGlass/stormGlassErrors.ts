import { InternalError } from "@src/util/errors/internal-error";

export class ClientRequestError extends InternalError {
    constructor(message: string){
        const internalMessage = '`Unexpected error when trying to communicate to StormGlass';
        super(`${internalMessage}: ${message}`);    
    }
} 

export class StormGlassResponseError extends InternalError {
    constructor(message: string) {
        const internalMessage = 'Unexpected error returned by the StormGlass service';
        super(`${internalMessage}: ${message}`);   
    }
}