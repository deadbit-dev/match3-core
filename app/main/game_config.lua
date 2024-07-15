local ____lualib = require("lualib_bundle")
local __TS__StringIncludes = ____lualib.__TS__StringIncludes
local ____exports = {}
local ____match3_game = require("game.match3_game")
local CellId = ____match3_game.CellId
local ElementId = ____match3_game.ElementId
local SubstrateId = ____match3_game.SubstrateId
____exports.IS_DEBUG_MODE = true
____exports.IS_HUAWEI = sys.get_sys_info().system_name == "Android" and __TS__StringIncludes(
    sys.get_config("android.package"),
    "huawei"
)
____exports.ADS_CONFIG = {
    is_mediation = true,
    id_banners = {},
    id_inters = {},
    id_reward = {},
    banner_on_init = true,
    ads_interval = 4 * 60,
    ads_delay = 30
}
____exports.VK_SHARE_URL = "https://vk.com/app51867396"
____exports.OK_SHARE_TEXT = ""
____exports.ID_YANDEX_METRICA = sys.get_sys_info().system_name == "Android" and "c1ce595b-7bf8-4b99-b487-0457f8da7b95" or "91a2fd82-b0de-4fb2-b3a7-03bff14b9d09"
____exports.RATE_FIRST_SHOW = 24 * 60 * 60
____exports.RATE_SECOND_SHOW = 3 * 24 * 60 * 60
____exports.MAIN_BUNDLE_SCENES = {"game"}
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
    min_lifes = 0,
    max_lifes = 3,
    animal_offset = true,
    min_swipe_distance = 32,
    swap_element_easing = ____go_EASING_LINEAR_1,
    swap_element_time = 0.25,
    squash_element_easing = ____go_EASING_INCUBIC_2,
    squash_element_time = 0.25,
    helicopter_fly_duration = 0.75,
    damaged_element_easing = ____go_EASING_INOUTBACK_3,
    damaged_element_time = 0.25,
    damaged_element_delay = 0,
    damaged_element_scale = 0.3,
    base_cell_color = ____temp_4,
    complex_move = true,
    movement_to_point = ____temp_0,
    duration_of_movement_bettween_cells = sys.get_sys_info().system_name == "HTML5" and tonumber(html5.run("new URL(location).searchParams.get('time')||0.05")) or 0.05,
    spawn_element_easing = go.EASING_INCUBIC,
    spawn_element_time = 0.5,
    default_substrate_z_index = -2,
    default_cell_z_index = -1,
    default_element_z_index = 0,
    default_top_layer_cell_z_index = 2,
    default_vfx_z_index = 2.5,
    substrate_view = {
        [SubstrateId.OutsideArc] = "outside_arc",
        [SubstrateId.OutsideInsideAngle] = "outside_inside_angle",
        [SubstrateId.OutsideAngle] = "outside_angle",
        [SubstrateId.LeftRightStrip] = "left_right_strip",
        [SubstrateId.LeftStripTopBottomInsideAngle] = "left_strip_top_inside_angle",
        [SubstrateId.LeftStripTopInsideAngle] = "left_strip_top_inside_angle",
        [SubstrateId.LeftStripBottomInsideAngle] = "left_strip_bottom_inside_angle",
        [SubstrateId.LeftStrip] = "left_strip",
        [SubstrateId.TopBottomInsideAngle] = "top_bottom_inside_angle",
        [SubstrateId.InsideAngle] = "inside_angle",
        [SubstrateId.Full] = "full"
    },
    cell_view = {
        [CellId.Base] = "cell_white",
        [CellId.Grass] = "cell_grass",
        [CellId.Flowers] = "cell_flowers",
        [CellId.Web] = "cell_web",
        [CellId.Box] = "cell_box",
        [CellId.Stone0] = "cell_stone_0",
        [CellId.Stone1] = "cell_stone_1",
        [CellId.Stone2] = "cell_stone_2",
        [CellId.Lock] = "cell_lock"
    },
    activation_cells = {CellId.Web, CellId.Grass, CellId.Flowers},
    near_activated_cells = {CellId.Box, CellId.Stone0, CellId.Stone1, CellId.Stone2},
    disabled_cells = {
        CellId.Box,
        CellId.Stone0,
        CellId.Stone1,
        CellId.Stone2,
        CellId.Lock
    },
    not_moved_cells = {
        CellId.Box,
        CellId.Stone0,
        CellId.Stone1,
        CellId.Stone2,
        CellId.Web
    },
    top_layer_cells = {
        CellId.Box,
        CellId.Stone0,
        CellId.Stone1,
        CellId.Stone2,
        CellId.Web,
        CellId.Lock
    },
    element_view = {
        [ElementId.Dimonde] = "element_diamond",
        [ElementId.Gold] = "element_gold",
        [ElementId.Topaz] = "element_topaz",
        [ElementId.Ruby] = "element_ruby",
        [ElementId.Emerald] = "element_emerald",
        [ElementId.VerticalRocket] = "vertical_rocket_buster",
        [ElementId.HorizontalRocket] = "horizontal_rocket_buster",
        [ElementId.AxisRocket] = "axis_rocket_buster",
        [ElementId.Helicopter] = "helicopter_buster",
        [ElementId.Dynamite] = "dynamite_buster",
        [ElementId.Diskosphere] = "diskosphere_buster",
        [ElementId.Cheese] = "element_cheese",
        [ElementId.Cabbage] = "element_cabbage",
        [ElementId.Acorn] = "element_acorn",
        [ElementId.RareMeat] = "element_rare_meat",
        [ElementId.MediumMeat] = "element_medium_meat",
        [ElementId.Chicken] = "element_chicken",
        [ElementId.SunFlower] = "element_sunflower",
        [ElementId.Salad] = "element_salad",
        [ElementId.Hay] = "element_hay"
    },
    element_colors = {
        [ElementId.Dimonde] = "blue",
        [ElementId.Gold] = "yellow",
        [ElementId.Topaz] = "purple",
        [ElementId.Ruby] = "red",
        [ElementId.Emerald] = "green",
        [ElementId.VerticalRocket] = "",
        [ElementId.HorizontalRocket] = "",
        [ElementId.AxisRocket] = "",
        [ElementId.Helicopter] = "",
        [ElementId.Dynamite] = "",
        [ElementId.Diskosphere] = "",
        [ElementId.Cheese] = "",
        [ElementId.Cabbage] = "",
        [ElementId.Acorn] = "",
        [ElementId.RareMeat] = "",
        [ElementId.MediumMeat] = "",
        [ElementId.Chicken] = "",
        [ElementId.SunFlower] = "",
        [ElementId.Salad] = "",
        [ElementId.Hay] = ""
    },
    cell_colors = {
        [CellId.Base] = "",
        [CellId.Box] = "",
        [CellId.Flowers] = "",
        [CellId.Grass] = "",
        [CellId.Lock] = "",
        [CellId.Stone0] = "",
        [CellId.Stone1] = "",
        [CellId.Stone2] = "",
        [CellId.Web] = ""
    },
    base_elements = {
        ElementId.Dimonde,
        ElementId.Gold,
        ElementId.Topaz,
        ElementId.Ruby,
        ElementId.Emerald
    },
    buster_elements = {
        ElementId.VerticalRocket,
        ElementId.HorizontalRocket,
        ElementId.AxisRocket,
        ElementId.Dynamite,
        ElementId.Helicopter,
        ElementId.Diskosphere
    },
    animal_levels = {
        4,
        11,
        18,
        25,
        32,
        39,
        47
    },
    level_to_animal = {
        [4] = "goose",
        [11] = "kozel",
        [18] = "kaban",
        [25] = "goose",
        [32] = "rats",
        [39] = "dog",
        [47] = "bull"
    },
    tutorial_levels = {
        1,
        2,
        3,
        4,
        5,
        6,
        9,
        10,
        13,
        17
    },
    tutorials_data = {
        [1] = {
            cells = {{x = 5, y = 4}, {x = 3, y = 5}, {x = 4, y = 5}, {x = 5, y = 5}},
            bounds = {from_x = 3, from_y = 4, to_x = 6, to_y = 6},
            step = {from_x = 5, from_y = 4, to_x = 5, to_y = 5},
            text = {
                data = "tutorial_collect",
                pos = vmath.vector3(0, 320, 0)
            }
        },
        [2] = {
            cells = {
                {x = 3, y = 3},
                {x = 3, y = 4},
                {x = 4, y = 4},
                {x = 3, y = 5},
                {x = 3, y = 6}
            },
            bounds = {from_x = 3, from_y = 3, to_x = 5, to_y = 7},
            step = {from_x = 4, from_y = 4, to_x = 3, to_y = 4},
            text = {
                data = "tutorial_collect_rocket",
                pos = vmath.vector3(0, 320, 0)
            },
            arrow_pos = vmath.vector3(70, -85, 0),
            buster_icon = {
                icon = "rocket_icon",
                pos = vmath.vector3(-30, -190, 0)
            }
        },
        [3] = {
            cells = {
                {x = 5, y = 3},
                {x = 3, y = 4},
                {x = 4, y = 4},
                {x = 5, y = 4},
                {x = 6, y = 4},
                {x = 7, y = 4}
            },
            bounds = {from_x = 3, from_y = 3, to_x = 8, to_y = 5},
            step = {from_x = 5, from_y = 3, to_x = 5, to_y = 4},
            text = {
                data = "tutorial_collect_diskosphere",
                pos = vmath.vector3(0, 320, 0)
            },
            arrow_pos = vmath.vector3(70, -85, 0),
            buster_icon = {
                icon = "diskosphere_icon",
                pos = vmath.vector3(-30, -190, 0)
            }
        },
        [4] = {
            cells = {{x = 5, y = 3}, {x = 3, y = 4}, {x = 4, y = 4}, {x = 5, y = 4}},
            bounds = {from_x = 3, from_y = 3, to_x = 6, to_y = 5},
            step = {from_x = 5, from_y = 3, to_x = 5, to_y = 4},
            text = {
                data = "tutorial_timer",
                pos = vmath.vector3(0, 320, 0)
            }
        },
        [5] = {
            cells = {{x = 7, y = 3}, {x = 5, y = 4}, {x = 6, y = 4}, {x = 7, y = 4}},
            bounds = {from_x = 5, from_y = 3, to_x = 8, to_y = 5},
            step = {from_x = 7, from_y = 3, to_x = 7, to_y = 4},
            text = {
                data = "tutorial_grass",
                pos = vmath.vector3(0, 320, 0)
            }
        },
        [6] = {
            busters = "hammer",
            text = {
                data = "tutorial_hammer",
                pos = vmath.vector3(0, 50, 0)
            }
        },
        [9] = {
            busters = "spinning",
            text = {
                data = "tutorial_spinning",
                pos = vmath.vector3(0, 50, 0)
            }
        },
        [10] = {
            cells = {
                {x = 3, y = 4},
                {x = 4, y = 4},
                {x = 5, y = 4},
                {x = 6, y = 4},
                {x = 3, y = 5},
                {x = 4, y = 5},
                {x = 5, y = 5},
                {x = 6, y = 5}
            },
            bounds = {from_x = 3, from_y = 4, to_x = 7, to_y = 6},
            step = {from_x = 3, from_y = 4, to_x = 4, to_y = 4},
            text = {
                data = "tutorial_box",
                pos = vmath.vector3(0, 250, 0)
            }
        },
        [13] = {
            cells = {{x = 6, y = 4}, {x = 6, y = 5}, {x = 7, y = 5}, {x = 8, y = 5}},
            bounds = {from_x = 6, from_y = 4, to_x = 9, to_y = 6},
            step = {from_x = 6, from_y = 4, to_x = 6, to_y = 5},
            text = {
                data = "tutorial_web",
                pos = vmath.vector3(0, 270, 0)
            }
        },
        [17] = {
            busters = {"horizontal_rocket", "vertical_rocket"},
            text = {
                data = "tutorial_rockets",
                pos = vmath.vector3(0, 50, 0)
            }
        }
    },
    levels = {},
    is_revive = false,
    revive_state = {}
}
____exports._STORAGE_CONFIG = {
    current_level = 0,
    completed_levels = {},
    move_showed = false,
    map_last_pos_y = 0,
    hammer_opened = false,
    spinning_opened = false,
    horizontal_rocket_opened = false,
    vertical_rocket_opened = false,
    hammer_counts = 0,
    spinning_counts = 0,
    horizontal_rocket_counts = 0,
    vertical_rocket_counts = 0,
    coins = 0,
    life = {start_time = 0, amount = 2},
    infinit_life = {is_active = false, start_time = 0, duration = 0},
    completed_tutorials = {}
}
return ____exports
