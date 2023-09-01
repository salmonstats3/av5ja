import { CapacitorHttp, HttpOptions } from '@capacitor/core';
import snakecaseKeys from 'snakecase-keys';

import { Method } from '../src/enum/method';
import { CoopHistoryDetailQuery } from '../src/requests/av5ja/coop_history_detail_query';
import { CoopHistoryQuery } from '../src/requests/av5ja/coop_history_query';
import { StageScheduleQuery } from '../src/requests/av5ja/stage_schedule_query';
import { GraphQL } from '../src/utils/graph_ql';

import token from './token.json';
import { SplatNet2 } from '../src/utils/splatnet2';

/**
 * GraphQLリクエストを送信する
 * @param request リクエスト
 * @param bullet_token トークン
 * @returns レスポンス
 */
async function request<T extends GraphQL, U extends ReturnType<T['request']>>(request: T, bullet_token: string): Promise<U> {
    const url = new URL('https://api.lp1.av5ja.srv.nintendo.net/api/graphql');
    const body = JSON.stringify({
        extensions: {
            persistedQuery: {
                sha256Hash: request.hash,
                version: 1,
            },
        },
        variables: request.parameters,
    });
    const version = '4.0.0-b8c1e0fc';
    const headers = {
        Authorization: `Bearer ${bullet_token}`,
        'Content-Type': 'application/json',
        'X-Web-View-Ver': version,
    };
    const options: HttpOptions = {
        data: body,
        headers: headers,
        method: Method.POST,
        responseType: 'json',
        url: url.href,
    };
    const response = await CapacitorHttp.request(options);
    return request.request(snakecaseKeys(response.data)) as U;
}

async function get_coop_history_details(group: CoopHistoryQuery.HistoryGroup, bullet_token: string): Promise<SplatNet2.CoopResult[]> {
    const details: CoopHistoryDetailQuery.Response[] = await Promise.all(
        group.result_id_list.map((result_id) => request(new CoopHistoryDetailQuery.Request(result_id.raw_value), bullet_token))
    );
    return details.map((detail) => new SplatNet2.CoopResult(group, detail.data.coop_history_detail));
}

async function get_coop_history_detail(group: CoopHistoryQuery.HistoryGroup, bullet_token: string): Promise<SplatNet2.CoopResult> {
    const detail: CoopHistoryDetailQuery.Response = await request(
        new CoopHistoryDetailQuery.Request(group.history_details.nodes[0].id.raw_value),
        bullet_token
    );
    return new SplatNet2.CoopResult(group, detail.data.coop_history_detail);
}

async function get_coop_history_results(bullet_token: string): Promise<SplatNet2.CoopResult[]> {
    const history_groups = (await request(new CoopHistoryQuery.Request(), bullet_token)).history_groups;
    return (await Promise.all(history_groups.map((group) => get_coop_history_details(group, bullet_token)))).flat();
}

describe('GraphQL', () => {
    const bullet_token = token.bullet_token;

    it('CoopHistoryQuery', async () => {
        const coop_history_query = await request(new CoopHistoryQuery.Request(), bullet_token);
        expect(coop_history_query.data.coop_result.history_groups.nodes.length).toBe(4);
    }, 5000);

    it('StageScheduleQuery', async () => {
        const stage_schedule_query = await request(new StageScheduleQuery.Request(), bullet_token);
        expect(stage_schedule_query.schedules.length).toBeGreaterThan(3);
    }, 5000);

    it('CoopHistoryDetailQuery', async () => {
        const coop_history_query = await request(new CoopHistoryQuery.Request(), bullet_token);
        expect(coop_history_query.data.coop_result.history_groups.nodes.length).toBe(4);
        const history_group = coop_history_query.history_groups[0]
        // 正常にリクエストが送れるかどうか
        const detail = await request(new CoopHistoryDetailQuery.Request(history_group.result_id_list[0].raw_value), bullet_token);
        console.log(detail.data)
        const result = new SplatNet2.CoopResult(history_group, detail.data.coop_history_detail);
        // 変換後のテスト 特に意味はない気がするが、念のため
        expect(result.id.raw_value).toBe(detail.data.coop_history_detail.id.raw_value);
        expect(result.danger_rate).toBe(detail.data.coop_history_detail.danger_rate);
        expect(result.job_bonus).toBe(detail.data.coop_history_detail.job_bonus);
        expect(result.job_rate).toBe(detail.data.coop_history_detail.job_rate);
        expect(result.job_score).toBe(detail.data.coop_history_detail.job_score);
        expect(result.kuma_point).toBe(detail.data.coop_history_detail.job_point);
        expect(result.scenario_code).toBe(detail.data.coop_history_detail.scenario_code);
        expect(result.smell_meter).toBe(detail.data.coop_history_detail.smell_meter);
        expect(result.golden_ikura_num).toBe(detail.data.coop_history_detail.golden_deliver_count);
        expect(result.ikura_num).toBe(detail.data.coop_history_detail.deliver_count);
        expect(result.schedule.stage_id).toBe(detail.data.coop_history_detail.coop_stage.id);
        expect(result.grade_id).toBe(detail.data.coop_history_detail.after_grade.id);
        expect(result.grade_point).toBe(detail.data.coop_history_detail.after_grade_point);
        expect(result.job_result.boss_id).toBe(detail.data.coop_history_detail.boss_result?.boss.id ?? null);
        expect(result.job_result.is_boss_defeated).toBe(detail.data.coop_history_detail.boss_result?.has_defeat_boss ?? null);
        expect(result.job_result.failure_wave).toBe(detail.data.coop_history_detail.result_wave === 0 ? null : detail.data.coop_history_detail.result_wave);
        expect(result.job_result.is_clear).toBe(detail.data.coop_history_detail.result_wave === 0);
        expect(result.wave_details.length).toBe(detail.data.coop_history_detail.wave_results.length);
        expect(result.wave_details.map((wave) => wave.event_type)).toStrictEqual(detail.data.coop_history_detail.wave_results.map((wave) => wave.event_wave));
        expect(result.wave_details.map((wave) => wave.water_level)).toStrictEqual(detail.data.coop_history_detail.wave_results.map((wave) => wave.water_level));
        expect(result.wave_details.map((wave) => wave.golden_ikura_num)).toStrictEqual(detail.data.coop_history_detail.wave_results.map((wave) => wave.team_deliver_count));
        expect(result.wave_details.map((wave) => wave.golden_ikura_pop_num)).toStrictEqual(detail.data.coop_history_detail.wave_results.map((wave) => wave.golden_pop_count));
        expect(result.wave_details.map((wave) => wave.quota_num)).toStrictEqual(detail.data.coop_history_detail.wave_results.map((wave) => wave.deliver_norm));
        expect(result.wave_details.map((wave) => wave.id)).toStrictEqual(detail.data.coop_history_detail.wave_results.map((wave) => wave.wave_number));
        console.log(JSON.stringify(result, null, 2))
    }, 50000);

    // it('CoopHistoryDetailQuery', async () => {
    //     const coop_history_query = await request(new CoopHistoryQuery.Request(), bullet_token);
    //     expect(coop_history_query.data.coop_result.history_groups.nodes.length).toBe(4);
    //     const history_group = coop_history_query.history_groups[0];
    //     const coop_history_detail = await get_coop_history_detail(history_group, bullet_token);
    //     console.log(JSON.stringify(coop_history_detail, null, 2));
    // }, 50000);

    // it('CoopHistoryDetailQuery All', async () => {
    //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //     const results = await get_coop_history_results(bullet_token);
    //     console.log(results.length)
    // }, 50000);
});
