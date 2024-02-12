/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { CellType, NotActiveCell, NullElement, GameState, ItemInfo, Element, StepInfo, CombinationInfo } from "../game/match3_core";
import { MessageId, Messages, PosXYMessage, VoidMessage } from "../modules/modules_const";
import { Direction } from "../utils/math_utils";

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

    move_elements_easing: go.EASING_INOUTBACK,
    move_elements_time: 0.75,
    move_delay_after_combination: 1,
    wait_time_after_move: 0.5,
    
    damaged_element_easing: go.EASING_INOUTBACK,
    damaged_element_time: 0.5,
    damaged_element_delay: 0.1,
    damaged_element_scale: 0.5,

    squash_element_easing: go.EASING_INCUBIC,
    squash_element_time: 0.3,

    spawn_element_easing: go.EASING_INCUBIC,
    spawn_element_time: 0.5,
    
    buster_delay: 0.5,

    cell_database: {
        [CellId.Base]: {
            type: CellType.Base,
            view: 'cell_base'
        },

        [CellId.Grass]: {
            type: CellType.ActionLocked,
            cnt_acts: 0,
            view: 'cell_grass'
        },

        [CellId.Box]: {
            type: bit.bor(CellType.ActionLockedNear, CellType.Wall),
            cnt_near_acts: 0,
            view: 'cell_box'
        }
    } as {[key in CellId]: {type: number, cnt_acts?: number, cnt_near_acts?: number, view: string}},

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
                move_direction: Direction.Up,
                
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
                    [NullElement, ElementId.Dimonde, ElementId.Gold, ElementId.Gold, ElementId.HorizontalRocket, ElementId.HorizontalRocket, ElementId.Emerald, NullElement],
                    [ElementId.Dimonde, ElementId.VerticalRocket, ElementId.VerticalRocket, ElementId.Diskosphere, ElementId.Diskosphere, ElementId.Gold, ElementId.Dimonde, ElementId.Gold],
                    [ElementId.Dimonde, ElementId.Gold, ElementId.Topaz, ElementId.Dynamite, ElementId.Emerald, ElementId.Topaz, ElementId.Gold, ElementId.Topaz],
                    [ElementId.Ruby, NullElement, NullElement, ElementId.Gold, ElementId.Topaz, NullElement, ElementId.Gold, ElementId.Dimonde],
                    [ElementId.Dimonde, NullElement, NullElement, ElementId.Topaz, ElementId.Emerald, ElementId.HorizontalRocket, NullElement, ElementId.Topaz],
                    [ElementId.Gold, ElementId.Gold, ElementId.Dynamite, ElementId.Dynamite, ElementId.Gold, ElementId.Ruby, ElementId.Gold, ElementId.Gold],
                    [ElementId.Gold, ElementId.Topaz, ElementId.Gold, ElementId.Topaz, ElementId.Emerald, ElementId.Gold, ElementId.Dimonde, ElementId.Ruby],
                    [NullElement, ElementId.Helicopter, ElementId.Helicopter, ElementId.Emerald, ElementId.Topaz, ElementId.Emerald, ElementId.Helicopter, NullElement]
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
                move_direction: Direction.Up,
                
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
                    [NullElement, ElementId.Topaz, ElementId.Gold, ElementId.Gold, ElementId.Emerald, ElementId.Gold, ElementId.VerticalRocket, NullElement],
                    [ElementId.Dimonde, ElementId.Topaz, ElementId.Gold, ElementId.Topaz, ElementId.Topaz, ElementId.Gold, ElementId.Dimonde, ElementId.Diskosphere],
                    [ElementId.Dimonde, ElementId.Gold, ElementId.Topaz, ElementId.Dynamite, ElementId.Emerald, ElementId.Topaz, ElementId.Gold, ElementId.Topaz],
                    [ElementId.Ruby, NullElement, NullElement, ElementId.Gold, ElementId.Topaz, NullElement, ElementId.Gold, ElementId.Dimonde],
                    [ElementId.Dimonde, NullElement, NullElement, ElementId.Topaz, ElementId.Emerald, NullElement, NullElement, ElementId.Topaz],
                    [ElementId.Gold, ElementId.Gold, ElementId.Emerald, ElementId.Topaz, ElementId.Gold, ElementId.Ruby, ElementId.Gold, ElementId.Gold],
                    [ElementId.Helicopter, ElementId.Topaz, ElementId.Gold, ElementId.Topaz, ElementId.Emerald, ElementId.Gold, ElementId.Dimonde, ElementId.Ruby],
                    [NullElement, ElementId.Gold, ElementId.Gold, ElementId.Emerald, ElementId.Topaz, ElementId.HorizontalRocket, ElementId.Gold, NullElement]
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
                move_direction: Direction.Up,
                
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
                    [NullElement, ElementId.Topaz, ElementId.Gold, ElementId.Gold, ElementId.Emerald, ElementId.Gold, ElementId.VerticalRocket, NullElement],
                    [ElementId.Dimonde, NullElement, ElementId.Gold, ElementId.Topaz, ElementId.Topaz, ElementId.Gold, NullElement, ElementId.Diskosphere],
                    [ElementId.Dimonde, ElementId.Gold, NullElement, ElementId.Dynamite, ElementId.Emerald, NullElement, ElementId.Gold, ElementId.Topaz],
                    [ElementId.Ruby, ElementId.Gold, ElementId.Emerald, NullElement, NullElement, ElementId.Topaz, ElementId.Gold, ElementId.Dimonde],
                    [ElementId.Dimonde, ElementId.Topaz, ElementId.Gold, NullElement, NullElement, ElementId.Topaz, ElementId.Dimonde, ElementId.Topaz],
                    [ElementId.Gold, ElementId.Gold, NullElement, ElementId.Topaz, ElementId.Gold, NullElement, ElementId.Gold, ElementId.Gold],
                    [ElementId.Helicopter, NullElement, ElementId.Gold, ElementId.Topaz, ElementId.Emerald, ElementId.Gold, NullElement, ElementId.Ruby],
                    [NullElement, ElementId.Gold, ElementId.Gold, ElementId.Emerald, ElementId.Topaz, ElementId.HorizontalRocket, ElementId.Gold, NullElement]
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
                move_direction: Direction.Up,
                
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
                    [ElementId.Dimonde, ElementId.Dimonde, ElementId.Gold, ElementId.Topaz, ElementId.Topaz, ElementId.Gold, ElementId.Ruby, ElementId.Diskosphere],
                    [ElementId.Dimonde, ElementId.Gold, ElementId.Topaz, ElementId.Dynamite, ElementId.Emerald, ElementId.Ruby, ElementId.Gold, ElementId.Topaz],
                    [ElementId.Ruby, ElementId.Gold, ElementId.Emerald, ElementId.Emerald, ElementId.Gold, ElementId.Topaz, ElementId.Gold, ElementId.Dimonde],
                    [ElementId.Dimonde, ElementId.Topaz, ElementId.Gold, ElementId.Ruby, ElementId.Ruby, ElementId.Topaz, ElementId.Dimonde, ElementId.Topaz],
                    [ElementId.Gold, ElementId.Gold, ElementId.Ruby, ElementId.Topaz, ElementId.Gold, ElementId.Ruby, ElementId.Gold, ElementId.Gold],
                    [ElementId.Helicopter, ElementId.Ruby, ElementId.Gold, ElementId.Topaz, ElementId.Emerald, ElementId.Gold, ElementId.Ruby, ElementId.Ruby],
                    [ElementId.Emerald, ElementId.Gold, ElementId.Gold, ElementId.Emerald, ElementId.Topaz, ElementId.HorizontalRocket, ElementId.Gold, ElementId.Ruby]
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


export interface ElementMessage extends ItemInfo { type: number }
export interface SwapElementsMessage { element_from: ItemInfo, element_to: ItemInfo }
export interface CombinedMessage { combined_element: ItemInfo, combination: CombinationInfo }
export interface ActivatedCellMessage extends ItemInfo { variety: number, previous_id: number }
export interface MoveElementMessage extends StepInfo { element: Element }
export interface DamagedElementMessage { id: number }
export interface RevertStepMessage { current_state: GameState, previous_state: GameState }

// пользовательские сообщения под конкретный проект, доступны типы через глобальную тип-переменную UserMessages
export type _UserMessages = {
    SET_FIELD: VoidMessage,
    ON_SET_FIELD: GameState,
    ON_MAKE_ELEMENT: ElementMessage,
    
    SWAP_ELEMENTS: StepInfo,
    ON_SWAP_ELEMENTS: SwapElementsMessage,
    ON_WRONG_SWAP_ELEMENTS: SwapElementsMessage,
    CLICK_ACTIVATION: PosXYMessage,
    
    BUSTER_ACTIVATED: VoidMessage,

    ON_COMBINED: VoidMessage,
    ON_COMBO: CombinedMessage,
    ON_CELL_ACTIVATED: ActivatedCellMessage,
    ON_MOVE_ELEMENT: MoveElementMessage,
    ON_DAMAGED_ELEMENT: DamagedElementMessage,
    ON_REQUEST_ELEMENT: ElementMessage,

    END_MOVE_PHASE: VoidMessage,

    GAME_STEP: GameStepEventBuffer,
    
    TRY_REVERT_STEP: VoidMessage,
    REVERT_STEP: VoidMessage,
    ON_REVERT_STEP: RevertStepMessage,

    UPDATED_HAMMER: VoidMessage
};