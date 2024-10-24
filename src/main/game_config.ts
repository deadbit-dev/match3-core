/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { NullElement, SwapInfo, CombinationInfo, MoveInfo, Element, DamageInfo, Position, ElementInfo } from "../game/core";
import { Level } from "../game/level";
import { CellId, ElementId, TargetType, GameState, TutorialData, LockInfo, UnlockInfo, TargetState } from "../game/game";
import { SubstrateId } from "../game/view";
import { NameMessage, VoidMessage } from "../modules/modules_const";
import { Axis } from "../utils/math_utils";

export const IS_DEBUG_MODE = true;
export const IS_HUAWEI = sys.get_sys_info().system_name == 'Android' && sys.get_config("android.package").includes('huawei');

// параметры инициализации для ADS
export const ADS_CONFIG = {
    is_mediation: true,
    id_banners: [],
    id_inters: [],
    id_reward: [],
    banner_on_init: true,
    ads_interval: 4 * 60,
    ads_delay: 30,
};

// для вк
export const VK_SHARE_URL = 'https://vk.com/app51867396';
export const OK_SHARE_TEXT = '';
// для андроида метрика
export const ID_YANDEX_METRICA = sys.get_sys_info().system_name == 'Android' ? "c1ce595b-7bf8-4b99-b487-0457f8da7b95" : "91a2fd82-b0de-4fb2-b3a7-03bff14b9d09";
// через сколько показать первое окно оценки
export const RATE_FIRST_SHOW = 24 * 60 * 60;
// через сколько второй раз показать 
export const RATE_SECOND_SHOW = 3 * 24 * 60 * 60;

export const MAIN_BUNDLE_SCENES = ['game'];


// игровой конфиг (сюда не пишем/не читаем если предполагается сохранение после выхода из игры)
// все обращения через глобальную переменную GAME_CONFIG
export const _GAME_CONFIG = {
    min_swipe_distance: 32,
    swap_element_easing: go.EASING_INOUTQUAD,
    swap_element_time: 0.15,

    combination_delay: 0.2,

    squash_easing: go.EASING_INCUBIC,
    squash_time: 0.25,

    falling_dalay: 0.05,
    falling_time: 0.15,

    max_lifes: 3,

    delay_before_win: 0.5,
    delay_before_gameover: 2,

    animal_offset: true,
    animal_level_delay_before_win: 5,

    fade_value: 0.9,

    helicopter_spin_duration: 0.5 + 2,
    helicopter_fly_duration: 2,

    damaged_element_easing: go.EASING_INOUTBACK,
    damaged_element_time: 0.25,
    damaged_element_delay: 0,
    damaged_element_scale: 0.3,

    base_cell_color: sys.get_sys_info().system_name == 'HTML5' ? html5.run(`new URL(location).searchParams.get('color')||'#c29754'`) : '#c29754',

    spawn_element_easing: go.EASING_INCUBIC,
    spawn_element_time: 0.5,

    shuffle_max_attempt: 2,

    default_substrate_z_index: -2,
    default_cell_z_index: -1,
    default_element_z_index: 0,
    default_top_layer_cell_z_index: 2,
    default_vfx_z_index: 2.5,

    substrate_view: {
        [SubstrateId.OutsideArc]: 'outside_arc',
        [SubstrateId.OutsideInsideAngle]: 'outside_inside_angle',
        [SubstrateId.OutsideAngle]: 'outside_angle',
        [SubstrateId.LeftRightStrip]: 'left_right_strip',
        [SubstrateId.LeftStripTopBottomInsideAngle]: 'left_strip_top_inside_angle',
        [SubstrateId.LeftStripTopInsideAngle]: 'left_strip_top_inside_angle',
        [SubstrateId.LeftStripBottomInsideAngle]: 'left_strip_bottom_inside_angle',
        [SubstrateId.LeftStrip]: 'left_strip',
        [SubstrateId.TopBottomInsideAngle]: 'top_bottom_inside_angle',
        [SubstrateId.InsideAngle]: 'inside_angle',
        [SubstrateId.Full]: 'full'
    } as { [key in SubstrateId]: string },

    // last view first for activation
    cell_view: {
        [CellId.Base]: 'cell_white',
        [CellId.Grass]: ['cell_grass_1', 'cell_grass'],
        [CellId.Flowers]: 'cell_flowers',
        [CellId.Web]: 'cell_web',
        [CellId.Box]: 'cell_box',
        [CellId.Stone]: ['cell_stone_2', 'cell_stone_1', 'cell_stone']
    } as { [key in CellId]: string | string[] },

    sounded_cells: [CellId.Box, CellId.Web, CellId.Grass, CellId.Stone],
    cell_sound: {
        [CellId.Box]: 'wood',
        [CellId.Grass]: 'grass',
        [CellId.Web]: 'web',
        [CellId.Stone]: 'stone'
    } as { [key in number]: string},

    cell_strength: {
        [CellId.Box]: 1,
        [CellId.Flowers]: 1,
        [CellId.Grass]: 2,
        [CellId.Stone]: 3,
        [CellId.Web]: 1
    } as { [key in CellId]: number},
    
    damage_cells: [
        CellId.Web,
        CellId.Grass,
        CellId.Flowers
    ],

    near_damage_cells: [
        CellId.Box,
        CellId.Stone,
    ],
    
    disabled_cells: [
        CellId.Box,
        CellId.Stone
    ],

    not_moved_cells: [
        CellId.Box,
        CellId.Stone,
        CellId.Web
    ],

    top_layer_cells: [
        CellId.Box,
        CellId.Stone,
        CellId.Web
    ],

    element_view: {
        [ElementId.Dimonde]: 'element_diamond',
        [ElementId.Gold]: 'element_gold',
        [ElementId.Topaz]: 'element_topaz',
        [ElementId.Ruby]: 'element_ruby',
        [ElementId.Emerald]: 'element_emerald',
        [ElementId.VerticalRocket]: 'vertical_rocket_buster',
        [ElementId.HorizontalRocket]: 'horizontal_rocket_buster',
        [ElementId.AllAxisRocket]: 'axis_rocket_buster',
        [ElementId.Helicopter]: 'helicopter_buster',
        [ElementId.Dynamite]: 'dynamite_buster',
        [ElementId.Diskosphere]: 'diskosphere_buster',
        [ElementId.Cheese]: 'element_cheese',
        [ElementId.Cabbage]: 'element_cabbage',
        [ElementId.Acorn]: 'element_acorn',
        [ElementId.RareMeat]: 'element_rare_meat',
        [ElementId.MediumMeat]: 'element_medium_meat',
        [ElementId.Chicken]: 'element_chicken',
        [ElementId.SunFlower]: 'element_sunflower',
        [ElementId.Salad]: 'element_salad' ,
        [ElementId.Hay]: 'element_hay',
    } as { [key in ElementId]: string },

    element_colors: {
        [ElementId.Dimonde]: 'blue',
        [ElementId.Gold]: 'yellow',
        [ElementId.Topaz]: 'purple',
        [ElementId.Ruby]: 'red',
        [ElementId.Emerald]: 'green',
        [ElementId.Cheese]: 'yellow',
        [ElementId.Cabbage]: 'green',
        [ElementId.Acorn]: 'yellow',
        [ElementId.RareMeat]: 'red',
        [ElementId.MediumMeat]: 'red',
        [ElementId.Chicken]: 'red',
        [ElementId.SunFlower]: 'yellow',
        [ElementId.Salad]: 'green' ,
        [ElementId.Hay]: 'yellow'
    } as {[key in number]: string},

    explodable_cells: [
        CellId.Box,
        CellId.Grass,
        CellId.Stone,
    ],

    base_elements: [
        ElementId.Dimonde,
        ElementId.Gold,
        ElementId.Topaz,
        ElementId.Ruby,
        ElementId.Emerald
    ],

    feed_elements: [
        ElementId.Acorn,
        ElementId.Cheese,
        ElementId.Chicken,
        ElementId.Cabbage,
        ElementId.Hay,
        ElementId.MediumMeat,
        ElementId.RareMeat,
        ElementId.Salad,
        ElementId.SunFlower
    ],

    buster_elements: [
        ElementId.VerticalRocket,
        ElementId.HorizontalRocket,
        ElementId.AllAxisRocket,
        ElementId.Dynamite,
        ElementId.Helicopter,
        ElementId.Diskosphere
    ],

    rockets: [
        ElementId.VerticalRocket,
        ElementId.HorizontalRocket,
        ElementId.AllAxisRocket
    ],

    animal_levels: [4, 11, 18, 25, 32, 39, 47],
    level_to_animal: {
        4: 'cock',
        11: 'kozel',
        18: 'kaban',
        25: 'goose',
        32: 'rats',
        39: 'dog',
        47: 'bull'
    } as {[key in number]: string},

    tutorial_levels: [1, 2, 3, 4, 5, 6, 9, 10, 13, 17],
    tutorials_data: {
        1: {
            cells: 
            [
                                            {x: 5, y: 4},
                {x: 3, y: 5}, {x: 4, y: 5}, {x: 5, y: 5}
            ],
            bounds: {
                from: {x: 3, y: 4},
                to: {x: 6, y: 6}
            },
            step: {
                from: {x: 5, y: 4},
                to: {x: 5, y: 5}
            },
            text: {
                data: "tutorial_collect",
                pos: vmath.vector3(0, 320, 0)
            }
        },
        2: {
            cells: [
                {x: 3, y: 3},
                {x: 3, y: 4}, {x: 4, y: 4},
                {x: 3, y: 5},
                {x: 3, y: 6},
            ],
            bounds: {
                from: {x: 3, y: 3},
                to: {x: 5, y: 7}
            },
            step: {
                from: {x: 4, y: 4},
                to: {x: 3, y: 4}
            },
            text: { 
                data: "tutorial_collect_rocket",
                pos: vmath.vector3(0, 320, 0)
            },
            arrow_pos: vmath.vector3(70, -85, 0),
            buster_icon: { 
                icon: "rocket_icon",
                pos: vmath.vector3(-30, -190, 0)
            }
        },
        3: {
            cells: [
                                            {x: 5, y: 3},
                {x: 3, y: 4}, {x: 4, y: 4}, {x: 5, y: 4}, {x: 6, y: 4}, {x: 7, y: 4}
            ],
            bounds: {
                from: {x: 3, y: 3},
                to: {x: 8, y: 5}
            },
            step: {
                from: {x: 5, y: 3},
                to: {x: 5, y: 4}
            },
            text: {
                data: "tutorial_collect_diskosphere",
                pos: vmath.vector3(0, 320, 0)
            },
            arrow_pos: vmath.vector3(70, -85, 0),
            buster_icon: { 
                icon: "diskosphere_icon",
                pos: vmath.vector3(-30, -190, 0)
            }
        },
        4: {
            cells: [
                                            {x: 5, y: 3},
                {x: 3, y: 4}, {x: 4, y: 4}, {x: 5, y: 4}
            ],
            bounds: {
                from: {x: 3, y: 3},
                to: {x: 6, y: 5}
            },
            step: {
                from: {x: 5, y: 3},
                to: {x: 5, y: 4}
            },
            text: {
                data: "tutorial_timer",
                pos: vmath.vector3(0, 320, 0)
            }
        },
        5: {
            cells: [
                                            {x: 7, y: 3},
                {x: 5, y: 4}, {x: 6, y: 4}, {x: 7, y: 4},
            ],
            bounds: {
                from: {x: 5, y: 3},
                to: {x: 8, y: 5}
            },
            step: {
                from: {x: 7, y: 3},
                to: {x: 7, y: 4}
            },
            text: {
                data: "tutorial_grass",
                pos: vmath.vector3(0, 320, 0)
            }
        },
        6: {
            busters: 'hammer',
            text: {
                data: "tutorial_hammer",
                pos: vmath.vector3(0, 390, 0)
            },
            bounds: {
                from: {x:0, y: 0},
                to: {x:10, y: 10}
            }
        },
        9: {
            busters: 'spinning',
            text: {
                data: "tutorial_spinning",
                pos: vmath.vector3(0, 390, 0)
            },
            bounds: {
                from: {x:0, y: 0},
                to: {x:10, y: 10}
            }
        },
        10: {
            cells: [
                {x: 3, y: 4}, {x: 4, y: 4}, {x: 5, y: 4}, {x: 6, y: 4},
                {x: 3, y: 5}, {x: 4, y: 5}, {x: 5, y: 5}, {x: 6, y: 5}
            ],
            bounds: {
                from: {x: 3, y: 4},
                to: {x: 7, y: 6}
            },
            step: {
                from: {x: 3, y: 4},
                to: {x: 4, y: 4}
            },
            text: {
                data: "tutorial_box",
                pos: vmath.vector3(0, 250, 0)
            }
        },
        13: {
            cells: [
                {x: 6, y: 4}, 
                {x: 6, y: 5}, {x: 7, y: 5}, {x: 8, y: 5},
            ],
            bounds: {
                from: {x: 6, y: 4},
                to: {x: 9, y: 6}
            },
            step: {
                from: {x: 6, y: 4},
                to: {x: 6, y: 5}
            },
            text: {
                data: "tutorial_web",
                pos: vmath.vector3(0, 270, 0)
            }
        },
        17: {
            busters: ['horizontal_rocket', 'vertical_rocket'],
            text: {
                data: "tutorial_rockets",
                pos: vmath.vector3(0, 390, 0)
            },
            bounds: {
                from: {x:0, y: 0},
                to: {x:10, y: 10}
            }
        }
    } as TutorialData,

    levels: [] as Level[],
    
    is_revive: false,
    is_restart: false,
    revive_states: {} as GameState[],

    is_busy_input: false,

    steps_by_ad: 0
};


// конфиг с хранилищем  (отсюда не читаем/не пишем, все запрашивается/меняется через GameStorage)
export const _STORAGE_CONFIG = {
    current_level: 0,
    completed_levels: [] as number[],

    sound_bg: true,
    
    move_showed: false,
    
    map_last_pos_y: 0,
    
    hammer_opened: false,
    spinning_opened: false,
    horizontal_rocket_opened: false,
    vertical_rocket_opened: false,

    hammer_counts: 0,
    spinning_counts: 0,
    horizontal_rocket_counts: 0,
    vertical_rocket_counts: 0,

    coins: 0,
    
    life: {
        start_time: 0,
        amount: 2
    },

    infinit_life: {
        is_active: false,
        start_time: 0,
        duration: 0
    },

    completed_tutorials: [] as number[]
};

export type HelperMessage = { step: SwapInfo, combined_element: Element, elements: Element[] };
export interface TargetMessage { idx: number, amount: number, id: number, type: TargetType }
export interface SwapElementsMessage extends SwapInfo { element_from: Element, element_to: Element | typeof NullElement }
export interface CombinateMessage { combined_positions: Position[] }
export interface ResponseCombinateMessage { pos: Position, combination: CombinationInfo }
export interface CombinedMessage { pos: Position, damages: DamageInfo[], maked_element?: Element }
export interface CombinateBustersMessage { buster_from: ElementInfo, buster_to: ElementInfo }
export interface RequestElementMessage { pos: Position, element: Element }
export interface BusterActivatedMessage { pos: Position, uid: number, damages: DamageInfo[] }
export interface DynamiteActivatedMessage extends BusterActivatedMessage { big_range: boolean }
export interface RocketActivatedMessage extends BusterActivatedMessage { axis: Axis }

// TODO: refactor
export interface HelicopterActivatedMessage extends BusterActivatedMessage { triple: boolean, buster?: ElementId }
export interface HelicopterActionMessage extends BusterActivatedMessage { buster?: ElementId }
export interface DiskosphereActivatedMessage extends BusterActivatedMessage { buster?: ElementId }
export interface DiskosphereDamageElementMessage { damage_info: DamageInfo, buster?: ElementId }

export enum Dlg {
    Store,
    NotEnoughCoins,
    LifeNotification,
    Settings,
    Hammer,
    VerticalRocket,
    HorizontalRocket,
    Spinning
}

// пользовательские сообщения под конкретный проект, доступны типы через глобальную тип-переменную UserMessages
export type _UserMessages = {
    SYS_LOAD_RESOURCE: NameMessage,
    SYS_UNLOAD_RESOURCE: NameMessage,

    REQUEST_LOAD_GAME: VoidMessage,
    RESPONSE_LOAD_GAME: GameState,

    REQUEST_CLICK: Position,

    REQUEST_TRY_SWAP_ELEMENTS: SwapInfo,
    RESPONSE_SWAP_ELEMENTS: SwapElementsMessage,
    RESPONSE_WRONG_SWAP_ELEMENTS: SwapElementsMessage,
    REQUEST_SWAP_ELEMENTS_END: SwapElementsMessage,

    REQUEST_TRY_ACTIVATE_BUSTER_AFTER_SWAP: SwapElementsMessage,

    RESPONSE_COMBINATE_BUSTERS: CombinateBustersMessage,
    REQUEST_COMBINED_BUSTERS: CombinateBustersMessage,

    REQUEST_COMBINATE: CombinateMessage,
    RESPONSE_COMBINATE: CombinationInfo,
    RESPONSE_COMBINATE_NOT_FOUND: Position,
    REQUEST_COMBINATION: CombinationInfo,
    RESPONSE_COMBINATION: CombinedMessage,
    REQUEST_COMBINATION_END: DamageInfo[],

    REQUEST_FALLING: Position,
    REQUEST_FALL_END: Position,
    RESPONSE_FALLING: MoveInfo,
    RESPONSE_FALLING_NOT_FOUND: Position;
    RESPONSE_FALL_END: ElementInfo,

    REQUESTED_ELEMENT: RequestElementMessage,

    RESPONSE_HAMMER_DAMAGE: DamageInfo,

    RESPONSE_DYNAMITE_ACTIVATED: DynamiteActivatedMessage,
    REQUEST_DYNAMITE_ACTION: DynamiteActivatedMessage,
    RESPONSE_DYNAMITE_ACTION: DynamiteActivatedMessage,

    RESPONSE_ACTIVATED_ROCKET: RocketActivatedMessage,
    REQUEST_ROCKET_END: DamageInfo[],

    RESPONSE_ACTIVATED_DISKOSPHERE: DiskosphereActivatedMessage,
    REQUEST_DISKOSPHERE_DAMAGE_ELEMENT_END: DiskosphereDamageElementMessage,
    DISKOSPHERE_ACTIVATED_END: Position,

    RESPONSE_ACTIVATED_HELICOPTER: HelicopterActivatedMessage,
    REQUEST_HELICOPTER_ACTION: HelicopterActivatedMessage,
    RESPONSE_HELICOPTER_ACTION: HelicopterActionMessage,
    REQUEST_HELICOPTER_START_FLYING: BusterActivatedMessage,
    REQUEST_HELICOPTER_END: BusterActivatedMessage,

    SHUFFLE_START: VoidMessage,
    SHUFFLE_ACTION: GameState,
    SHUFFLE_END: VoidMessage,

    //---------------------------------------------------------------

    INIT_UI: VoidMessage,
    UPDATED_STEP_COUNTER: number,
    UPDATED_TARGET: { idx: number, target: TargetState },
    UPDATED_TARGET_UI: TargetMessage,

    ADDED_LIFE: VoidMessage,
    REMOVED_LIFE: VoidMessage,

    ADDED_COIN: VoidMessage,
    REMOVED_COIN: VoidMessage,

    OPENED_DLG: Dlg,
    CLOSED_DLG: Dlg,

    LIFE_NOTIFICATION: boolean,
    NOT_ENOUGH_LIFE: VoidMessage,

    ON_WIN: VoidMessage,
    ON_WIN_END: GameState,
    ON_GAME_OVER: {state: GameState, revive: boolean},

    MOVIE_END: VoidMessage,

    UPDATED_STATE: GameState,

    GAME_TIMER: number,

    SWAP_ELEMENTS: SwapInfo,

    ACTIVATE_BUSTER: NameMessage,

    // ON_ELEMENT_SELECTED: ItemInfo,
    // ON_ELEMENT_UNSELECTED: ItemInfo,

    SET_HELPER: HelperMessage,
    RESET_HELPER: HelperMessage,
    STOP_HELPER: HelperMessage,

    UPDATED_BUTTONS: VoidMessage,
    UPDATED_TIMER: number,

    SET_TUTORIAL: LockInfo,
    REMOVE_TUTORIAL: UnlockInfo,

    REQUEST_OPEN_STORE: VoidMessage,

    TRY_BUY_HAMMER: VoidMessage,
    TRY_BUY_SPINNING: VoidMessage,
    TRY_BUY_HORIZONTAL_ROCKET: VoidMessage,
    TRY_BUY_VERTICAL_ROCKET: VoidMessage,

    SET_LIFE_NOTIFICATION: VoidMessage,
    REVIVE: number,    

    SET_ANIMAL_TUTORIAL_TIP: VoidMessage,
    HIDED_ANIMAL_TUTORIAL_TIP: VoidMessage,
    FEED_ANIMAL: number,
    SET_WIN_UI: VoidMessage,

    REQUEST_IDLE: VoidMessage,

    REQUEST_RELOAD_FIELD: VoidMessage,
    RESPONSE_RELOAD_FIELD: GameState,

    MAKED_ELEMENT: Position,

    REQUEST_REWIND: VoidMessage,
    RESPONSE_REWIND: GameState,
    OPEN_SETTINGS: VoidMessage,
    FORCE_REMOVE_ELEMENT: number
};