/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { CellType, NullElement, NotActiveCell } from "../game/match3";
import { CellId, CellDatabaseValue, ElementId, ElementDatabaseValue } from "../game/game_logic";

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

// игровой конфиг (сюда не пишем/не читаем если предполагается сохранение после выхода из игры)
// все обращения через глобальную переменную GAME_CONFIG
export const _GAME_CONFIG = {
    min_swipe_distance: 32,
    swap_element_easing: go.EASING_LINEAR,
    swap_element_time: 0.25,
    cell_database: new Map<CellId, CellDatabaseValue>([
        [
            CellId.Base,
            {
                type: CellType.Base,
                is_active: true,
                view: 'cell_base'
            }
        ],

        [
            CellId.Ice,
            {
                type: CellType.ActionLocked,
                is_active: true,
                view: 'cell_ice'
            }
        ]
    ]), 

    element_database: new Map<ElementId, ElementDatabaseValue>([
        [
            ElementId.Dimonde,
            {
                type: {
                    index: ElementId.Dimonde,
                    is_movable: true,
                    is_clickable: false
                },
                view: 'element_dimonde'
            }
        ],

        [
            ElementId.Gold,
            {
                type: {
                    index: ElementId.Gold,
                    is_movable: true,
                    is_clickable: false
                },
                view: 'element_gold'
            }
        ],

        [
            ElementId.Topaz,
            {
                type: {
                    index: ElementId.Topaz,
                    is_movable: true,
                    is_clickable: false
                },
                view: 'element_topaz'
            }
        ]
    ]),

    levels: [
        {
            // LEVEL 0
            field: {
                width: 8,
                height: 8,
                cell_size: 64,
                offset_border: 10,
                cells: [
                    [CellId.Ice, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base],
                    [CellId.Ice, CellId.Base, CellId.Base, CellId.Ice, CellId.Ice, CellId.Ice, CellId.Ice, CellId.Base],
                    [CellId.Ice, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base],
                    [NotActiveCell, NotActiveCell, CellId.Base, CellId.Base, CellId.Base,CellId.Base, NotActiveCell, CellId.Base],
                    [NotActiveCell, NotActiveCell, CellId.Base, CellId.Base, CellId.Base,CellId.Base, NotActiveCell, CellId.Base],
                    [CellId.Ice, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base],
                    [CellId.Ice, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base, CellId.Base],
                    [CellId.Ice, CellId.Ice, CellId.Ice, CellId.Ice, CellId.Ice, CellId.Ice, CellId.Ice, CellId.Base]
                ],
                elements: [
                    [ElementId.Gold, ElementId.Dimonde, ElementId.Gold, ElementId.Gold, ElementId.Dimonde, ElementId.Gold, ElementId.Gold, ElementId.Topaz],
                    [ElementId.Dimonde, ElementId.Topaz, ElementId.Topaz, ElementId.Gold, ElementId.Dimonde, ElementId.Gold, ElementId.Dimonde, ElementId.Gold],
                    [ElementId.Dimonde, ElementId.Gold, ElementId.Topaz, ElementId.Dimonde, ElementId.Topaz, ElementId.Topaz, ElementId.Gold, ElementId.Topaz],
                    [NullElement, NullElement, NullElement, ElementId.Gold, ElementId.Gold, NullElement, NullElement, ElementId.Dimonde],
                    [NullElement, NullElement, NullElement, ElementId.Topaz, ElementId.Gold, NullElement, NullElement, ElementId.Gold],
                    [ElementId.Gold, ElementId.Gold, ElementId.Dimonde, ElementId.Dimonde, ElementId.Topaz, ElementId.Dimonde, ElementId.Gold, ElementId.Gold],
                    [ElementId.Dimonde, ElementId.Topaz, ElementId.Gold, ElementId.Topaz, ElementId.Gold, ElementId.Gold, ElementId.Dimonde, ElementId.Gold],
                    [ElementId.Gold, ElementId.Gold, ElementId.Dimonde, ElementId.Gold, ElementId.Topaz, ElementId.Topaz, ElementId.Gold, ElementId.Topaz]
                ]
            }
        }
    ]
};


// конфиг с хранилищем  (отсюда не читаем/не пишем, все запрашивается/меняется через GameStorage)
export const _STORAGE_CONFIG = {
    current_level: 0
};


// пользовательские сообщения под конкретный проект, доступны типы через глобальную тип-переменную UserMessages
export type _UserMessages = {
    //
};