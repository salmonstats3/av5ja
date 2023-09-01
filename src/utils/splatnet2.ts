import dayjs from 'dayjs';
import { GradeId } from '../enum/grade';
import { ModeType } from '../enum/mode';
import { RuleType } from '../enum/rule';
import { SkinId } from '../enum/skin';
import { SpecieKey } from '../enum/specie';
import { CoopHistoryDetailQuery } from '../requests/av5ja/coop_history_detail_query';

import { Common } from './common';
import { id } from './weapon_info_main';
import { CoopHistoryQuery } from '../requests/av5ja/coop_history_query';

export namespace SplatNet2 {
    class Nameplate {
        readonly badges: (number | null)[];
        readonly background: CoopHistoryDetailQuery.Background;

        constructor(nameplate: CoopHistoryDetailQuery.Nameplate) {
            this.badges = nameplate.badges.map((badge) => badge?.id ?? null)
            this.background = nameplate.background
        }
    }

    class WaveResult {
        readonly id: number;
        readonly is_clear: boolean;
        readonly water_level: number;
        readonly event_type: number;
        readonly golden_ikura_num: number | null;
        readonly quota_num: number | null;
        readonly golden_ikura_pop_num: number;

        constructor(result: CoopHistoryDetailQuery.WaveResult) {
            this.id = result.wave_number
            this.water_level = result.water_level
            this.event_type = result.event_wave
            this.golden_ikura_num = result.team_deliver_count
            this.quota_num = result.deliver_norm
            this.golden_ikura_pop_num = result.golden_pop_count
        }
    }

    class JobResult {
        readonly is_clear: boolean;
        readonly failure_wave: number | null;
        readonly is_boss_defeated: boolean | null;
        readonly boss_id: number | null;

        constructor(result_wave: number, boss_result: CoopHistoryDetailQuery.BossResult | null) {
            // result_wave
            // -1: 回線落ち
            // 0: クリア/EX-WAVE失敗
            // 1: WAVE1 失敗
            // 2: WAVE2 失敗
            // 3: WAVE3 失敗
            this.is_clear = result_wave === 0
            this.failure_wave = result_wave === 0 ? null : result_wave 
            this.is_boss_defeated = boss_result?.has_defeat_boss ?? null
            this.boss_id = boss_result?.boss.id ?? null
        }
    }

    class MemberResult {
        readonly id: Common.PlayerId;
        readonly npln_user_id: string;
        readonly is_myself: boolean;
        readonly byname: string;
        readonly name: string;
        readonly name_id: string;
        readonly nameplate: Nameplate;
        readonly golden_ikura_assist_num: number;
        readonly golden_ikura_num: number;
        readonly ikura_num: number;
        readonly dead_count: number;
        readonly help_count: number;
        readonly weapon_list: number[];
        readonly special_id: number;
        readonly special_counts: number[];
        readonly boss_kill_counts: number[];
        readonly boss_counts_total: number;
        readonly uniform: SkinId;
        readonly species: SpecieKey;

        constructor(member_result: CoopHistoryDetailQuery.MemberResult, enemy_results: number[] = Array(14).fill(null)) {
            this.id = member_result.player.id
            this.npln_user_id = member_result.player.id.npln_user_id
            this.is_myself = member_result.player.id.is_myself
            this.byname = member_result.player.byname
            this.name = member_result.player.name
            this.name_id = member_result.player.name_id
            this.nameplate = new Nameplate(member_result.player.nameplate)
            this.golden_ikura_assist_num = member_result.golden_assist_count
            this.golden_ikura_num = member_result.golden_deliver_count
            this.ikura_num = member_result.deliver_count
            this.dead_count = member_result.rescued_count
            this.help_count = member_result.rescue_count
            this.weapon_list = member_result.weapons.map((weapon) => id(weapon.hash))
            this.special_id = member_result.special_weapon.id
            // this.special_counts = member_result.special_weapon
            this.boss_kill_counts = member_result.player.id.is_myself ? enemy_results : Array(14).fill(null)
            this.boss_counts_total = member_result.defeat_enemy_count
            this.uniform = member_result.player.uniform.id
            this.species = member_result.player.species
        }
    }

    class Schedule {
        readonly start_time: Date | null;
        readonly end_time: Date | null;
        readonly mode: ModeType;
        readonly rule: RuleType;
        readonly weaponList: number[];
        readonly stage_id: number;

        constructor(scheudle: CoopHistoryQuery.HistoryGroup, stage_id: number, weapon_list: number[]) {
            this.start_time = scheudle.start_time
            this.end_time = scheudle.end_time
            this.mode = scheudle.mode
            this.rule = scheudle.rule
            this.weaponList = weapon_list
            this.stage_id = stage_id
        }
    }

    export class CoopResult {
        readonly id: Common.CoopHistoryDetailId;
        readonly scale: (number | null)[];
        readonly job_score: number | null;
        readonly grade_id: GradeId | null;
        readonly kuma_point: number | null;
        readonly wave_details: WaveResult[];
        readonly job_result: JobResult;
        readonly my_result: MemberResult;
        readonly other_results: MemberResult[];
        readonly grade_point: number | null;
        readonly job_rate: number | null;
        readonly play_time: Date;
        readonly boss_counts: number[];
        readonly boss_kill_counts: number[];
        readonly danger_rate: number;
        readonly job_bonus: number | null;
        readonly schedule: Schedule;
        readonly golden_ikura_num: number;
        readonly golden_ikura_assist_num: number;
        readonly ikura_num: number;
        readonly smell_meter: number | null;
        readonly scenario_code: string | null;

        constructor(schedule: CoopHistoryQuery.HistoryGroup, result: CoopHistoryDetailQuery.CoopHistoryDetail) {
            this.id = result.id
            this.scale = result.scale === null
            ? [null, null, null]
            : result.scale;
            this.job_score = result.job_score;
            this.grade_id = result.after_grade.id
            this.kuma_point = result.job_point
            this.wave_details = result.wave_results.map((wave) => new WaveResult(wave))
            this.job_result = new JobResult(result.result_wave, result.boss_result) 
            this.my_result = new MemberResult(result.my_result, result.enemy_defeat_counts)
            this.other_results = result.member_results.map((member) => new MemberResult(member))
            this.grade_point = result.after_grade_point
            this.job_rate = result.job_rate
            this.play_time = dayjs(result.played_time).toDate()
            this.boss_counts = result.enemy_results.map((enemy) => enemy.pop_count)
            this.boss_kill_counts = result.enemy_results.map((enemy) => enemy.team_defeat_count)
            this.danger_rate = result.danger_rate
            this.job_bonus = result.job_bonus
            this.schedule = new Schedule(schedule, result.coop_stage.id, result.weapons.map((weapon) => id(weapon.hash)))
            this.golden_ikura_num = result.golden_deliver_count
            this.ikura_num = result.deliver_count
            this.smell_meter = result.smell_meter
            this.scenario_code = result.scenario_code
        }
    }
}
