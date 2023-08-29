import { Exclude, Expose, Transform, Type } from 'class-transformer';
import dayjs from 'dayjs';
import 'reflect-metadata';

export namespace Common {
    export class TextColor {
        @Expose()
        a: number;
        @Expose()
        b: number;
        @Expose()
        g: number;
        @Expose()
        r: number;
    }

    export class PlayerId {
        readonly id: string;
        readonly prefix: string;
        readonly npln_user_id: string;
        readonly start_time: Date;
        readonly uuid: string;
        readonly suffix: string;
        readonly host_npln_user_id: string;

        /**
         * オリジナルのリザルトID
         */
        get rawValue(): string {
            return btoa(
                `${this.id}-${this.prefix}-${this.host_npln_user_id}:${dayjs(this.start_time).format('YYYYMMDDTHHmmss')}_${this.uuid}:${this.suffix}-${
                    this.npln_user_id
                }`
            );
        }

        constructor(rawValue: string) {
            const regexp = /([\w]*)-([\w]{1})-([\w\d]{20}):([\dT]{15})_([a-f0-9-]{36}):([\w]{1})-([\w\d]{20})/;
            const match = regexp.exec(atob(rawValue));
            if (match !== null) {
                const [, id, prefix, host_npln_user_id, start_time, uuid, suffix, npln_user_id] = match;
                this.id = id;
                this.prefix = prefix;
                this.npln_user_id = npln_user_id;
                this.start_time = dayjs(start_time).toDate();
                this.uuid = uuid;
                this.suffix = suffix;
                this.host_npln_user_id = host_npln_user_id;
            }
        }
    }

    export class CoopHistoryDetailId {
        readonly id: string;
        readonly prefix: string;
        readonly npln_user_id: string;
        readonly start_time: Date;
        readonly uuid: string;

        /**
         * オリジナルのリザルトID
         */
        get rawValue(): string {
            return btoa(`${this.id}-${this.prefix}-${this.npln_user_id}:${dayjs(this.start_time).format('YYYYMMDDTHHmmss')}_${this.uuid}`);
        }

        constructor(rawValue: string) {
            const regexp = /([\w]*)-([\w]{1})-([\w\d]{20}):([\dT]{15})_([a-f0-9-]{36})/;
            const match = regexp.exec(atob(rawValue));
            if (match !== null) {
                const [, id, prefix, npln_user_id, start_time, uuid] = match;
                this.id = id;
                this.prefix = prefix;
                this.npln_user_id = npln_user_id;
                this.start_time = dayjs(start_time).toDate();
                this.uuid = uuid;
            }
        }
    }

    /**
     * Node
     */
    export class Node<T> {
        @Expose()
        @Type((options) => (options?.newObject as Node<T>).type)
        nodes: T[];

        @Exclude()
        private type: Function;
        constructor(type: Function) {
            this.type = type;
        }
    }

    /**
     * Hash
     */
    export class Hash {
        @Expose({ name: 'image' })
        @Transform(({ obj }) => {
            const regexp = /([a-f0-9]{64})/;
            const match = regexp.exec(obj.image.url);
            return match === null ? obj.image.url : match[0];
        })
        readonly hash: string;
    }

    /**
     * Hash
     */
    export class Id {
        @Expose()
        @Transform(({ value }) => parseInt(atob(value).split('-')[1], 10))
        readonly id: number;
    }

    /**
     * Hash and Id
     */
    export class HashId {
        @Expose({ name: 'image' })
        @Transform(({ obj }) => {
            const regexp = /([a-f0-9]{64})/;
            const match = regexp.exec(obj.image.url);
            return match === null ? obj.image.url : match[0];
        })
        readonly hash: string;

        @Expose()
        @Transform(({ value }) => parseInt(atob(value).split('-')[1], 10))
        readonly id: number;
    }
}
