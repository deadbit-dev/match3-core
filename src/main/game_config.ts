/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { CellType, NotActiveCell, NullElement, GameState, ItemInfo, StepInfo, CombinationInfo, MovedInfo } from "../game/match3_core";
import { MessageId, Messages, PosXYMessage, VoidMessage } from "../modules/modules_const";

export const IS_DEBUG_MODE = true;

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
export const VK_SHARE_URL = '';
// для андроида метрика
export const ID_YANDEX_METRICA = "";
// через сколько показать первое окно оценки
export const RATE_FIRST_SHOW = 24 * 60 * 60;
// через сколько второй раз показать 
export const RATE_SECOND_SHOW = 3 * 24 * 60 * 60;

export enum CellId {
    Base,
    Grass,
    Box
}

export enum ElementId {
    Dimonde,
    Gold,
    Topaz,
    Ruby,
    Emerald,
    VerticalRocket,
    HorizontalRocket,
    AxisRocket,
    Helicopter,
    Dynamite,
    Diskosphere
}

// игровой конфиг (сюда не пишем/не читаем если предполагается сохранение после выхода из игры)
// все обращения через глобальную переменную GAME_CONFIG
export const _GAME_CONFIG = {
    min_swipe_distance: 32,
    
    swap_element_easing: go.EASING_LINEAR,
    swap_element_time: 0.25,
    squash_element_easing: go.EASING_INCUBIC,
    squash_element_time: 0.3,
    
    dynamite_activation_duration: 1,
    helicopter_fly_duration: 0.75,
    
    damaged_element_easing: go.EASING_INOUTBACK,
    damaged_element_time: 0.55,
    damaged_element_delay: 0.1,
    damaged_element_scale: 0.5,
    
    // ---------------Вариант движения в точку-----------------
    movement_to_point: true,
    duration_of_movement_bettween_cells: 0.07,
    // --------------------------------------------------------

    // ---------------Вариант движения по каждой клетке -----------------
    // movement_to_point: false,
    // duration_of_movement_bettween_cells: 0.15,
    // ------------------------------------------------------------------

    spawn_element_easing: go.EASING_INCUBIC,
    spawn_element_time: 0.5,
    
    buster_delay: 0.5,

    default_cell_z_index: -1,
    default_element_z_index: 0,

    cell_database: {
        [CellId.Base]: {
            type: CellType.Base,
            view: 'cell_base',
        },

        [CellId.Grass]: {
            type: CellType.ActionLocked,
            cnt_acts: 0,
            view: 'cell_grass'
        },

        [CellId.Box]: {
            type: bit.bor(CellType.ActionLockedNear, CellType.Wall),
            cnt_near_acts: 0,
            is_render_under_cell: true,
            view: 'cell_box',
            z_index: 1
        }
    } as {[key in CellId]: {type: number, cnt_acts?: number, cnt_near_acts?: number, is_render_under_cell?: boolean, view: string, z_index?: number}},

    element_database: {
        [ElementId.Dimonde]: {
            type: {
                is_movable: true,
                is_clickable: false
            },
            percentage: 10,
            view: 'element_diamond'
        },

        [ElementId.Gold]: {
            type: {
                is_movable: true,
                is_clickable: false
            },
            percentage: 10,
            view: 'element_gold'
        },

        [ElementId.Topaz]: {
            type: {
                is_movable: true,
                is_clickable: false
            },
            percentage: 10,
            view: 'element_topaz'
        },
            
        [ElementId.Ruby]: {
            type: {
                is_movable: true,
                is_clickable: false
            },
            percentage: 10,
            view: 'element_ruby'
        },
        
        [ElementId.Emerald]: {
            type: {
                is_movable: true,
                is_clickable: false
            },
            percentage: 10,
            view: 'element_emerald'
        },

        [ElementId.VerticalRocket]: {
            type: {
                is_movable: true,
                is_clickable: true
            },
            percentage: 0,
            view: 'vertical_rocket_buster'
        },

        [ElementId.HorizontalRocket]: {
            type: {
                is_movable: true,
                is_clickable: true
            },
            percentage: 0,
            view: 'horizontal_rocket_buster'
        },

        [ElementId.AxisRocket]: {
            type: {
                is_movable: true,
                is_clickable: true
            },
            percentage: 0,
            view: 'axis_rocket_buster'
        },
        
        [ElementId.Helicopter]: {
            type: {
                is_movable: true,
                is_clickable: true
            },
            percentage: 0,
            view: 'helicopter_buster'
        },

        [ElementId.Dynamite]: {
            type: {
                is_movable: true,
                is_clickable: true
            },
            percentage: 0,
            view: 'dynamite_buster'
        },

        [ElementId.Diskosphere]: {
            type: {
                is_movable: true,
                is_clickable: true
            },
            percentage: 0,
            view: 'diskosphere_buster'
        }
    } as {[key in ElementId]: {type: {is_movable: boolean, is_clickable: boolean}, percentage: number, view: string}},

    base_elements: [
        ElementId.Dimonde,
        ElementId.Gold,
        ElementId.Topaz,
        ElementId.Ruby,
        ElementId.Emerald
    ],

    levels: [
        {
            // LEVEL 0
            field: {
                width: 8,
                height: 8,
                cell_size: 64,
                offset_border: 10,
                complex_move: false,
                
                cells: [
                    [NotActiveCell, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, NotActiveCell],
                    [CellId.Grass, CellId.Base, CellId.Base, CellId.Grass, CellId.Grass, CellId.Grass, CellId.Grass, CellId.Base],
                    [CellId.Grass, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base],
                    [CellId.Base, CellId.Box, CellId.Box, CellId.Base, CellId.Base, [CellId.Grass, CellId.Box], [CellId.Grass, CellId.Box], CellId.Base],
                    [CellId.Base, CellId.Box, CellId.Box, CellId.Base, CellId.Base, [CellId.Grass, CellId.Box], [CellId.Grass, CellId.Box], CellId.Base],
                    [CellId.Grass, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base],
                    [CellId.Grass, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base],
                    [NotActiveCell, CellId.Grass, CellId.Grass, CellId.Grass, CellId.Grass, CellId.Grass, CellId.Grass, NotActiveCell]
                ],

                elements: [
                    [NullElement, ElementId.Dimonde, ElementId.Gold, ElementId.Gold, ElementId.Emerald, ElementId.Gold, ElementId.Dynamite, NullElement],
                    [ElementId.Dimonde, ElementId.Ruby, ElementId.Gold, ElementId.Ruby, ElementId.Topaz, ElementId.Gold, ElementId.Dimonde, ElementId.Gold],
                    [ElementId.Dimonde, ElementId.Gold, ElementId.Topaz, ElementId.Gold, ElementId.Emerald, ElementId.Topaz, ElementId.Gold, ElementId.Topaz],
                    [ElementId.Ruby, NullElement, NullElement, ElementId.Gold, ElementId.Topaz, NullElement, ElementId.Gold, ElementId.Dimonde],
                    [ElementId.Dimonde, NullElement, NullElement, ElementId.Topaz, ElementId.Emerald, ElementId.Emerald, NullElement, ElementId.Topaz],
                    [ElementId.Gold, ElementId.Gold, ElementId.Dynamite, ElementId.Dynamite, ElementId.Gold, ElementId.Ruby, ElementId.Gold, ElementId.Gold],
                    [ElementId.Gold, ElementId.Topaz, ElementId.Gold, ElementId.Topaz, ElementId.Emerald, ElementId.Gold, ElementId.Dimonde, ElementId.Ruby],
                    [NullElement, ElementId.Topaz, ElementId.Dimonde, ElementId.Emerald, ElementId.Topaz, ElementId.Emerald, ElementId.Topaz, NullElement]
                ]
            },

            busters: {
                hammer_active: false
            }
        },
        
        {
            // LEVEL 1
            field: {
                width: 8,
                height: 8,
                cell_size: 64,
                offset_border: 10,
                complex_move: false,
                
               cells: [
                    [NotActiveCell, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, NotActiveCell],
                    [CellId.Grass, CellId.Base, CellId.Base, CellId.Grass, CellId.Grass, CellId.Grass, CellId.Grass, CellId.Base],
                    [CellId.Grass, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base],
                    [CellId.Base, CellId.Box, CellId.Box, CellId.Base, CellId.Base, CellId.Box, CellId.Box, CellId.Base],
                    [CellId.Base, CellId.Box, CellId.Box, CellId.Base, CellId.Base, CellId.Box, [CellId.Grass, CellId.Box], CellId.Base],
                    [CellId.Grass, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base],
                    [CellId.Grass, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base],
                    [NotActiveCell, CellId.Grass, CellId.Grass, CellId.Grass, CellId.Grass, CellId.Grass, CellId.Grass, NotActiveCell]
                ],

                elements: [
                    [NullElement, ElementId.Dimonde, ElementId.AxisRocket, ElementId.Gold, ElementId.Emerald, ElementId.Gold, ElementId.VerticalRocket, NullElement],
                    [ElementId.Dimonde, ElementId.Ruby, ElementId.Gold, ElementId.Ruby, ElementId.Dimonde, ElementId.Gold, ElementId.Dimonde, ElementId.Gold],
                    [ElementId.Dimonde, ElementId.Gold, ElementId.Topaz, ElementId.Gold, ElementId.Emerald, ElementId.Topaz, ElementId.Gold, ElementId.Topaz],
                    [ElementId.Ruby, NullElement, NullElement, ElementId.Gold, ElementId.Topaz, NullElement, ElementId.Gold, ElementId.Dimonde],
                    [ElementId.Dimonde, NullElement, NullElement, ElementId.Topaz, ElementId.Emerald, ElementId.Emerald, NullElement, ElementId.Topaz],
                    [ElementId.Gold, ElementId.Gold, ElementId.VerticalRocket, ElementId.HorizontalRocket, ElementId.Gold, ElementId.Ruby, ElementId.Gold, ElementId.Gold],
                    [ElementId.Gold, ElementId.Topaz, ElementId.VerticalRocket, ElementId.Topaz, ElementId.Emerald, ElementId.Gold, ElementId.Dimonde, ElementId.Ruby],
                    [NullElement, ElementId.Topaz, ElementId.Dimonde, ElementId.Emerald, ElementId.Topaz, ElementId.Emerald, ElementId.Topaz, NullElement]
                ]
            },

            busters: {
                hammer_active: false
            }
        },

        {
            // LEVEL 2
            field: {
                width: 8,
                height: 8,
                cell_size: 64,
                offset_border: 10,
                complex_move: false,
                
                cells: [
                    [NotActiveCell, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, NotActiveCell],
                    [CellId.Grass, NotActiveCell, CellId.Base, CellId.Base, CellId.Base, CellId.Base, NotActiveCell, CellId.Grass],
                    [CellId.Base, CellId.Grass, NotActiveCell, CellId.Base, CellId.Base, NotActiveCell, CellId.Grass, CellId.Base],
                    [CellId.Base, CellId.Base, CellId.Grass, NotActiveCell, NotActiveCell, CellId.Grass, CellId.Base, CellId.Base],
                    [CellId.Base, CellId.Base, CellId.Grass, NotActiveCell, NotActiveCell, CellId.Grass, CellId.Base, CellId.Base],
                    [CellId.Base, CellId.Grass, NotActiveCell, CellId.Base, CellId.Base, NotActiveCell, CellId.Grass, CellId.Base],
                    [CellId.Grass, NotActiveCell, CellId.Base, CellId.Base, CellId.Base, CellId.Base, NotActiveCell, CellId.Grass],
                    [NotActiveCell, CellId.Grass, CellId.Grass, CellId.Grass, CellId.Grass, CellId.Grass, CellId.Grass, NotActiveCell]
                ],

                elements: [
                    [NullElement, ElementId.Topaz, ElementId.Gold, ElementId.Gold, ElementId.Emerald, ElementId.Gold, ElementId.Dimonde, NullElement],
                    [ElementId.Dimonde, NullElement, ElementId.Gold, ElementId.Topaz, ElementId.Topaz, ElementId.Gold, NullElement, ElementId.Topaz],
                    [ElementId.Dimonde, ElementId.Gold, NullElement, ElementId.Emerald, ElementId.Emerald, NullElement, ElementId.Gold, ElementId.Topaz],
                    [ElementId.Ruby, ElementId.Gold, ElementId.Emerald, NullElement, NullElement, ElementId.Topaz, ElementId.Emerald, ElementId.Gold],
                    [ElementId.Dimonde, ElementId.Topaz, ElementId.Gold, NullElement, NullElement, ElementId.Topaz, ElementId.Dimonde, ElementId.Topaz],
                    [ElementId.Gold, ElementId.Gold, NullElement, ElementId.Topaz, ElementId.Gold, NullElement, ElementId.Gold, ElementId.Gold],
                    [ElementId.Helicopter, NullElement, ElementId.Gold, ElementId.Topaz, ElementId.Emerald, ElementId.Gold, NullElement, ElementId.Ruby],
                    [NullElement, ElementId.Gold, ElementId.Gold, ElementId.Emerald, ElementId.Helicopter, ElementId.Helicopter, ElementId.Gold, NullElement]
                ]
            },

            busters: {
                hammer_active: false
            }
        },

        {
            // LEVEL 3
            field: {
                width: 8,
                height: 8,
                cell_size: 64,
                offset_border: 10,
                complex_move: false,
                
                cells: [
                    [CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base],
                    [CellId.Grass, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Grass],
                    [CellId.Base, CellId.Grass, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Grass, CellId.Base],
                    [CellId.Base, CellId.Base, CellId.Grass, CellId.Base, CellId.Base, CellId.Grass, CellId.Base, CellId.Base],
                    [CellId.Base, CellId.Base, CellId.Grass, CellId.Base, CellId.Base, CellId.Grass, CellId.Base, CellId.Base],
                    [CellId.Base, CellId.Grass, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Grass, CellId.Base],
                    [CellId.Grass, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Grass],
                    [CellId.Base, CellId.Grass, CellId.Grass, CellId.Grass, CellId.Grass, CellId.Grass, CellId.Grass, CellId.Base]
                ],

                elements: [
                    [ElementId.Gold, ElementId.Topaz, ElementId.Gold, ElementId.Gold, ElementId.Emerald, ElementId.Gold, ElementId.VerticalRocket, ElementId.Ruby],
                    [ElementId.Dimonde, ElementId.Dimonde, ElementId.Gold, ElementId.Topaz, ElementId.Topaz, ElementId.Gold, ElementId.Diskosphere, ElementId.Dynamite],
                    [ElementId.Dimonde, ElementId.Gold, ElementId.Topaz, ElementId.Emerald, ElementId.Emerald, ElementId.Ruby, ElementId.Gold, ElementId.Topaz],
                    [ElementId.Ruby, ElementId.Gold, ElementId.Emerald, ElementId.Emerald, ElementId.Gold, ElementId.Topaz, ElementId.Gold, ElementId.Dimonde],
                    [ElementId.Dimonde, ElementId.Topaz, ElementId.Gold, ElementId.Ruby, ElementId.Ruby, ElementId.Topaz, ElementId.Dimonde, ElementId.Topaz],
                    [ElementId.Gold, ElementId.Gold, ElementId.Ruby, ElementId.Topaz, ElementId.Gold, ElementId.Ruby, ElementId.Gold, ElementId.Gold],
                    [ElementId.Ruby, ElementId.Ruby, ElementId.Gold, ElementId.Topaz, ElementId.Emerald, ElementId.Gold, ElementId.Ruby, ElementId.Ruby],
                    [ElementId.Emerald, ElementId.Gold, ElementId.Gold, ElementId.Emerald, ElementId.Topaz, ElementId.Dimonde, ElementId.Gold, ElementId.Ruby]
                ]
            },

            busters: {
                hammer_active: false
            }
        },
        
        {
            // LEVEL 4
            field: {
                width: 8,
                height: 8,
                cell_size: 64,
                offset_border: 10,
                complex_move: true,
                
                cells: [
                    [CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base],
                    [CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base],
                    [CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base],
                    [[CellId.Grass, CellId.Box], [CellId.Grass, CellId.Box], [CellId.Grass, CellId.Box], [CellId.Grass,CellId.Box], [CellId.Grass, CellId.Box], CellId.Base, CellId.Base, CellId.Base],
                    [CellId.Grass, CellId.Grass, CellId.Grass, CellId.Grass, [CellId.Grass, CellId.Box], CellId.Base, CellId.Base, CellId.Base],
                    [CellId.Grass, CellId.Grass, CellId.Grass, CellId.Grass, [CellId.Grass, CellId.Box], CellId.Base, CellId.Base, CellId.Base],
                    [CellId.Grass, CellId.Grass, CellId.Grass, CellId.Grass, [CellId.Grass, CellId.Box], CellId.Base, CellId.Base, CellId.Base],
                    [CellId.Grass, CellId.Grass, CellId.Grass, CellId.Grass, [CellId.Grass, CellId.Box], CellId.Base, CellId.Base, CellId.Base]
                ],

                elements: [
                    [ElementId.Gold, ElementId.Topaz, ElementId.Gold, ElementId.Gold, ElementId.Emerald, ElementId.Gold, ElementId.VerticalRocket, ElementId.Gold],
                    [ElementId.Dimonde, ElementId.Dimonde, ElementId.Gold, ElementId.Topaz, ElementId.Topaz, ElementId.Gold, ElementId.Dynamite, ElementId.Dimonde],
                    [ElementId.Dimonde, ElementId.Gold, ElementId.Topaz, ElementId.Emerald, ElementId.Helicopter, ElementId.Ruby, ElementId.Gold, ElementId.Topaz],
                    [NullElement, NullElement, NullElement, NullElement, NullElement, ElementId.Topaz, ElementId.Gold, ElementId.Dimonde],
                    [NullElement, NullElement, NullElement, NullElement, NullElement, ElementId.Topaz, ElementId.Dimonde, ElementId.Topaz],
                    [NullElement, NullElement, NullElement, NullElement, NullElement, ElementId.Ruby, ElementId.Gold, ElementId.Gold],
                    [NullElement, NullElement, NullElement, NullElement, NullElement, ElementId.Gold, ElementId.Ruby, ElementId.Ruby],
                    [NullElement, NullElement, NullElement, NullElement, NullElement, ElementId.Dimonde, ElementId.Gold, ElementId.Ruby]
                ]
            },

            busters: {
                hammer_active: false
            }
        }
    ]
};


// конфиг с хранилищем  (отсюда не читаем/не пишем, все запрашивается/меняется через GameStorage)
export const _STORAGE_CONFIG = {
    current_level: 2,
    hammer_counts: 3,
};

export type GameStepEventBuffer = {key: MessageId, value: Messages[MessageId]}[];
export type MovedElementsMessage = MovedInfo[];

export interface ElementMessage extends ItemInfo { type: number }
export interface SwapElementsMessage { element_from: ItemInfo, element_to: ItemInfo }
export interface CombinedMessage { combined_element: ItemInfo, combination: CombinationInfo }
export interface ComboMessage extends CombinedMessage { maked_element: ElementMessage }

export interface ActivationMessage { element: ItemInfo, damaged_elements: ItemInfo[] }
export interface SwapedActivationMessage extends ActivationMessage { other_element: ItemInfo }

export interface HelicopterActivationMessage extends ActivationMessage { target_element: ItemInfo | typeof NullElement }
export interface SwapedHelicoptersActivationMessage extends SwapedActivationMessage { target_elements: (ItemInfo | typeof NullElement)[] }

export interface SwapedDiskosphereActivationMessage extends SwapedActivationMessage { maked_elements: ElementMessage[] }

export interface ActivatedCellMessage extends ItemInfo { id: number, previous_id: number }
export interface RevertStepMessage { current_state: GameState, previous_state: GameState }

// пользовательские сообщения под конкретный проект, доступны типы через глобальную тип-переменную UserMessages
export type _UserMessages = {
    LOAD_FIELD: VoidMessage,
    ON_LOAD_FIELD: GameState,
    
    SWAP_ELEMENTS: StepInfo,
    ON_SWAP_ELEMENTS: SwapElementsMessage,
    ON_WRONG_SWAP_ELEMENTS: SwapElementsMessage,
    CLICK_ACTIVATION: PosXYMessage,

    SWAPED_BUSTER_WITH_DISKOSPHERE_ACTIVATED: SwapedDiskosphereActivationMessage,
    
    DISKOSPHERE_ACTIVATED: ActivationMessage,
    SWAPED_DISKOSPHERES_ACTIVATED: SwapedActivationMessage,
    SWAPED_DISKOSPHERE_WITH_BUSTER_ACTIVATED: SwapedDiskosphereActivationMessage,
    SWAPED_DISKOSPHERE_WITH_ELEMENT_ACTIVATED: SwapedActivationMessage,

    ROCKET_ACTIVATED: ActivationMessage,
    AXIS_ROCKET_ACTIVATED: ActivationMessage,
    SWAPED_ROCKETS_ACTIVATED: SwapedActivationMessage,

    HELICOPTER_ACTIVATED: HelicopterActivationMessage,
    SWAPED_HELICOPTERS_ACTIVATED: SwapedHelicoptersActivationMessage,

    DYNAMITE_ACTIVATED: ActivationMessage,
    SWAPED_DYNAMITES_ACTIVATED: SwapedActivationMessage,

    ON_COMBINED: CombinedMessage,
    ON_COMBO: ComboMessage,
    ON_CELL_ACTIVATED: ActivatedCellMessage,
    
    ON_MOVED_ELEMENTS: MovedElementsMessage,
    ON_GAME_STEP: GameStepEventBuffer,
    
    TRY_REVERT_STEP: VoidMessage,
    REVERT_STEP: VoidMessage,
    ON_REVERT_STEP: RevertStepMessage,

    ON_ELEMENT_ACTIVATED: ItemInfo,
    UPDATED_HAMMER: VoidMessage
};