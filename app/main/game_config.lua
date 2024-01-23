local ____lualib = require("lualib_bundle")
local Map = ____lualib.Map
local __TS__New = ____lualib.__TS__New
local ____exports = {}
local ____match3 = require("game.match3")
local CellType = ____match3.CellType
local NotActiveCell = ____match3.NotActiveCell
local NullElement = ____match3.NullElement
local MoveDirection = ____match3.MoveDirection
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
____exports.ElementId.Gold = 0
____exports.ElementId[____exports.ElementId.Gold] = "Gold"
____exports.ElementId.Dimonde = 1
____exports.ElementId[____exports.ElementId.Dimonde] = "Dimonde"
____exports.ElementId.Topaz = 2
____exports.ElementId[____exports.ElementId.Topaz] = "Topaz"
____exports.ElementId.Ruby = 3
____exports.ElementId[____exports.ElementId.Ruby] = "Ruby"
____exports.ElementId.Emerald = 4
____exports.ElementId[____exports.ElementId.Emerald] = "Emerald"
____exports.ComboType = ComboType or ({})
____exports.ComboType.Vertical = 0
____exports.ComboType[____exports.ComboType.Vertical] = "Vertical"
____exports.ComboType.Horizontal = 1
____exports.ComboType[____exports.ComboType.Horizontal] = "Horizontal"
____exports.ComboType.All = 2
____exports.ComboType[____exports.ComboType.All] = "All"
____exports._GAME_CONFIG = {
    game_animation_speed_cof = 1,
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
    cell_database = __TS__New(Map, {{____exports.CellId.Base, {type = CellType.Base, is_active = true, view = "cell_base"}}, {____exports.CellId.Ice, {type = CellType.ActionLocked, is_active = true, view = "cell_ice"}}}),
    element_database = __TS__New(Map, {
        {____exports.ElementId.Dimonde, {type = {index = ____exports.ElementId.Dimonde, is_movable = true, is_clickable = false}, view = "element_diamond"}},
        {____exports.ElementId.Gold, {type = {index = ____exports.ElementId.Gold, is_movable = true, is_clickable = false}, view = "element_gold"}},
        {____exports.ElementId.Topaz, {type = {index = ____exports.ElementId.Topaz, is_movable = true, is_clickable = false}, view = "element_topaz"}},
        {____exports.ElementId.Ruby, {type = {index = ____exports.ElementId.Ruby, is_movable = true, is_clickable = false}, view = "element_ruby"}},
        {____exports.ElementId.Emerald, {type = {index = ____exports.ElementId.Emerald, is_movable = true, is_clickable = false}, view = "element_emerald"}}
    }),
    combo_graphics = __TS__New(Map, {{____exports.ComboType.All, "combo_all"}, {____exports.ComboType.Horizontal, "combo_horizontal"}, {____exports.ComboType.Vertical, "combo_vertical"}}),
    levels = {{field = {
        width = 8,
        height = 8,
        cell_size = 64,
        offset_border = 10,
        move_direction = MoveDirection.Up,
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
                ____exports.ElementId.Dimonde,
                ____exports.ElementId.Topaz,
                ____exports.ElementId.Topaz,
                ____exports.ElementId.Gold,
                ____exports.ElementId.Topaz
            },
            {
                ____exports.ElementId.Ruby,
                NullElement,
                NullElement,
                ____exports.ElementId.Gold,
                ____exports.ElementId.Ruby,
                NullElement,
                NullElement,
                ____exports.ElementId.Dimonde
            },
            {
                ____exports.ElementId.Dimonde,
                NullElement,
                NullElement,
                ____exports.ElementId.Topaz,
                ____exports.ElementId.Ruby,
                NullElement,
                NullElement,
                ____exports.ElementId.Topaz
            },
            {
                ____exports.ElementId.Gold,
                ____exports.ElementId.Gold,
                ____exports.ElementId.Dimonde,
                ____exports.ElementId.Emerald,
                ____exports.ElementId.Emerald,
                ____exports.ElementId.Ruby,
                ____exports.ElementId.Gold,
                ____exports.ElementId.Gold
            },
            {
                ____exports.ElementId.Dimonde,
                ____exports.ElementId.Topaz,
                ____exports.ElementId.Gold,
                ____exports.ElementId.Emerald,
                ____exports.ElementId.Topaz,
                ____exports.ElementId.Gold,
                ____exports.ElementId.Dimonde,
                ____exports.ElementId.Ruby
            },
            {
                NullElement,
                ____exports.ElementId.Emerald,
                ____exports.ElementId.Emerald,
                ____exports.ElementId.Gold,
                ____exports.ElementId.Emerald,
                ____exports.ElementId.Topaz,
                ____exports.ElementId.Gold,
                NullElement
            }
        }
    }, busters = {hammer_active = false}}}
}
____exports._STORAGE_CONFIG = {current_level = 0, hammer_counts = 3}
return ____exports
