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
____exports.SubstrateId = SubstrateId or ({})
____exports.SubstrateId.OutsideArc = 0
____exports.SubstrateId[____exports.SubstrateId.OutsideArc] = "OutsideArc"
____exports.SubstrateId.OutsideInsideAngle = 1
____exports.SubstrateId[____exports.SubstrateId.OutsideInsideAngle] = "OutsideInsideAngle"
____exports.SubstrateId.OutsideAngle = 2
____exports.SubstrateId[____exports.SubstrateId.OutsideAngle] = "OutsideAngle"
____exports.SubstrateId.LeftRightStrip = 3
____exports.SubstrateId[____exports.SubstrateId.LeftRightStrip] = "LeftRightStrip"
____exports.SubstrateId.LeftStripTopBottomInsideAngle = 4
____exports.SubstrateId[____exports.SubstrateId.LeftStripTopBottomInsideAngle] = "LeftStripTopBottomInsideAngle"
____exports.SubstrateId.LeftStripTopInsideAngle = 5
____exports.SubstrateId[____exports.SubstrateId.LeftStripTopInsideAngle] = "LeftStripTopInsideAngle"
____exports.SubstrateId.LeftStripBottomInsideAngle = 6
____exports.SubstrateId[____exports.SubstrateId.LeftStripBottomInsideAngle] = "LeftStripBottomInsideAngle"
____exports.SubstrateId.LeftStrip = 7
____exports.SubstrateId[____exports.SubstrateId.LeftStrip] = "LeftStrip"
____exports.SubstrateId.TopBottomInsideAngle = 8
____exports.SubstrateId[____exports.SubstrateId.TopBottomInsideAngle] = "TopBottomInsideAngle"
____exports.SubstrateId.InsideAngle = 9
____exports.SubstrateId[____exports.SubstrateId.InsideAngle] = "InsideAngle"
____exports.SubstrateId.Full = 10
____exports.SubstrateId[____exports.SubstrateId.Full] = "Full"
____exports.CellId = CellId or ({})
____exports.CellId.Base = 0
____exports.CellId[____exports.CellId.Base] = "Base"
____exports.CellId.Grass = 1
____exports.CellId[____exports.CellId.Grass] = "Grass"
____exports.CellId.Box = 2
____exports.CellId[____exports.CellId.Box] = "Box"
____exports.CellId.Stone0 = 3
____exports.CellId[____exports.CellId.Stone0] = "Stone0"
____exports.CellId.Stone1 = 4
____exports.CellId[____exports.CellId.Stone1] = "Stone1"
____exports.CellId.Stone2 = 5
____exports.CellId[____exports.CellId.Stone2] = "Stone2"
____exports.CellId.Web = 6
____exports.CellId[____exports.CellId.Web] = "Web"
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
____exports.ElementId.Custom1 = 11
____exports.ElementId[____exports.ElementId.Custom1] = "Custom1"
____exports.ElementId.Custom2 = 12
____exports.ElementId[____exports.ElementId.Custom2] = "Custom2"
____exports.ElementId.Custom3 = 13
____exports.ElementId[____exports.ElementId.Custom3] = "Custom3"
____exports.ElementId.Custom4 = 14
____exports.ElementId[____exports.ElementId.Custom4] = "Custom4"
____exports.ElementId.Custom5 = 15
____exports.ElementId[____exports.ElementId.Custom5] = "Custom5"
____exports.ElementId.Custom6 = 16
____exports.ElementId[____exports.ElementId.Custom6] = "Custom6"
____exports.ElementId.Custom7 = 17
____exports.ElementId[____exports.ElementId.Custom7] = "Custom7"
____exports.ElementId.Custom8 = 18
____exports.ElementId[____exports.ElementId.Custom8] = "Custom8"
____exports.ElementId.Custom9 = 19
____exports.ElementId[____exports.ElementId.Custom9] = "Custom9"
____exports.ElementId.Custom10 = 20
____exports.ElementId[____exports.ElementId.Custom10] = "Custom10"
local ____go_EASING_LINEAR_1 = go.EASING_LINEAR
local ____go_EASING_INCUBIC_2 = go.EASING_INCUBIC
local ____go_EASING_INOUTBACK_3 = go.EASING_INOUTBACK
local ____temp_4 = sys.get_sys_info().system_name == "HTML5" and html5.run("new URL(location).searchParams.get('color')||'#c29754'") or "#c29754"
local ____temp_0
if sys.get_sys_info().system_name == "HTML5" then
    ____temp_0 = html5.run("new URL(location).searchParams.get('move')==null") == "true"
else
    ____temp_0 = true
end
____exports._GAME_CONFIG = {
    min_swipe_distance = 32,
    swap_element_easing = ____go_EASING_LINEAR_1,
    swap_element_time = 0.25,
    squash_element_easing = ____go_EASING_INCUBIC_2,
    squash_element_time = 0.3,
    helicopter_fly_duration = 0.75,
    damaged_element_easing = ____go_EASING_INOUTBACK_3,
    damaged_element_time = 0.55,
    damaged_element_delay = 0.1,
    damaged_element_scale = 0.3,
    base_cell_color = ____temp_4,
    movement_to_point = ____temp_0,
    duration_of_movement_bettween_cells = sys.get_sys_info().system_name == "HTML5" and tonumber(html5.run("new URL(location).searchParams.get('time')||0.07")) or 0.07,
    complex_move = true,
    spawn_element_easing = go.EASING_INCUBIC,
    spawn_element_time = 0.5,
    buster_delay = 0.5,
    default_substrate_z_index = -2,
    default_element_z_index = 0,
    substrate_database = {
        [____exports.SubstrateId.OutsideArc] = "outside_arc",
        [____exports.SubstrateId.OutsideInsideAngle] = "outside_inside_angle",
        [____exports.SubstrateId.OutsideAngle] = "outside_angle",
        [____exports.SubstrateId.LeftRightStrip] = "left_right_strip",
        [____exports.SubstrateId.LeftStripTopBottomInsideAngle] = "left_strip_top_inside_angle",
        [____exports.SubstrateId.LeftStripTopInsideAngle] = "left_strip_top_inside_angle",
        [____exports.SubstrateId.LeftStripBottomInsideAngle] = "left_strip_bottom_inside_angle",
        [____exports.SubstrateId.LeftStrip] = "left_strip",
        [____exports.SubstrateId.TopBottomInsideAngle] = "top_bottom_inside_angle",
        [____exports.SubstrateId.InsideAngle] = "inside_angle",
        [____exports.SubstrateId.Full] = "full"
    },
    cell_database = {
        [____exports.CellId.Base] = {type = CellType.Base, view = "cell_white", z_index = -1},
        [____exports.CellId.Grass] = {
            type = CellType.ActionLocked,
            cnt_acts = 0,
            is_render_under_cell = true,
            view = "cell_grass",
            z_index = -1
        },
        [____exports.CellId.Box] = {
            type = bit.bor(
                bit.bor(CellType.ActionLockedNear, CellType.Disabled),
                CellType.NotMoved
            ),
            cnt_near_acts = 0,
            is_render_under_cell = true,
            view = "cell_box",
            z_index = 2
        },
        [____exports.CellId.Stone0] = {
            type = bit.bor(
                bit.bor(CellType.ActionLockedNear, CellType.Disabled),
                CellType.NotMoved
            ),
            cnt_near_acts = 0,
            is_render_under_cell = true,
            view = "cell_stone_0",
            z_index = 2
        },
        [____exports.CellId.Stone1] = {
            type = bit.bor(
                bit.bor(CellType.ActionLockedNear, CellType.Disabled),
                CellType.NotMoved
            ),
            cnt_near_acts = 0,
            is_render_under_cell = true,
            view = "cell_stone_1",
            z_index = 2
        },
        [____exports.CellId.Stone2] = {
            type = bit.bor(
                bit.bor(CellType.ActionLockedNear, CellType.Disabled),
                CellType.NotMoved
            ),
            cnt_near_acts = 0,
            is_render_under_cell = true,
            view = "cell_stone_2",
            z_index = 2
        },
        [____exports.CellId.Web] = {
            type = bit.bor(CellType.ActionLockedNear, CellType.NotMoved),
            cnt_near_acts = 0,
            is_render_under_cell = true,
            view = "cell_web",
            z_index = 2
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
        [____exports.ElementId.Diskosphere] = {type = {is_movable = true, is_clickable = true}, percentage = 0, view = "diskosphere_buster"},
        [____exports.ElementId.Custom1] = {type = {is_movable = true, is_clickable = false}, percentage = 0, view = "custom_1"},
        [____exports.ElementId.Custom2] = {type = {is_movable = true, is_clickable = false}, percentage = 0, view = "custom_2"},
        [____exports.ElementId.Custom3] = {type = {is_movable = true, is_clickable = false}, percentage = 0, view = "custom_3"},
        [____exports.ElementId.Custom4] = {type = {is_movable = true, is_clickable = false}, percentage = 0, view = "custom_4"},
        [____exports.ElementId.Custom5] = {type = {is_movable = true, is_clickable = false}, percentage = 0, view = "custom_5"},
        [____exports.ElementId.Custom6] = {type = {is_movable = true, is_clickable = false}, percentage = 0, view = "custom_6"},
        [____exports.ElementId.Custom7] = {type = {is_movable = true, is_clickable = false}, percentage = 0, view = "custom_7"},
        [____exports.ElementId.Custom8] = {type = {is_movable = true, is_clickable = false}, percentage = 0, view = "custom_8"},
        [____exports.ElementId.Custom9] = {type = {is_movable = true, is_clickable = false}, percentage = 0, view = "custom_9"},
        [____exports.ElementId.Custom10] = {type = {is_movable = true, is_clickable = false}, percentage = 0, view = "custom_10"}
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
            max_width = 8,
            max_height = 8,
            cell_size = 128,
            offset_border = 20,
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
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    ____exports.CellId.Base
                },
                {
                    {____exports.CellId.Base, ____exports.CellId.Grass},
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
                    {____exports.CellId.Base, ____exports.CellId.Box},
                    {____exports.CellId.Base, ____exports.CellId.Box},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    {____exports.CellId.Grass, ____exports.CellId.Box},
                    {____exports.CellId.Grass, ____exports.CellId.Box},
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Base,
                    {____exports.CellId.Base, ____exports.CellId.Box},
                    {____exports.CellId.Base, ____exports.CellId.Box},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    {____exports.CellId.Grass, ____exports.CellId.Box},
                    {____exports.CellId.Grass, ____exports.CellId.Box},
                    ____exports.CellId.Base
                },
                {
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    {____exports.CellId.Base, ____exports.CellId.Grass},
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
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
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
        }, steps = 15, targets = {{type = ____exports.ElementId.Topaz, count = 7, uids = {}}, {type = ____exports.ElementId.Dimonde, count = 5, uids = {}}}, busters = {hammer_active = false, spinning_active = false, horizontal_rocket_active = false, vertical_rocket_active = false}},
        {field = {
            width = 8,
            height = 8,
            max_width = 8,
            max_height = 8,
            cell_size = 128,
            offset_border = 20,
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
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    ____exports.CellId.Base
                },
                {
                    {____exports.CellId.Base, ____exports.CellId.Grass},
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
                    {____exports.CellId.Stone2, ____exports.CellId.Stone1, ____exports.CellId.Stone0},
                    {____exports.CellId.Grass, ____exports.CellId.Box},
                    ____exports.CellId.Base
                },
                {
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    {____exports.CellId.Base, ____exports.CellId.Grass},
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
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
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
        }, steps = 10, targets = {{type = ____exports.ElementId.Emerald, count = 5, uids = {}}}, busters = {hammer_active = false, spinning_active = false, horizontal_rocket_active = false, vertical_rocket_active = false}},
        {field = {
            width = 8,
            height = 8,
            max_width = 8,
            max_height = 8,
            cell_size = 128,
            offset_border = 20,
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
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    NotActiveCell,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    NotActiveCell,
                    {____exports.CellId.Base, ____exports.CellId.Grass}
                },
                {
                    ____exports.CellId.Base,
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    NotActiveCell,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    NotActiveCell,
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    NotActiveCell,
                    NotActiveCell,
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    NotActiveCell,
                    NotActiveCell,
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Base,
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    NotActiveCell,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    NotActiveCell,
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    ____exports.CellId.Base
                },
                {
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    NotActiveCell,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    NotActiveCell,
                    {____exports.CellId.Base, ____exports.CellId.Grass}
                },
                {
                    NotActiveCell,
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
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
        }, steps = 20, targets = {{type = ____exports.ElementId.Gold, count = 10, uids = {}}, {type = ____exports.ElementId.Ruby, count = 5, uids = {}}}, busters = {hammer_active = false, spinning_active = false, horizontal_rocket_active = false, vertical_rocket_active = false}},
        {field = {
            width = 8,
            height = 8,
            max_width = 8,
            max_height = 8,
            cell_size = 128,
            offset_border = 20,
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
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    {____exports.CellId.Base, ____exports.CellId.Grass}
                },
                {
                    ____exports.CellId.Base,
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    {____exports.CellId.Base},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Base,
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    ____exports.CellId.Base
                },
                {
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    {____exports.CellId.Base, ____exports.CellId.Grass}
                },
                {
                    ____exports.CellId.Base,
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
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
                    ____exports.ElementId.Diskosphere,
                    ____exports.ElementId.Diskosphere,
                    ____exports.ElementId.Dynamite
                },
                {
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Helicopter,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Helicopter,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Topaz
                },
                {
                    ____exports.ElementId.Ruby,
                    ____exports.ElementId.HorizontalRocket,
                    ____exports.ElementId.Helicopter,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Dimonde
                },
                {
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Helicopter,
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
        }, steps = 15, targets = {{type = ____exports.ElementId.Gold, count = 7, uids = {}}, {type = ____exports.ElementId.Topaz, count = 7, uids = {}}}, busters = {spinning_active = false, hammer_active = false, horizontal_rocket_active = false, vertical_rocket_active = false}},
        {field = {
            width = 8,
            height = 8,
            max_width = 8,
            max_height = 8,
            cell_size = 128,
            offset_border = 20,
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
                    {
                        ____exports.CellId.Base,
                        ____exports.CellId.Grass,
                        ____exports.CellId.Stone2,
                        ____exports.CellId.Stone1,
                        ____exports.CellId.Stone0
                    },
                    {____exports.CellId.Base, ____exports.CellId.Grass, ____exports.CellId.Box},
                    {____exports.CellId.Base, ____exports.CellId.Grass, ____exports.CellId.Box},
                    {____exports.CellId.Base, ____exports.CellId.Grass, ____exports.CellId.Box},
                    {____exports.CellId.Base, ____exports.CellId.Grass, ____exports.CellId.Box},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass, ____exports.CellId.Box},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass, ____exports.CellId.Box},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass, ____exports.CellId.Box},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass},
                    {____exports.CellId.Base, ____exports.CellId.Grass, ____exports.CellId.Box},
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
                    ____exports.ElementId.Emerald,
                    NullElement,
                    ____exports.ElementId.Ruby,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Gold
                },
                {
                    NullElement,
                    NullElement,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Gold,
                    NullElement,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Ruby,
                    ____exports.ElementId.Ruby
                },
                {
                    NullElement,
                    NullElement,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Gold,
                    NullElement,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Ruby
                }
            }
        }, steps = 5, targets = {{type = ____exports.ElementId.Dimonde, count = 7, uids = {}}}, busters = {hammer_active = false, spinning_active = false, horizontal_rocket_active = false, vertical_rocket_active = false}},
        {field = {
            width = 6,
            height = 6,
            max_width = 8,
            max_height = 8,
            cell_size = 128,
            offset_border = 20,
            cells = {
                {
                    NotActiveCell,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    NotActiveCell
                },
                {
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
                    {____exports.CellId.Base, ____exports.CellId.Web},
                    {____exports.CellId.Base, ____exports.CellId.Web},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    {____exports.CellId.Base, ____exports.CellId.Web},
                    {____exports.CellId.Base, ____exports.CellId.Web},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    NotActiveCell,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
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
                    NullElement
                },
                {
                    ____exports.ElementId.Ruby,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Dimonde
                },
                {
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Gold
                },
                {
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Dimonde
                },
                {
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Helicopter,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Helicopter,
                    ____exports.ElementId.Dimonde
                },
                {
                    NullElement,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Emerald,
                    NullElement
                }
            }
        }, steps = 10, targets = {{type = ____exports.ElementId.Emerald, count = 5, uids = {}}, {type = ____exports.ElementId.Gold, count = 5, uids = {}}}, busters = {hammer_active = false, spinning_active = false, horizontal_rocket_active = false, vertical_rocket_active = false}},
        {field = {
            width = 6,
            height = 6,
            max_width = 8,
            max_height = 8,
            cell_size = 128,
            offset_border = 20,
            cells = {
                {
                    NotActiveCell,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    NotActiveCell
                },
                {
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    {____exports.CellId.Base, ____exports.CellId.Box},
                    {____exports.CellId.Base, ____exports.CellId.Box},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Base,
                    {____exports.CellId.Base, ____exports.CellId.Box},
                    {____exports.CellId.Base, ____exports.CellId.Box},
                    {____exports.CellId.Base, ____exports.CellId.Box},
                    {____exports.CellId.Base, ____exports.CellId.Box},
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Base,
                    {____exports.CellId.Base, ____exports.CellId.Box},
                    {____exports.CellId.Base, ____exports.CellId.Box},
                    {____exports.CellId.Base, ____exports.CellId.Box},
                    {____exports.CellId.Base, ____exports.CellId.Box},
                    ____exports.CellId.Base
                },
                {
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    {____exports.CellId.Base, ____exports.CellId.Box},
                    {____exports.CellId.Base, ____exports.CellId.Box},
                    ____exports.CellId.Base,
                    ____exports.CellId.Base
                },
                {
                    NotActiveCell,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
                    ____exports.CellId.Base,
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
                    NullElement
                },
                {
                    ____exports.ElementId.Ruby,
                    ____exports.ElementId.Topaz,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Topaz
                },
                {
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Gold
                },
                {
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Dimonde
                },
                {
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Dimonde,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Dimonde
                },
                {
                    NullElement,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Gold,
                    ____exports.ElementId.Emerald,
                    ____exports.ElementId.Emerald,
                    NullElement
                }
            }
        }, steps = 5, targets = {{type = ____exports.ElementId.Ruby, count = 5, uids = {}}}, busters = {hammer_active = false, spinning_active = false, horizontal_rocket_active = false, vertical_rocket_active = false}}
    }
}
____exports._STORAGE_CONFIG = {
    current_level = 4,
    hammer_counts = 3,
    spinning_counts = 3,
    horizontal_rocket_counts = 3,
    vertical_rocket_counts = 3
}
return ____exports
