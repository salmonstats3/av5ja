import { Transform, plainToInstance } from 'class-transformer';

import { JWT, Token } from '../dto/jwt.dto';
import { ResponseType, RequestType, Method, Headers, Parameters } from '../utils/request';

export namespace AccessToken {
  export class Request implements RequestType {
    readonly baseURL: string = 'https://accounts.nintendo.com/';
    readonly headers: Headers = {
      'Content-Type': 'application/json',
    };
    readonly method: Method = Method.POST;
    readonly parameters: Parameters;
    readonly path: string = 'connect/1.0.0/api/token';

    constructor(session_token: string) {
      this.parameters = {
        client_id: '71b963c1b7b6d119',
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer-session-token',
        session_token: session_token,
      };
    }

    request(response: any): ResponseType {
      return plainToInstance(Response, response, { excludeExtraneousValues: false });
    }
  }

  export class Response implements ResponseType {
    @Transform(({ value }) => new JWT<Token.Token>(value))
    access_token: JWT<Token.Token>;
    expires_in: number;
    @Transform(({ value }) => new JWT<Token.Token>(value))
    id_token: JWT<Token.Token>;
    scope: string[];
    token_type: string;
    /**
     * NA ID
     */
    get na_id(): string {
      return this.access_token.payload.sub;
    }
  }
}