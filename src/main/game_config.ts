/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { CellType, NotActiveCell, ElementType, NullElement } from "../game/match3_core";
import { VoidMessage } from "../modules/modules_const";
import { Direction } from "../utils/math_utils";
// import { band } from "../utils/utils";

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
    VerticalBuster,
    HorizontalBuster,
    AxisBuster,
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
            type_id: CellId.Base,
            type: CellType.Base,
            view: 'cell_base'
        },

        [CellId.Grass]: {
            type_id: CellId.Grass,
            type: CellType.ActionLocked,
            cnt_acts: 0,
            view: 'cell_grass'
        },

        [CellId.Box]: {
            type_id: CellId.Box,
            type: bit.bor(CellType.ActionLockedNear, CellType.Wall),
            cnt_near_acts: 0,
            view: 'cell_box'
        }
    } as {[key in CellId]: {type_id: number, type: number, cnt_acts?: number, cnt_near_acts?: number, view: string}},

    element_database: {
        [ElementId.Dimonde]: {
            type: {
                index: ElementId.Dimonde,
                is_movable: true,
                is_clickable: false
            },
            percentage: 10,
            view: 'element_diamond'
        },

        [ElementId.Gold]: {
            type: {
                index: ElementId.Gold,
                is_movable: true,
                is_clickable: false
            },
            percentage: 10,
            view: 'element_gold'
        },

        [ElementId.Topaz]: {
            type: {
                index: ElementId.Topaz,
                is_movable: true,
                is_clickable: false
            },
            percentage: 10,
            view: 'element_topaz'
        },
            
        [ElementId.Ruby]: {
            type: {
                index: ElementId.Ruby,
                is_movable: true,
                is_clickable: false
            },
            percentage: 10,
            view: 'element_ruby'
        },
        
        [ElementId.Emerald]: {
            type: {
                index: ElementId.Emerald,
                is_movable: true,
                is_clickable: false
            },
            percentage: 10,
            view: 'element_emerald'
        },

        [ElementId.VerticalBuster]: {
            type: {
                index: ElementId.VerticalBuster,
                is_movable: true,
                is_clickable: true
            },
            percentage: 0,
            view: 'vertical_buster'
        },

        [ElementId.HorizontalBuster]: {
            type: {
                index: ElementId.HorizontalBuster,
                is_movable: true,
                is_clickable: true
            },
            percentage: 0,
            view: 'horizontal_buster'
        },

        [ElementId.AxisBuster]: {
            type: {
                index: ElementId.AxisBuster,
                is_movable: true,
                is_clickable: true
            },
            percentage: 0,
            view: 'axis_buster'
        },
        
        [ElementId.Helicopter]: {
            type: {
                index: ElementId.Helicopter,
                is_movable: true,
                is_clickable: true
            },
            percentage: 0,
            view: 'helicopter_buster'
        },

        [ElementId.Dynamite]: {
            type: {
                index: ElementId.Dynamite,
                is_movable: true,
                is_clickable: true
            },
            percentage: 0,
            view: 'dynamite_buster'
        },

        [ElementId.Diskosphere]: {
            type: {
                index: ElementId.Diskosphere,
                is_movable: true,
                is_clickable: true
            },
            percentage: 0,
            view: 'diskosphere_buster'
        }
    } as {[key in ElementId]: {type: ElementType, percentage: number, view: string}},

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
                    [CellId.Base, CellId.Box, CellId.Box, CellId.Base, CellId.Base, CellId.Box, CellId.Box, CellId.Base],
                    [CellId.Grass, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base],
                    [CellId.Grass, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base],
                    [NotActiveCell, CellId.Grass, CellId.Grass, CellId.Grass, CellId.Grass, CellId.Grass, CellId.Grass, NotActiveCell]
                ],

                elements: [
                    [NullElement, ElementId.Dimonde, ElementId.Gold, ElementId.Gold, ElementId.HorizontalBuster, ElementId.HorizontalBuster, ElementId.Emerald, NullElement],
                    [ElementId.Dimonde, ElementId.VerticalBuster, ElementId.VerticalBuster, ElementId.Diskosphere, ElementId.Diskosphere, ElementId.Gold, ElementId.Dimonde, ElementId.Gold],
                    [ElementId.Dimonde, ElementId.Gold, ElementId.Topaz, ElementId.Dynamite, ElementId.Emerald, ElementId.Topaz, ElementId.Gold, ElementId.Topaz],
                    [ElementId.Ruby, NullElement, NullElement, ElementId.Gold, ElementId.Topaz, NullElement, ElementId.Gold, ElementId.Dimonde],
                    [ElementId.Dimonde, NullElement, NullElement, ElementId.Topaz, ElementId.Emerald, ElementId.HorizontalBuster, NullElement, ElementId.Topaz],
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


// пользовательские сообщения под конкретный проект, доступны типы через глобальную тип-переменную UserMessages
export type _UserMessages = {
    REVERT_STEP: VoidMessage
};