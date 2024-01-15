local ____lualib = require("lualib_bundle")
local Map = ____lualib.Map
local __TS__New = ____lualib.__TS__New
local ____exports = {}
local ____match3 = require("game.match3")
local CellType = ____match3.CellType
local NullElement = ____match3.NullElement
local NotActiveCell = ____match3.NotActiveCell
local ____game_logic = require("game.game_logic")
local CellId = ____game_logic.CellId
local ElementId = ____game_logic.ElementId
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
____exports._GAME_CONFIG = {
    min_swipe_distance = 32,
    swap_element_easing = go.EASING_LINEAR,
    swap_element_time = 0.25,
    cell_database = __TS__New(Map, {{CellId.Base, {type = CellType.Base, is_active = true, view = "cell_base"}}, {CellId.Ice, {type = CellType.ActionLocked, is_active = true, view = "cell_ice"}}}),
    element_database = __TS__New(Map, {{ElementId.Dimonde, {type = {index = ElementId.Dimonde, is_movable = true, is_clickable = false}, view = "element_dimonde"}}, {ElementId.Gold, {type = {index = ElementId.Gold, is_movable = true, is_clickable = false}, view = "element_gold"}}, {ElementId.Topaz, {type = {index = ElementId.Topaz, is_movable = true, is_clickable = false}, view = "element_topaz"}}}),
    levels = {{field = {
        width = 8,
        height = 8,
        cell_size = 64,
        offset_border = 10,
        cells = {
            {
                CellId.Ice,
                CellId.Base,
                CellId.Base,
                CellId.Base,
                CellId.Base,
                CellId.Base,
                CellId.Base,
                CellId.Base
            },
            {
                CellId.Ice,
                CellId.Base,
                CellId.Base,
                CellId.Ice,
                CellId.Ice,
                CellId.Ice,
                CellId.Ice,
                CellId.Base
            },
            {
                CellId.Ice,
                CellId.Base,
                CellId.Base,
                CellId.Base,
                CellId.Base,
                CellId.Base,
                CellId.Base,
                CellId.Base
            },
            {
                NotActiveCell,
                NotActiveCell,
                CellId.Base,
                CellId.Base,
                CellId.Base,
                CellId.Base,
                NotActiveCell,
                CellId.Base
            },
            {
                NotActiveCell,
                NotActiveCell,
                CellId.Base,
                CellId.Base,
                CellId.Base,
                CellId.Base,
                NotActiveCell,
                CellId.Base
            },
            {
                CellId.Ice,
                CellId.Base,
                CellId.Base,
                CellId.Base,
                CellId.Base,
                CellId.Base,
                CellId.Base,
                CellId.Base
            },
            {
                CellId.Ice,
                CellId.Base,
                CellId.Base,
                CellId.Base,
                CellId.Base,
                CellId.Base,
                CellId.Base,
                CellId.Base
            },
            {
                CellId.Ice,
                CellId.Ice,
                CellId.Ice,
                CellId.Ice,
                CellId.Ice,
                CellId.Ice,
                CellId.Ice,
                CellId.Base
            }
        },
        elements = {
            {
                ElementId.Gold,
                ElementId.Dimonde,
                ElementId.Gold,
                ElementId.Gold,
                ElementId.Dimonde,
                ElementId.Gold,
                ElementId.Gold,
                ElementId.Topaz
            },
            {
                ElementId.Dimonde,
                ElementId.Topaz,
                ElementId.Topaz,
                ElementId.Gold,
                ElementId.Dimonde,
                ElementId.Gold,
                ElementId.Dimonde,
                ElementId.Gold
            },
            {
                ElementId.Dimonde,
                ElementId.Gold,
                ElementId.Topaz,
                ElementId.Dimonde,
                ElementId.Topaz,
                ElementId.Topaz,
                ElementId.Gold,
                ElementId.Topaz
            },
            {
                NullElement,
                NullElement,
                NullElement,
                ElementId.Gold,
                ElementId.Gold,
                NullElement,
                NullElement,
                ElementId.Dimonde
            },
            {
                NullElement,
                NullElement,
                NullElement,
                ElementId.Topaz,
                ElementId.Gold,
                NullElement,
                NullElement,
                ElementId.Gold
            },
            {
                ElementId.Gold,
                ElementId.Gold,
                ElementId.Dimonde,
                ElementId.Dimonde,
                ElementId.Topaz,
                ElementId.Dimonde,
                ElementId.Gold,
                ElementId.Gold
            },
            {
                ElementId.Dimonde,
                ElementId.Topaz,
                ElementId.Gold,
                ElementId.Topaz,
                ElementId.Gold,
                ElementId.Gold,
                ElementId.Dimonde,
                ElementId.Gold
            },
            {
                ElementId.Gold,
                ElementId.Gold,
                ElementId.Dimonde,
                ElementId.Gold,
                ElementId.Topaz,
                ElementId.Topaz,
                ElementId.Gold,
                ElementId.Topaz
            }
        }
    }}}
}
____exports._STORAGE_CONFIG = {current_level = 0}
return ____exports
