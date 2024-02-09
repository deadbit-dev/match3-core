/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { CellType, NotActiveCell, NullElement, GameState, ItemInfo, Cell, Element, ElementType, StepInfo, CombinationInfo } from "../game/match3_core";
import { PosXYMessage, VoidMessage } from "../modules/modules_const";
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

export const MANAGER_ID = 'main:/manager';
export const UI_ID = '/ui#game';
export const LOGIC_ID = '/game_logic#game';
export const VIEW_ID = '/game_view#view';

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
        }
    ]
};


// конфиг с хранилищем  (отсюда не читаем/не пишем, все запрашивается/меняется через GameStorage)
export const _STORAGE_CONFIG = {
    current_level: 0,
    hammer_counts: 3,
};

export interface CellMessage extends ItemInfo { variety: number }
export interface ElementMessage extends ItemInfo { type: number }
export interface SwapElementsMessage { element_from: ItemInfo, element_to: ItemInfo }
export interface CombinedMessage { combined_element: ItemInfo, combination: CombinationInfo }
export interface MoveElementMessage extends StepInfo { element: Element }
export interface DamagedElementMessage { id: number }
export interface RevertStepMessage { current_state: GameState, previous_state: GameState }

// пользовательские сообщения под конкретный проект, доступны типы через глобальную тип-переменную UserMessages
export type _UserMessages = {
    ON_MAKE_CELL: CellMessage,
    ON_MAKE_ELEMENT: ElementMessage,
    SWAP_ELEMENTS: StepInfo,
    ON_SWAP_ELEMENTS: SwapElementsMessage,
    CLICK_ACTIVATION: PosXYMessage,
    ON_COMBINED: CombinedMessage,
    ON_MOVE_ELEMENT: MoveElementMessage,
    ON_DAMAGED_ELEMENT: DamagedElementMessage,
    ON_REQUEST_ELEMENT: ItemInfo,
    REVERT_STEP: VoidMessage,
    ON_REVERT_STEP: RevertStepMessage
};