import { Expose, Transform, plainToInstance } from 'class-transformer';
import dayjs from 'dayjs';

import { JWT, Token } from '../dto/jwt.dto';
import { GameServiceToken } from '../requests/game_service_token';

export class UserInfo {
    @Expose()
    @Transform(({ value }) => new JWT<Token.SessionToken>(value))
    session_token: JWT<Token.SessionToken>;

    @Expose()
    @Transform(({ value }) => new JWT<Token.Token>(value))
    access_token: JWT<Token.Token>;

    @Expose()
    @Transform(({ value }) => new JWT<Token.GameServiceToken>(value))
    game_service_token: JWT<Token.GameServiceToken>;

    @Expose()
    @Transform(({ value }) => new JWT<Token.GameWebToken>(value))
    game_web_token: JWT<Token.GameWebToken>;

    @Expose()
    bullet_token: string;

    @Expose()
    expires_in: Date;

    @Expose()
    @Transform(({ value }) => plainToInstance(GameServiceToken.User, value))
    user: GameServiceToken.User;

    @Expose()
    web_version: string;

    @Expose()
    last_play_time: Date;

    constructor(
        user: GameServiceToken.User,
        session_token: JWT<Token.SessionToken>,
        access_token: JWT<Token.Token>,
        game_service_token: JWT<Token.GameServiceToken>,
        game_web_token: JWT<Token.GameWebToken>,
        bullet_token: string,
        web_version: string,
        last_play_time: Date = dayjs().toDate()
    ) {
        this.user = user;
        this.session_token = session_token;
        this.access_token = access_token;
        this.game_service_token = game_service_token;
        this.game_web_token = game_web_token;
        this.bullet_token = bullet_token;
        // とりあえず有効期限を二時間で設定
        this.expires_in = dayjs().add(2, 'hours').toDate();
        this.web_version = web_version;
        this.last_play_time = last_play_time;
    }

    /**
     * トークンが有効期限切れかどうかを返す
     */
    get requires_refresh(): boolean {
        return dayjs(this.expires_in).isBefore(dayjs());
    }
}
