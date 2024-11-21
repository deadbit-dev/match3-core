local ____lualib = require("lualib_bundle")
local __TS__StringIncludes = ____lualib.__TS__StringIncludes
local ____exports = {}
local ____game = require("game.game")
local CellId = ____game.CellId
local ElementId = ____game.ElementId
local ____view = require("game.view")
local SubstrateId = ____view.SubstrateId
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
____exports.MAIN_BUNDLE_SCENES = {"movie", "game"}
____exports._GAME_CONFIG = {
    debug_levels = false,
    bottom_offset = 50,
    min_swipe_distance = 32,
    swap_element_easing = go.EASING_INOUTQUAD,
    swap_element_time = 0.15,
    combination_delay = 0.2,
    squash_easing = go.EASING_INCUBIC,
    squash_time = 0.25,
    falling_dalay = 0.05,
    falling_time = 0.15,
    max_coins = 100000,
    max_lifes = 3,
    delay_before_win = 0.5,
    delay_before_gameover = 2,
    animal_level_delay_before_win = 5,
    fade_value = 0.9,
    helicopter_spin_duration = 0.5 + 2,
    helicopter_fly_duration = 2,
    damaged_element_easing = go.EASING_INOUTBACK,
    damaged_element_time = 0.25,
    damaged_element_delay = 0,
    damaged_element_scale = 0.3,
    base_cell_color = sys.get_sys_info().system_name == "HTML5" and html5.run("new URL(location).searchParams.get('color')||'#c29754'") or "#c29754",
    spawn_element_easing = go.EASING_INCUBIC,
    spawn_element_time = 0.5,
    shuffle_max_attempt = 10,
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
        [CellId.Grass] = {"cell_grass_1", "cell_grass"},
        [CellId.Flowers] = "cell_flowers",
        [CellId.Web] = "cell_web",
        [CellId.Box] = "cell_box",
        [CellId.Stone] = {"cell_stone_2", "cell_stone_1", "cell_stone"}
    },
    sounded_cells = {CellId.Box, CellId.Web, CellId.Grass, CellId.Stone},
    cell_sound = {[CellId.Box] = "wood", [CellId.Grass] = "grass", [CellId.Web] = "web", [CellId.Stone] = "stone"},
    cell_strength = {
        [CellId.Box] = 1,
        [CellId.Flowers] = 1,
        [CellId.Grass] = 2,
        [CellId.Stone] = 3,
        [CellId.Web] = 1
    },
    damage_cells = {CellId.Web, CellId.Grass, CellId.Flowers},
    near_damage_cells = {CellId.Box, CellId.Stone},
    disabled_cells = {CellId.Box, CellId.Stone},
    not_moved_cells = {CellId.Box, CellId.Stone, CellId.Web},
    top_layer_cells = {CellId.Box, CellId.Stone, CellId.Web},
    element_view = {
        [ElementId.Dimonde] = "element_diamond",
        [ElementId.Gold] = "element_gold",
        [ElementId.Topaz] = "element_topaz",
        [ElementId.Ruby] = "element_ruby",
        [ElementId.Emerald] = "element_emerald",
        [ElementId.VerticalRocket] = "vertical_rocket_buster",
        [ElementId.HorizontalRocket] = "horizontal_rocket_buster",
        [ElementId.AllAxisRocket] = "axis_rocket_buster",
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
        [ElementId.Cheese] = "yellow",
        [ElementId.Cabbage] = "green",
        [ElementId.Acorn] = "yellow",
        [ElementId.RareMeat] = "red",
        [ElementId.MediumMeat] = "red",
        [ElementId.Chicken] = "red",
        [ElementId.SunFlower] = "yellow",
        [ElementId.Salad] = "green",
        [ElementId.Hay] = "yellow"
    },
    explodable_cells = {CellId.Box, CellId.Grass, CellId.Stone},
    base_elements = {
        ElementId.Dimonde,
        ElementId.Gold,
        ElementId.Topaz,
        ElementId.Ruby,
        ElementId.Emerald
    },
    feed_elements = {
        ElementId.Acorn,
        ElementId.Cheese,
        ElementId.Chicken,
        ElementId.Cabbage,
        ElementId.Hay,
        ElementId.MediumMeat,
        ElementId.RareMeat,
        ElementId.Salad,
        ElementId.SunFlower
    },
    buster_elements = {
        ElementId.VerticalRocket,
        ElementId.HorizontalRocket,
        ElementId.AllAxisRocket,
        ElementId.Dynamite,
        ElementId.Helicopter,
        ElementId.Diskosphere
    },
    rockets = {ElementId.VerticalRocket, ElementId.HorizontalRocket, ElementId.AllAxisRocket},
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
        7,
        8,
        9,
        10,
        13,
        17
    },
    tutorials_data = {
        [1] = {
            cells = {{x = 5, y = 4}, {x = 3, y = 5}, {x = 4, y = 5}, {x = 5, y = 5}},
            bounds = {from = {x = 3, y = 4}, to = {x = 6, y = 6}},
            step = {from = {x = 5, y = 4}, to = {x = 5, y = 5}},
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
            bounds = {from = {x = 3, y = 3}, to = {x = 5, y = 7}},
            step = {from = {x = 4, y = 4}, to = {x = 3, y = 4}},
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
            bounds = {from = {x = 3, y = 3}, to = {x = 8, y = 5}},
            step = {from = {x = 5, y = 3}, to = {x = 5, y = 4}},
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
            bounds = {from = {x = 3, y = 3}, to = {x = 6, y = 5}},
            step = {from = {x = 5, y = 3}, to = {x = 5, y = 4}},
            text = {
                data = "tutorial_timer",
                pos = vmath.vector3(0, 320, 0)
            }
        },
        [5] = {
            cells = {{x = 7, y = 3}, {x = 5, y = 4}, {x = 6, y = 4}, {x = 7, y = 4}},
            bounds = {from = {x = 5, y = 3}, to = {x = 8, y = 5}},
            step = {from = {x = 7, y = 3}, to = {x = 7, y = 4}},
            text = {
                data = "tutorial_grass",
                pos = vmath.vector3(0, 320, 0)
            }
        },
        [6] = {
            busters = "hammer",
            text = {
                data = "tutorial_hammer",
                pos = vmath.vector3(0, 390, 0)
            },
            cells = {{x = 6, y = 3}},
            click = {x = 6, y = 3},
            bounds = {from = {x = 6, y = 3}, to = {x = 7, y = 4}}
        },
        [7] = {
            cells = {{x = 1, y = 7}},
            click = {x = 1, y = 7},
            bounds = {from = {x = 0, y = 7}, to = {x = 2, y = 8}},
            text = {
                data = "tutorial_buster_click",
                pos = vmath.vector3(0, 100, 0)
            }
        },
        [8] = {
            cells = {{x = 6, y = 3}, {x = 7, y = 3}},
            step = {from = {x = 6, y = 3}, to = {x = 7, y = 3}},
            bounds = {from = {x = 6, y = 3}, to = {x = 8, y = 4}},
            text = {
                data = "tutorial_buster_swap",
                pos = vmath.vector3(0, 320, 0)
            }
        },
        [9] = {
            busters = "spinning",
            text = {
                data = "tutorial_spinning",
                pos = vmath.vector3(0, -100, 0)
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
            bounds = {from = {x = 3, y = 4}, to = {x = 7, y = 6}},
            step = {from = {x = 3, y = 4}, to = {x = 4, y = 4}},
            text = {
                data = "tutorial_box",
                pos = vmath.vector3(0, 250, 0)
            }
        },
        [13] = {
            cells = {{x = 6, y = 4}, {x = 6, y = 5}, {x = 7, y = 5}, {x = 8, y = 5}},
            bounds = {from = {x = 6, y = 4}, to = {x = 9, y = 6}},
            step = {from = {x = 6, y = 4}, to = {x = 6, y = 5}},
            text = {
                data = "tutorial_web",
                pos = vmath.vector3(0, 270, 0)
            }
        },
        [17] = {
            busters = {"horizontal_rocket", "vertical_rocket"},
            text = {
                data = "tutorial_rockets",
                pos = vmath.vector3(0, 390, 0)
            },
            bounds = {from = {x = 3, y = 4}, to = {x = 4, y = 5}},
            cells = {{x = 3, y = 4}},
            click = {x = 3, y = 4}
        }
    },
    levels = {},
    is_revive = false,
    is_restart = false,
    revive_states = {},
    is_busy_input = false,
    steps_by_ad = 0,
    products = {},
    has_payments = false
}
____exports._STORAGE_CONFIG = {
    current_level = 0,
    completed_levels = {},
    sound_bg = true,
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
    completed_tutorials = {},
    noads = {},
    was_purchased = false
}
____exports.Dlg = Dlg or ({})
____exports.Dlg.Store = 0
____exports.Dlg[____exports.Dlg.Store] = "Store"
____exports.Dlg.NotEnoughCoins = 1
____exports.Dlg[____exports.Dlg.NotEnoughCoins] = "NotEnoughCoins"
____exports.Dlg.LifeNotification = 2
____exports.Dlg[____exports.Dlg.LifeNotification] = "LifeNotification"
____exports.Dlg.Settings = 3
____exports.Dlg[____exports.Dlg.Settings] = "Settings"
____exports.Dlg.Hammer = 4
____exports.Dlg[____exports.Dlg.Hammer] = "Hammer"
____exports.Dlg.VerticalRocket = 5
____exports.Dlg[____exports.Dlg.VerticalRocket] = "VerticalRocket"
____exports.Dlg.HorizontalRocket = 6
____exports.Dlg[____exports.Dlg.HorizontalRocket] = "HorizontalRocket"
____exports.Dlg.Spinning = 7
____exports.Dlg[____exports.Dlg.Spinning] = "Spinning"
return ____exports
