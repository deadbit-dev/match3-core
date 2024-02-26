local ____exports = {}
local ____match3_core = require("game.match3_core")
local CellType = ____match3_core.CellType
local NotActiveCell = ____match3_core.NotActiveCell
local NullElement = ____match3_core.NullElement
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
____exports.CellId.Grass = 1
____exports.CellId[____exports.CellId.Grass] = "Grass"
____exports.CellId.Box = 2
____exports.CellId[____exports.CellId.Box] = "Box"
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
____exports.ElementId.VerticalRocket = 5
____exports.ElementId[____exports.ElementId.VerticalRocket] = "VerticalRocket"
____exports.ElementId.HorizontalRocket = 6
____exports.ElementId[____exports.ElementId.HorizontalRocket] = "HorizontalRocket"
____exports.ElementId.AxisRocket = 7
____exports.ElementId[____exports.ElementId.AxisRocket] = "AxisRocket"
____exports.ElementId.Helicopter = 8
____exports.ElementId[____exports.ElementId.Helicopter] = "Helicopter"
____exports.ElementId.Dynamite = 9
____exports.ElementId[____exports.ElementId.Dynamite] = "Dynamite"
____exports.ElementId.Diskosphere = 10
____exports.ElementId[____exports.ElementId.Diskosphere] = "Diskosphere"
____exports._GAME_CONFIG = {
    min_swipe_distance = 32,
    swap_element_easing = go.EASING_LINEAR,
    swap_element_time = 0.25,
    squash_element_easing = go.EASING_INCUBIC,
    squash_element_time = 0.3,
    dynamite_activation_duration = 1,
    helicopter_fly_duration = 0.7,
    damaged_element_easing = go.EASING_INOUTBACK,
    damaged_element_time = 0.5,
    damaged_element_delay = 0.1,
    damaged_element_scale = 0.5,
    move_elements_easing = go.EASING_INOUTBACK,
    move_elements_time = 0.3,
    spawn_element_easing = go.EASING_INCUBIC,
    spawn_element_time = 0.5,
    buster_delay = 0.5,
    default_cell_z_index = -1,
    default_element_z_index = 0,
    cell_database = {
        [____exports.CellId.Base] = {type = CellType.Base, view = "cell_base"},
        [____exports.CellId.Grass] = {type = CellType.ActionLocked, cnt_acts = 0, view = "cell_grass"},
        [____exports.CellId.Box] = {
            type = bit.bor(CellType.ActionLockedNear, CellType.Wall),
            cnt_near_acts = 0,
            is_render_under_cell = true,
            view = "cell_box",
            z_index = 1
        }
    },
    element_database = {
        [____exports.ElementId.Dimonde] = {type = {is_movable = true, is_clickable = false}, percentage = 10, view = "element_diamond"},
        [____exports.ElementId.Gold] = {type = {is_movable = true, is_clickable = false}, percentage = 10, view = "element_gold"},
        [____exports.ElementId.Topaz] = {type = {is_movable = true, is_clickable = false}, percentage = 10, view = "element_topaz"},
        [____exports.ElementId.Ruby] = {type = {is_movable = true, is_clickable = false}, percentage = 10, view = "element_ruby"},
        [____exports.ElementId.Emerald] = {type = {is_movable = true, is_clickable = false}, percentage = 10, view = "element_emerald"},
        [____exports.ElementId.VerticalRocket] = {type = {is_movable = true, is_clickable = true}, percentage = 0, view = "vertical_rocket_buster"},
        [____exports.ElementId.HorizontalRocket] = {type = {is_movable = true, is_clickable = true}, percentage = 0, view = "horizontal_rocket_buster"},
        [____exports.ElementId.AxisRocket] = {type = {is_movable = true, is_clickable = true}, percentage = 0, view = "axis_rocket_buster"},
        [____exports.ElementId.Helicopter] = {type = {is_movable = true, is_clickable = true}, percentage = 0, view = "helicopter_buster"},
        [____exports.ElementId.Dynamite] = {type = {is_movable = true, is_clickable = true}, percentage = 0, view = "dynamite_buster"},
        [____exports.ElementId.Diskosphere] = {type = {is_movable = true, is_clickable = true}, percentage = 0, view = "diskosphere_buster"}
    },
    base_elements = {
        ____exports.ElementId.Dimonde,
        ____exports.ElementId.Gold,
        ____exports.ElementId.Topaz,
        ____exports.ElementId.Ruby,
        ____exports.ElementId.Emerald
    },
    levels = {
        {field = {
            width = 8,
            height = 8,
            cell_size = 64,
            offset_border = 10,
            complex_move = false,
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
                    ____exports.CellId.Grass,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Grass,
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
                    ____exports.CellId.Box,
                    ____exports.CellId.Box,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    {____exports.CellId.Grass, ____exports.CellId.Box},
                    {____exports.CellId.Grass, ____exports.CellId.Box},
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Base,
                    ____exports.CellId.Box,
                    ____exports.CellId.Box,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    {____exports.CellId.Grass, ____exports.CellId.Box},
                    {____exports.CellId.Grass, ____exports.CellId.Box},
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Grass,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Grass,
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
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    NotActiveCell
                }
            },
            elements = {
                {
                    NullElement,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Dynamite,
                    NullElement
                },
                {
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Ruby,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Ruby,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Gold
                },
                {
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Topaz
                },
                {
                    ____exports.ElementId.Ruby,
                    NullElement,
                    NullElement,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Topaz,
                    NullElement,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Dimonde
                },
                {
                    ____exports.ElementId.Dimonde,
                    NullElement,
                    NullElement,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Emerald,
                    NullElement,
                    ____exports.ElementId.Topaz
                },
                {
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Dynamite,
                    ____exports.ElementId.Dynamite,
                    ____exports.ElementId.Gold,
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
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Topaz,
                    NullElement
                }
            }
        }, busters = {hammer_active = false}},
        {field = {
            width = 8,
            height = 8,
            cell_size = 64,
            offset_border = 10,
            complex_move = false,
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
                    ____exports.CellId.Grass,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Grass,
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
                    ____exports.CellId.Box,
                    ____exports.CellId.Box,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Box,
                    ____exports.CellId.Box,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Base,
                    ____exports.CellId.Box,
                    ____exports.CellId.Box,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Box,
                    {____exports.CellId.Grass, ____exports.CellId.Box},
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Grass,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Grass,
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
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    NotActiveCell
                }
            },
            elements = {
                {
                    NullElement,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.AxisRocket,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.VerticalRocket,
                    NullElement
                },
                {
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Ruby,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Ruby,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Gold
                },
                {
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Topaz
                },
                {
                    ____exports.ElementId.Ruby,
                    NullElement,
                    NullElement,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Topaz,
                    NullElement,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Dimonde
                },
                {
                    ____exports.ElementId.Dimonde,
                    NullElement,
                    NullElement,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Emerald,
                    NullElement,
                    ____exports.ElementId.Topaz
                },
                {
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.VerticalRocket,
                    ____exports.ElementId.HorizontalRocket,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Ruby,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Gold
                },
                {
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.VerticalRocket,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Ruby
                },
                {
                    NullElement,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Topaz,
                    NullElement
                }
            }
        }, busters = {hammer_active = false}},
        {field = {
            width = 8,
            height = 8,
            cell_size = 64,
            offset_border = 10,
            complex_move = false,
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
                    ____exports.CellId.Grass,
                    NotActiveCell,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    NotActiveCell,
                    ____exports.CellId.Grass
                },
                {
                    ____exports.CellId.Base,
                    ____exports.CellId.Grass,
                    NotActiveCell,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    NotActiveCell,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Grass,
                    NotActiveCell,
                    NotActiveCell,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Grass,
                    NotActiveCell,
                    NotActiveCell,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Base,
                    ____exports.CellId.Grass,
                    NotActiveCell,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    NotActiveCell,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Grass,
                    NotActiveCell,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    NotActiveCell,
                    ____exports.CellId.Grass
                },
                {
                    NotActiveCell,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    NotActiveCell
                }
            },
            elements = {
                {
                    NullElement,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Dimonde,
                    NullElement
                },
                {
                    ____exports.ElementId.Dimonde,
                    NullElement,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Gold,
                    NullElement,
                    ____exports.ElementId.Topaz
                },
                {
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Gold,
                    NullElement,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Emerald,
                    NullElement,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Topaz
                },
                {
                    ____exports.ElementId.Ruby,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Emerald,
                    NullElement,
                    NullElement,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Gold
                },
                {
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Gold,
                    NullElement,
                    NullElement,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Topaz
                },
                {
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Gold,
                    NullElement,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Gold,
                    NullElement,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Gold
                },
                {
                    ____exports.ElementId.Helicopter,
                    NullElement,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Gold,
                    NullElement,
                    ____exports.ElementId.Ruby
                },
                {
                    NullElement,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Helicopter,
                    ____exports.ElementId.Helicopter,
                    ____exports.ElementId.Gold,
                    NullElement
                }
            }
        }, busters = {hammer_active = false}},
        {field = {
            width = 8,
            height = 8,
            cell_size = 64,
            offset_border = 10,
            complex_move = false,
            cells = {
                {
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Grass,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Grass
                },
                {
                    ____exports.CellId.Base,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Base,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Grass,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Grass
                },
                {
                    ____exports.CellId.Base,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Base
                }
            },
            elements = {
                {
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.VerticalRocket,
                    ____exports.ElementId.Ruby
                },
                {
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Diskosphere,
                    ____exports.ElementId.Dynamite
                },
                {
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Ruby,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Topaz
                },
                {
                    ____exports.ElementId.Ruby,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Dimonde
                },
                {
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Ruby,
                    ____exports.ElementId.Ruby,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Topaz
                },
                {
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Ruby,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Ruby,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Gold
                },
                {
                    ____exports.ElementId.Ruby,
                    ____exports.ElementId.Ruby,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Ruby,
                    ____exports.ElementId.Ruby
                },
                {
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Ruby
                }
            }
        }, busters = {hammer_active = false}},
        {field = {
            width = 8,
            height = 8,
            cell_size = 64,
            offset_border = 10,
            complex_move = true,
            cells = {
                {
                    ____exports.CellId.Base,
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
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    {____exports.CellId.Grass, ____exports.CellId.Box},
                    {____exports.CellId.Grass, ____exports.CellId.Box},
                    {____exports.CellId.Grass, ____exports.CellId.Box},
                    {____exports.CellId.Grass, ____exports.CellId.Box},
                    {____exports.CellId.Grass, ____exports.CellId.Box},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    {____exports.CellId.Grass, ____exports.CellId.Box},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    {____exports.CellId.Grass, ____exports.CellId.Box},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    {____exports.CellId.Grass, ____exports.CellId.Box},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    ____exports.CellId.Grass,
                    {____exports.CellId.Grass, ____exports.CellId.Box},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                }
            },
            elements = {
                {
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.VerticalRocket,
                    ____exports.ElementId.Gold
                },
                {
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Dynamite,
                    ____exports.ElementId.Dimonde
                },
                {
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Helicopter,
                    ____exports.ElementId.Ruby,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Topaz
                },
                {
                    NullElement,
                    NullElement,
                    NullElement,
                    NullElement,
                    NullElement,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Dimonde
                },
                {
                    NullElement,
                    NullElement,
                    NullElement,
                    NullElement,
                    NullElement,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Topaz
                },
                {
                    NullElement,
                    NullElement,
                    NullElement,
                    NullElement,
                    NullElement,
                    ____exports.ElementId.Ruby,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Gold
                },
                {
                    NullElement,
                    NullElement,
                    NullElement,
                    NullElement,
                    NullElement,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Ruby,
                    ____exports.ElementId.Ruby
                },
                {
                    NullElement,
                    NullElement,
                    NullElement,
                    NullElement,
                    NullElement,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Ruby
                }
            }
        }, busters = {hammer_active = false}}
    }
}
____exports._STORAGE_CONFIG = {current_level = 2, hammer_counts = 3}
return ____exports
