local ____exports = {}
local ____match3_core = require("game.match3_core")
local CellType = ____match3_core.CellType
local NotActiveCell = ____match3_core.NotActiveCell
local NullElement = ____match3_core.NullElement
local ____math_utils = require("utils.math_utils")
local Direction = ____math_utils.Direction
____exports.IS_DEBUG_MODE = true
____exports.ADS_CONFIG = {
    is_mediation = true,
    id_banners = {},
    id_inters = {},
    id_reward = {},
    banner_on_init = true,
    ads_interval = 4 * 60,
    ads_delay = 30
}
____exports.VK_SHARE_URL = ""
____exports.ID_YANDEX_METRICA = ""
____exports.RATE_FIRST_SHOW = 24 * 60 * 60
____exports.RATE_SECOND_SHOW = 3 * 24 * 60 * 60
____exports.CellId = CellId or ({})
____exports.CellId.Base = 0
____exports.CellId[____exports.CellId.Base] = "Base"
____exports.CellId.Ice = 1
____exports.CellId[____exports.CellId.Ice] = "Ice"
____exports.ElementId = ElementId or ({})
____exports.ElementId.Dimonde = 0
____exports.ElementId[____exports.ElementId.Dimonde] = "Dimonde"
____exports.ElementId.Gold = 1
____exports.ElementId[____exports.ElementId.Gold] = "Gold"
____exports.ElementId.Topaz = 2
____exports.ElementId[____exports.ElementId.Topaz] = "Topaz"
____exports.ElementId.Ruby = 3
____exports.ElementId[____exports.ElementId.Ruby] = "Ruby"
____exports.ElementId.Emerald = 4
____exports.ElementId[____exports.ElementId.Emerald] = "Emerald"
____exports.ElementId.Helicopter = 5
____exports.ElementId[____exports.ElementId.Helicopter] = "Helicopter"
____exports.ElementId.VerticalBuster = 6
____exports.ElementId[____exports.ElementId.VerticalBuster] = "VerticalBuster"
____exports.ElementId.HorizontalBuster = 7
____exports.ElementId[____exports.ElementId.HorizontalBuster] = "HorizontalBuster"
____exports.ElementId.AxisBuster = 8
____exports.ElementId[____exports.ElementId.AxisBuster] = "AxisBuster"
____exports._GAME_CONFIG = {
    min_swipe_distance = 32,
    swap_element_easing = go.EASING_LINEAR,
    swap_element_time = 0.25,
    move_elements_easing = go.EASING_INOUTBACK,
    move_elements_time = 0.75,
    move_delay_after_combination = 1,
    wait_time_after_move = 0.5,
    damaged_element_easing = go.EASING_INOUTBACK,
    damaged_element_time = 0.5,
    damaged_element_delay = 0.1,
    damaged_element_scale = 0.5,
    combined_element_easing = go.EASING_INCUBIC,
    combined_element_time = 0.3,
    spawn_element_easing = go.EASING_INCUBIC,
    spawn_element_time = 0.5,
    buster_delay = 0.5,
    cell_database = {[____exports.CellId.Base] = {type = CellType.Base, is_active = true, view = "cell_base"}, [____exports.CellId.Ice] = {type = CellType.ActionLocked, is_active = true, view = "cell_ice"}},
    element_database = {
        [____exports.ElementId.Dimonde] = {type = {index = ____exports.ElementId.Dimonde, is_movable = true, is_clickable = false}, percentage = 19, view = "element_diamond"},
        [____exports.ElementId.Gold] = {type = {index = ____exports.ElementId.Gold, is_movable = true, is_clickable = false}, percentage = 19, view = "element_gold"},
        [____exports.ElementId.Topaz] = {type = {index = ____exports.ElementId.Topaz, is_movable = true, is_clickable = false}, percentage = 19, view = "element_topaz"},
        [____exports.ElementId.Ruby] = {type = {index = ____exports.ElementId.Ruby, is_movable = true, is_clickable = false}, percentage = 19, view = "element_ruby"},
        [____exports.ElementId.Emerald] = {type = {index = ____exports.ElementId.Emerald, is_movable = true, is_clickable = false}, percentage = 19, view = "element_emerald"},
        [____exports.ElementId.Helicopter] = {type = {index = ____exports.ElementId.Helicopter, is_movable = true, is_clickable = true}, percentage = 2, view = "helicopter"},
        [____exports.ElementId.VerticalBuster] = {type = {index = ____exports.ElementId.VerticalBuster, is_movable = true, is_clickable = true}, percentage = 1, view = "vertical_buster"},
        [____exports.ElementId.HorizontalBuster] = {type = {index = ____exports.ElementId.HorizontalBuster, is_movable = true, is_clickable = true}, percentage = 1, view = "horizontal_buster"},
        [____exports.ElementId.AxisBuster] = {type = {index = ____exports.ElementId.AxisBuster, is_movable = true, is_clickable = true}, percentage = 1, view = "axis_buster"}
    },
    levels = {{field = {
        width = 8,
        height = 8,
        cell_size = 64,
        offset_border = 10,
        move_direction = Direction.Up,
        cells = {
            {
                NotActiveCell,
                ____exports.CellId.Base,
                ____exports.CellId.Base,
                ____exports.CellId.Base,
                ____exports.CellId.Base,
                ____exports.CellId.Base,
                ____exports.CellId.Base,
                NotActiveCell
            },
            {
                ____exports.CellId.Ice,
                ____exports.CellId.Base,
                ____exports.CellId.Base,
                ____exports.CellId.Ice,
                ____exports.CellId.Ice,
                ____exports.CellId.Ice,
                ____exports.CellId.Ice,
                ____exports.CellId.Base
            },
            {
                ____exports.CellId.Ice,
                ____exports.CellId.Base,
                ____exports.CellId.Base,
                ____exports.CellId.Base,
                ____exports.CellId.Base,
                ____exports.CellId.Base,
                ____exports.CellId.Base,
                ____exports.CellId.Base
            },
            {
                ____exports.CellId.Base,
                NotActiveCell,
                NotActiveCell,
                ____exports.CellId.Base,
                ____exports.CellId.Base,
                NotActiveCell,
                NotActiveCell,
                ____exports.CellId.Base
            },
            {
                ____exports.CellId.Base,
                NotActiveCell,
                NotActiveCell,
                ____exports.CellId.Base,
                ____exports.CellId.Base,
                NotActiveCell,
                NotActiveCell,
                ____exports.CellId.Base
            },
            {
                ____exports.CellId.Ice,
                ____exports.CellId.Base,
                ____exports.CellId.Base,
                ____exports.CellId.Base,
                ____exports.CellId.Base,
                ____exports.CellId.Base,
                ____exports.CellId.Base,
                ____exports.CellId.Base
            },
            {
                ____exports.CellId.Ice,
                ____exports.CellId.Base,
                ____exports.CellId.Base,
                ____exports.CellId.Base,
                ____exports.CellId.Base,
                ____exports.CellId.Base,
                ____exports.CellId.Base,
                ____exports.CellId.Base
            },
            {
                NotActiveCell,
                ____exports.CellId.Ice,
                ____exports.CellId.Ice,
                ____exports.CellId.Ice,
                ____exports.CellId.Ice,
                ____exports.CellId.Ice,
                ____exports.CellId.Ice,
                NotActiveCell
            }
        },
        elements = {
            {
                NullElement,
                ____exports.ElementId.Dimonde,
                ____exports.ElementId.Gold,
                ____exports.ElementId.Gold,
                ____exports.ElementId.Dimonde,
                ____exports.ElementId.Gold,
                ____exports.ElementId.Emerald,
                NullElement
            },
            {
                ____exports.ElementId.Dimonde,
                ____exports.ElementId.Topaz,
                ____exports.ElementId.Topaz,
                ____exports.ElementId.Gold,
                ____exports.ElementId.Dimonde,
                ____exports.ElementId.Gold,
                ____exports.ElementId.Dimonde,
                ____exports.ElementId.Gold
            },
            {
                ____exports.ElementId.Dimonde,
                ____exports.ElementId.Gold,
                ____exports.ElementId.Topaz,
                ____exports.ElementId.Emerald,
                ____exports.ElementId.Gold,
                ____exports.ElementId.Topaz,
                ____exports.ElementId.Gold,
                ____exports.ElementId.Topaz
            },
            {
                ____exports.ElementId.Ruby,
                NullElement,
                NullElement,
                ____exports.ElementId.Gold,
                ____exports.ElementId.Emerald,
                NullElement,
                NullElement,
                ____exports.ElementId.Dimonde
            },
            {
                ____exports.ElementId.Dimonde,
                NullElement,
                NullElement,
                ____exports.ElementId.Topaz,
                ____exports.ElementId.Emerald,
                NullElement,
                NullElement,
                ____exports.ElementId.Topaz
            },
            {
                ____exports.ElementId.Gold,
                ____exports.ElementId.Gold,
                ____exports.ElementId.Dimonde,
                ____exports.ElementId.Emerald,
                ____exports.ElementId.Topaz,
                ____exports.ElementId.Ruby,
                ____exports.ElementId.Gold,
                ____exports.ElementId.Gold
            },
            {
                ____exports.ElementId.Gold,
                ____exports.ElementId.Topaz,
                ____exports.ElementId.Gold,
                ____exports.ElementId.Topaz,
                ____exports.ElementId.Emerald,
                ____exports.ElementId.Gold,
                ____exports.ElementId.Dimonde,
                ____exports.ElementId.Ruby
            },
            {
                NullElement,
                ____exports.ElementId.Ruby,
                ____exports.ElementId.Emerald,
                ____exports.ElementId.Emerald,
                ____exports.ElementId.Gold,
                ____exports.ElementId.Emerald,
                ____exports.ElementId.Gold,
                NullElement
            }
        }
    }, busters = {hammer_active = false}}}
}
____exports._STORAGE_CONFIG = {current_level = 0, hammer_counts = 3}
return ____exports
