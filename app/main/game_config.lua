local ____lualib = require("lualib_bundle")
local __TS__StringIncludes = ____lualib.__TS__StringIncludes
local ____exports = {}
local ____match3_core = require("game.match3_core")
local CombinationType = ____match3_core.CombinationType
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
____exports.VK_SHARE_URL = ""
____exports.OK_SHARE_TEXT = ""
____exports.ID_YANDEX_METRICA = ""
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
    min_swipe_distance = 32,
    animal_offset = true,
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
    movement_to_point = ____temp_0,
    duration_of_movement_bettween_cells = sys.get_sys_info().system_name == "HTML5" and tonumber(html5.run("new URL(location).searchParams.get('time')||0.05")) or 0.05,
    complex_move = true,
    spawn_element_easing = go.EASING_INCUBIC,
    spawn_element_time = 0.5,
    default_substrate_z_index = -2,
    default_cell_z_index = -1,
    default_element_z_index = 0,
    default_top_layer_cell_z_index = 2,
    default_vfx_z_index = 2.5,
    substrate_database = {
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
        [ElementId.Dimonde] = "#009de2",
        [ElementId.Gold] = "#e94165",
        [ElementId.Topaz] = "#f5d74d",
        [ElementId.Ruby] = "#9a4ee5",
        [ElementId.Emerald] = "#20af1b",
        [ElementId.VerticalRocket] = "#ffffff",
        [ElementId.HorizontalRocket] = "#ffffff",
        [ElementId.AxisRocket] = "#ffffff",
        [ElementId.Helicopter] = "#ffffff",
        [ElementId.Dynamite] = "#ffffff",
        [ElementId.Diskosphere] = "#ffffff",
        [ElementId.Cheese] = "#ffffff",
        [ElementId.Cabbage] = "#ffffff",
        [ElementId.Acorn] = "#ffffff",
        [ElementId.RareMeat] = "#ffffff",
        [ElementId.MediumMeat] = "#ffffff",
        [ElementId.Chicken] = "#ffffff",
        [ElementId.SunFlower] = "#ffffff",
        [ElementId.Salad] = "#ffffff",
        [ElementId.Hay] = "#ffffff"
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
        [4] = "cock",
        [11] = "kozel",
        [18] = "kaban",
        [25] = "goose",
        [32] = "rats",
        [39] = "cock",
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
            cells = {
                {x = 3, y = 4},
                {x = 4, y = 4},
                {x = 5, y = 4},
                {x = 3, y = 5},
                {x = 4, y = 5},
                {x = 5, y = 5}
            },
            combination = CombinationType.Comb3,
            text = "tutorial_collect",
            position = vmath.vector3(270, 750, 0)
        },
        [2] = {
            cells = {
                {x = 3, y = 3},
                {x = 4, y = 3},
                {x = 3, y = 4},
                {x = 4, y = 4},
                {x = 3, y = 5},
                {x = 4, y = 5},
                {x = 3, y = 6},
                {x = 4, y = 6}
            },
            combination = CombinationType.Comb4,
            text = "tutorial_collect_rocket",
            position = vmath.vector3(270, 750, 0)
        },
        [3] = {
            cells = {
                {x = 3, y = 3},
                {x = 4, y = 3},
                {x = 5, y = 3},
                {x = 6, y = 3},
                {x = 7, y = 3},
                {x = 3, y = 4},
                {x = 4, y = 4},
                {x = 5, y = 4},
                {x = 6, y = 4},
                {x = 7, y = 4}
            },
            combination = CombinationType.Comb5,
            text = "tutorial_collect_diskosphere",
            position = vmath.vector3(270, 750, 0)
        },
        [4] = {
            cells = {
                {x = 3, y = 3},
                {x = 4, y = 3},
                {x = 5, y = 3},
                {x = 3, y = 4},
                {x = 4, y = 4},
                {x = 5, y = 4}
            },
            combination = CombinationType.Comb3,
            text = "tutorial_timer",
            position = vmath.vector3(270, 750, 0)
        },
        [5] = {
            cells = {
                {x = 3, y = 3},
                {x = 4, y = 3},
                {x = 5, y = 3},
                {x = 6, y = 3},
                {x = 7, y = 3},
                {x = 3, y = 4},
                {x = 4, y = 4},
                {x = 5, y = 4},
                {x = 6, y = 4},
                {x = 7, y = 4},
                {x = 3, y = 5},
                {x = 4, y = 5},
                {x = 5, y = 5},
                {x = 6, y = 5},
                {x = 7, y = 5}
            },
            activation = CellId.Flowers,
            text = "tutorial_grass",
            position = vmath.vector3(270, 750, 0)
        },
        [6] = {
            busters = "hammer",
            text = "tutorial_hammer",
            position = vmath.vector3(270, 750, 0)
        },
        [9] = {
            busters = "spinning",
            text = "tutorial_spinning",
            position = vmath.vector3(270, 750, 0)
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
            activation = CellId.Box,
            text = "tutorial_box",
            position = vmath.vector3(270, 750, 0)
        },
        [13] = {
            cells = {
                {x = 6, y = 2},
                {x = 7, y = 2},
                {x = 6, y = 3},
                {x = 7, y = 3},
                {x = 6, y = 4},
                {x = 7, y = 4},
                {x = 8, y = 4},
                {x = 6, y = 5},
                {x = 7, y = 5},
                {x = 8, y = 5},
                {x = 6, y = 6},
                {x = 7, y = 6},
                {x = 6, y = 7},
                {x = 7, y = 7}
            },
            activation = CellId.Web,
            text = "tutorial_web",
            position = vmath.vector3(270, 750, 0)
        },
        [17] = {
            busters = {"horizontal_rocket", "vertical_rocket"},
            text = "tutorial_rockets",
            position = vmath.vector3(270, 750, 0)
        }
    },
    levels = {}
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
    hammer_counts = 3,
    spinning_counts = 3,
    horizontal_rocket_counts = 3,
    vertical_rocket_counts = 3,
    completed_tutorials = {}
}
return ____exports
