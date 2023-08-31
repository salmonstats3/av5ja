import base64url from 'base64url';
import { AlgorithmType } from '../enum/algorithm';
import { TokenType } from '../enum/token_type';
import dayjs from 'dayjs';

class Header {
    readonly alg: AlgorithmType;
}

interface PayloadType {
    readonly aud: string;
    readonly exp: number;
    readonly iat: number;
    get is_valid(): boolean;
    readonly typ: TokenType;
}

export namespace Token {
    export class SessionToken implements PayloadType {
        readonly aud: string;
        readonly exp: number;
        readonly typ: TokenType;
        readonly iat: number;

        get is_valid(): boolean {
            return true;
        }
    }

    export class Token implements PayloadType {
        readonly aud: string;
        readonly exp: number;
        readonly typ: TokenType;
        readonly iat: number;
        /**
         * NA ID
         */
        readonly sub: string;

        get is_valid(): boolean {
            return true;
        }
    }

    export class GameServiceToken implements PayloadType {
        readonly aud: string;
        readonly exp: number;
        readonly typ: TokenType;
        readonly iat: number;
        readonly membership: Membership;
        readonly isChildRestricted: boolean;
        /**
         * Coral User ID
         */
        readonly sub: number;

        get is_valid(): boolean {
            return true;
        }
    }

    export class GameWebToken implements PayloadType {
        readonly aud: string;
        readonly exp: number;
        readonly typ: TokenType;
        readonly iat: number;
        readonly links: Links;

        get is_valid(): boolean {
            return true;
        }
    }
}

interface NetworkServiceAccount {
    /**
     * Network Service Account ID(NSA ID)
     */
    readonly id: string;
}

interface Links {
    readonly networkServiceAccount: NetworkServiceAccount;
}

export class Membership {
    readonly active: boolean;
}

export class JWT<T extends PayloadType> {
    header: Header;
    payload: T;
    signature: string;

    get is_valid(): boolean {
        return dayjs(this.payload.exp).isBefore(dayjs());
    }

    get raw_value(): string {
        return [[this.header, this.payload].map((value) => base64url.fromBase64(btoa(JSON.stringify(value)))), this.signature].flat().join('.');
    }

    constructor(rawValue: string) {
        const [header, payload, signature] = rawValue.split('.');
        this.header = JSON.parse(atob(header));
        this.payload = JSON.parse(atob(payload)) as T;
        this.signature = signature;
    }
}
