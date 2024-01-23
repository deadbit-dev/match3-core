/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { CellType, NotActiveCell, ElementType, NullElement, MoveDirection } from "../game/match3";

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
    Ice
}

export interface CellDatabaseValue {
    type: CellType;
    is_active: boolean;
    view: string;
}

export enum ElementId {
    Gold,
    Dimonde,
    Topaz,
    Ruby,
    Emerald
}

export interface ElementDatabaseValue {
    type: ElementType;
    view: string;
}

export enum ComboType {
    Vertical,
    Horizontal,
    All
}

// игровой конфиг (сюда не пишем/не читаем если предполагается сохранение после выхода из игры)
// все обращения через глобальную переменную GAME_CONFIG
export const _GAME_CONFIG = {
    game_animation_speed_cof: 1,

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

    combined_element_easing: go.EASING_INCUBIC,
    combined_element_time: 0.3,

    spawn_element_easing: go.EASING_INCUBIC,
    spawn_element_time: 0.5,
    
    buster_delay: 0.5,

    cell_database: {
        [CellId.Base]: {
            type: CellType.Base,
            is_active: true,
            view: 'cell_base'
        },

        [CellId.Ice]: {
            type: CellType.ActionLocked,
            is_active: true,
            view: 'cell_ice'
        }
    },

    element_database: {
        [ElementId.Dimonde]: {
            type: {
                index: ElementId.Dimonde,
                is_movable: true,
                is_clickable: false
            },
            view: 'element_diamond'
        },

        [ElementId.Gold]: {
            type: {
                index: ElementId.Gold,
                is_movable: true,
                is_clickable: false
            },
            view: 'element_gold'
        },

        [ElementId.Topaz]: {
            type: {
                index: ElementId.Topaz,
                is_movable: true,
                is_clickable: false
            },
            view: 'element_topaz'
        },
            
        [ElementId.Ruby]: {
            type: {
                index: ElementId.Ruby,
                is_movable: true,
                is_clickable: false
            },
            view: 'element_ruby'
        },
        
        [ElementId.Emerald]: {
            type: {
                index: ElementId.Emerald,
                is_movable: true,
                is_clickable: false
            },
            view: 'element_emerald'
        },
    },

    combo_graphics: {
        [ComboType.All]: 'combo_all',
        [ComboType.Horizontal]: 'combo_horizontal',
        [ComboType.Vertical]: 'combo_vertical'
    },

    levels: [
        {
            // LEVEL 0
            field: {
                width: 8,
                height: 8,
                cell_size: 64,
                offset_border: 10,
                move_direction: MoveDirection.Up,
                
                
                
                cells: [
                    [NotActiveCell, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, NotActiveCell],
                    [CellId.Ice, CellId.Base, CellId.Base, CellId.Ice, CellId.Ice, CellId.Ice, CellId.Ice, CellId.Base],
                    [CellId.Ice, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base],
                    [CellId.Base, NotActiveCell, NotActiveCell, CellId.Base, CellId.Base, NotActiveCell, NotActiveCell, CellId.Base],
                    [CellId.Base, NotActiveCell, NotActiveCell, CellId.Base, CellId.Base, NotActiveCell, NotActiveCell, CellId.Base],
                    [CellId.Ice, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base],
                    [CellId.Ice, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base],
                    [NotActiveCell, CellId.Ice, CellId.Ice, CellId.Ice, CellId.Ice, CellId.Ice, CellId.Ice, NotActiveCell]
                ],

                elements: [
                    [NullElement, ElementId.Dimonde, ElementId.Gold, ElementId.Gold, ElementId.Dimonde, ElementId.Gold, ElementId.Emerald, NullElement],
                    [ElementId.Dimonde, ElementId.Topaz, ElementId.Topaz, ElementId.Gold, ElementId.Dimonde, ElementId.Gold, ElementId.Dimonde, ElementId.Gold],
                    [ElementId.Dimonde, ElementId.Gold, ElementId.Topaz, ElementId.Dimonde, ElementId.Topaz, ElementId.Topaz, ElementId.Gold, ElementId.Topaz],
                    [ElementId.Ruby, NullElement, NullElement, ElementId.Gold, ElementId.Ruby, NullElement, NullElement, ElementId.Dimonde],
                    [ElementId.Dimonde, NullElement, NullElement, ElementId.Topaz, ElementId.Ruby, NullElement, NullElement, ElementId.Topaz],
                    [ElementId.Gold, ElementId.Gold, ElementId.Dimonde, ElementId.Emerald, ElementId.Emerald, ElementId.Ruby, ElementId.Gold, ElementId.Gold],
                    [ElementId.Dimonde, ElementId.Topaz, ElementId.Gold, ElementId.Emerald, ElementId.Topaz, ElementId.Gold, ElementId.Dimonde, ElementId.Ruby],
                    [NullElement, ElementId.Emerald, ElementId.Emerald, ElementId.Gold, ElementId.Emerald, ElementId.Topaz, ElementId.Gold, NullElement]
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
    //
};