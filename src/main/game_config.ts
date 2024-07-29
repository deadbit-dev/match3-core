/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { NullElement, CoreState, ItemInfo, StepInfo, CombinationInfo, MovedInfo, Element, CombinationType, Cell, NotActiveCell, CellState } from "../game/match3_core";
import { CellId, ElementId, GameState, Level, RandomElement, SubstrateId, Target, TargetState, TutorialData } from "../game/match3_game";
import { MessageId, Messages, NameMessage, PosXYMessage, VoidMessage } from "../modules/modules_const";
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
    min_lifes: 0,
    max_lifes: 3,

    animal_offset: true,

    min_swipe_distance: 32,
    
    swap_element_easing: go.EASING_LINEAR,
    swap_element_time: 0.25,

    squash_element_easing: go.EASING_INCUBIC,
    squash_element_time: 0.25,

    helicopter_spin_duration: 0.5 + 0.75,
    helicopter_fly_duration: 0.75,

    damaged_element_easing: go.EASING_INOUTBACK,
    damaged_element_time: 0.25,
    damaged_element_delay: 0,
    damaged_element_scale: 0.3,

    base_cell_color: sys.get_sys_info().system_name == 'HTML5' ? html5.run(`new URL(location).searchParams.get('color')||'#c29754'`) : '#c29754',

    complex_move: true,

    movement_to_point: sys.get_sys_info().system_name == 'HTML5' ? (html5.run(`new URL(location).searchParams.get('move')==null`) == 'true') : true,
    duration_of_movement_bettween_cells: sys.get_sys_info().system_name == 'HTML5' ? tonumber(html5.run(`new URL(location).searchParams.get('time')||0.05`))! : 0.05,

    spawn_element_easing: go.EASING_INCUBIC,
    spawn_element_time: 0.5,

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

    cell_view: {
        [CellId.Base]: 'cell_white',
        [CellId.Grass]: 'cell_grass',
        [CellId.Flowers]: 'cell_flowers',
        [CellId.Web]: 'cell_web',
        [CellId.Box]: 'cell_box',
        [CellId.Stone0]: 'cell_stone_0',
        [CellId.Stone1]: 'cell_stone_1',
        [CellId.Stone2]: 'cell_stone_2',
        [CellId.Lock]: 'cell_lock'
    } as { [key in CellId]: string },
    
    activation_cells: [
        CellId.Web,
        CellId.Grass,
        CellId.Flowers
    ],

    near_activated_cells: [
        CellId.Box,
        CellId.Stone0,
        CellId.Stone1,
        CellId.Stone2
    ],
    
    disabled_cells: [
        CellId.Box,
        CellId.Stone0,
        CellId.Stone1,
        CellId.Stone2,
        CellId.Lock
    ],

    not_moved_cells: [
        CellId.Box,
        CellId.Stone0,
        CellId.Stone1,
        CellId.Stone2,
        CellId.Web
    ],

    top_layer_cells: [
        CellId.Box,
        CellId.Stone0,
        CellId.Stone1,
        CellId.Stone2,
        CellId.Web,
        CellId.Lock
    ],

    element_view: {
        [ElementId.Dimonde]: 'element_diamond',
        [ElementId.Gold]: 'element_gold',
        [ElementId.Topaz]: 'element_topaz',
        [ElementId.Ruby]: 'element_ruby',
        [ElementId.Emerald]: 'element_emerald',
        [ElementId.VerticalRocket]: 'vertical_rocket_buster',
        [ElementId.HorizontalRocket]: 'horizontal_rocket_buster',
        [ElementId.AxisRocket]: 'axis_rocket_buster',
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
        [ElementId.VerticalRocket]: '',
        [ElementId.HorizontalRocket]: '',
        [ElementId.AxisRocket]: '',
        [ElementId.Helicopter]: '',
        [ElementId.Dynamite]: '',
        [ElementId.Diskosphere]: '',
        [ElementId.Cheese]: '',
        [ElementId.Cabbage]: '',
        [ElementId.Acorn]: '',
        [ElementId.RareMeat]: '',
        [ElementId.MediumMeat]: '',
        [ElementId.Chicken]: '',
        [ElementId.SunFlower]: '',
        [ElementId.Salad]: '' ,
        [ElementId.Hay]: ''
    },

    explodable_cells: [
        CellId.Box,
        CellId.Grass,
        CellId.Stone0,
        CellId.Stone1,
        CellId.Stone2
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
        ElementId.AxisRocket,
        ElementId.Dynamite,
        ElementId.Helicopter,
        ElementId.Diskosphere
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
            bounds: {from_x: 3, from_y: 4, to_x: 6, to_y: 6},
            step: {from_x: 5, from_y: 4, to_x: 5, to_y: 5},
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
            bounds: {from_x: 3, from_y: 3, to_x: 5, to_y: 7},
            step: {from_x: 4, from_y: 4, to_x: 3, to_y: 4},
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
            bounds: {from_x: 3, from_y: 3, to_x: 8, to_y: 5},
            step: {from_x: 5, from_y: 3, to_x: 5, to_y: 4},
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
            bounds: {from_x: 3, from_y: 3, to_x: 6, to_y: 5},
            step: {from_x: 5, from_y: 3, to_x: 5, to_y: 4},
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
            bounds: {from_x: 5, from_y: 3, to_x: 8, to_y: 5},
            step: {from_x: 7, from_y: 3, to_x: 7, to_y: 4},
            text: {
                data: "tutorial_grass",
                pos: vmath.vector3(0, 320, 0)
            }
        },
        6: {
            busters: 'hammer',
            text: {
                data: "tutorial_hammer",
                pos: vmath.vector3(0, 50, 0)
            }
        },
        9: {
            busters: 'spinning',
            text: {
                data: "tutorial_spinning",
                pos: vmath.vector3(0, 50, 0)
            }
        },
        10: {
            cells: [
                {x: 3, y: 4}, {x: 4, y: 4}, {x: 5, y: 4}, {x: 6, y: 4},
                {x: 3, y: 5}, {x: 4, y: 5}, {x: 5, y: 5}, {x: 6, y: 5}
            ],
            bounds: {from_x: 3, from_y: 4, to_x: 7, to_y: 6},
            step: {from_x: 3, from_y: 4, to_x: 4, to_y: 4},
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
            bounds: {from_x: 6, from_y: 4, to_x: 9, to_y: 6},
            step: {from_x: 6, from_y: 4, to_x: 6, to_y: 5},
            text: {
                data: "tutorial_web",
                pos: vmath.vector3(0, 270, 0)
            }
        },
        17: {
            busters: ['horizontal_rocket', 'vertical_rocket'],
            text: {
                data: "tutorial_rockets",
                pos: vmath.vector3(0, 50, 0)
            }
        }
    } as TutorialData,

    levels: [] as Level[],
    
    is_revive: false,
    revive_state: {} as GameState,

    is_busy_input: false
};


// конфиг с хранилищем  (отсюда не читаем/не пишем, все запрашивается/меняется через GameStorage)
export const _STORAGE_CONFIG = {
    current_level: 0,
    completed_levels: [] as number[],
    
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

export type GameStepEventBuffer = { key: MessageId, value: Messages[MessageId] }[];
export type MovedElementsMessage = { elements: MovedInfo[], state: GameState };

export interface GameStepMessage { events: GameStepEventBuffer, state: GameState }

export interface ElementMessage extends ItemInfo { type: number }
export interface ElementActivationMessage extends ItemInfo { activated_cells: ActivatedCellMessage[] }
export interface SwapElementsMessage { from: {x: number, y: number}, to: {x: number, y: number}, element_from: Element, element_to: Element | typeof NullElement, state: GameState }
export interface CombinedMessage { combined_element: ItemInfo, combination: CombinationInfo, activated_cells: ActivatedCellMessage[], maked_element?: ElementMessage }
export interface StepHelperMessage { step: StepInfo, combined_element: ItemInfo, elements: ItemInfo[] }

export interface ActivationMessage { element: ItemInfo, damaged_elements: ItemInfo[], activated_cells: ActivatedCellMessage[] }
export interface SwapedActivationMessage extends ActivationMessage { other_element: ItemInfo }

export interface RocketActivationMessage extends ActivationMessage { axis: Axis }

export interface HelicopterActivationMessage extends ActivationMessage { target_element: ItemInfo | typeof NullElement }
export interface SwapedHelicoptersActivationMessage extends SwapedActivationMessage { target_elements: (ItemInfo | typeof NullElement)[] }
export interface SwapedHelicopterWithElementMessage extends SwapedActivationMessage { target_element: ItemInfo | typeof NullElement }

export interface SwapedDiskosphereActivationMessage extends SwapedActivationMessage { maked_elements: ElementMessage[] }

export interface ActivatedCellMessage extends ItemInfo { id: number, previous_id: number }
export interface RevertStepMessage { current_state: GameState, previous_state: GameState }

export interface TargetMessage { id: number, amount: number, type: number, is_cell: boolean }

export type SpinningActivationMessage = { element_from: ItemInfo, element_to: ItemInfo }[];

// пользовательские сообщения под конкретный проект, доступны типы через глобальную тип-переменную UserMessages
export type _UserMessages = {
    SYS_LOAD_RESOURCE: NameMessage,
    SYS_UNLOAD_RESOURCE: NameMessage,

    REQUEST_LOAD_FIELD: VoidMessage,
    ON_LOAD_FIELD: GameState,

    INIT_UI: VoidMessage,

    UPDATED_STATE: GameState,
    UPDATED_CELLS_STATE: CellState,

    GAME_TIMER: number,

    SET_HELPER: VoidMessage,

    SWAP_ELEMENTS: StepInfo,
    ON_SWAP_ELEMENTS: SwapElementsMessage,
    ON_WRONG_SWAP_ELEMENTS: SwapElementsMessage,
    CLICK_ACTIVATION: PosXYMessage,

    TRY_ACTIVATE_SPINNING: VoidMessage,
    TRY_ACTIVATE_HAMMER: VoidMessage,
    TRY_ACTIVATE_HORIZONTAL_ROCKET: VoidMessage,
    TRY_ACTIVATE_VERTICAL_ROCKET: VoidMessage,
    ACTIVATE_SPINNING: VoidMessage,
    ACTIVATE_HAMMER: VoidMessage,
    ACTIVATE_VERTICAL_ROCKET: VoidMessage,
    ACTIVATE_HORIZONTAL_ROCKET: VoidMessage,
    
    ON_SPINNING_ACTIVATED: SpinningActivationMessage,

    ON_ELEMENT_SELECTED: ItemInfo,
    ON_ELEMENT_UNSELECTED: ItemInfo,

    ON_SET_STEP_HELPER: StepHelperMessage,
    ON_RESET_STEP_HELPER: StepHelperMessage,

    ON_BUSTER_ACTIVATION: VoidMessage,

    SWAPED_BUSTER_WITH_DISKOSPHERE_ACTIVATED: SwapedDiskosphereActivationMessage,

    DISKOSPHERE_ACTIVATED: ActivationMessage,
    SWAPED_DISKOSPHERES_ACTIVATED: SwapedActivationMessage,
    SWAPED_DISKOSPHERE_WITH_BUSTER_ACTIVATED: SwapedDiskosphereActivationMessage,
    SWAPED_DISKOSPHERE_WITH_ELEMENT_ACTIVATED: SwapedActivationMessage,

    ROCKET_ACTIVATED: RocketActivationMessage,
    SWAPED_ROCKETS_ACTIVATED: SwapedActivationMessage,

    HELICOPTER_ACTIVATED: HelicopterActivationMessage,
    SWAPED_HELICOPTERS_ACTIVATED: SwapedHelicoptersActivationMessage,
    SWAPED_HELICOPTER_WITH_ELEMENT_ACTIVATED: SwapedHelicopterWithElementMessage,

    DYNAMITE_ACTIVATED: ActivationMessage,
    SWAPED_DYNAMITES_ACTIVATED: SwapedActivationMessage,

    ON_COMBINED: CombinedMessage,

    ON_MOVED_ELEMENTS: MovedElementsMessage,
    ON_GAME_STEP: GameStepMessage,
    ON_GAME_STEP_ANIMATION_END: VoidMessage,

    TRY_REVERT_STEP: VoidMessage,
    REVERT_STEP: VoidMessage,
    ON_REVERT_STEP: RevertStepMessage,

    ON_ELEMENT_ACTIVATED: ElementActivationMessage,

    UPDATED_BUTTONS: VoidMessage,
    UPDATED_STEP_COUNTER: number,
    UPDATED_TIMER: number,
    UPDATED_TARGET: TargetMessage,

    ON_WIN: VoidMessage,
    ON_GAME_OVER: GameState,

    SET_TUTORIAL: VoidMessage,
    REMOVE_TUTORIAL: VoidMessage,

    DLG_ACTIVE: boolean,

    LIFE_NOTIFICATION: boolean,
    NOT_ENOUGH_LIFE: VoidMessage,

    ADDED_LIFE: VoidMessage,
    REMOVED_LIFE: VoidMessage,

    ADDED_COIN: VoidMessage,
    REMOVED_COIN: VoidMessage,

    REQUEST_OPEN_STORE: VoidMessage,

    TRY_BUY_HAMMER: VoidMessage,
    TRY_BUY_SPINNING: VoidMessage,
    TRY_BUY_HORIZONTAL_ROCKET: VoidMessage,
    TRY_BUY_VERTICAL_ROCKET: VoidMessage,

    SET_LIFE_NOTIFICATION: VoidMessage,
    REVIVE: number,

    SHUFFLE: GameState
};