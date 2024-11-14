local ____exports = {}
local ____core = require("game.core")
local NotActiveCell = ____core.NotActiveCell
local NullElement = ____core.NullElement
local ____game = require("game.game")
local TargetType = ____game.TargetType
local CellId = ____game.CellId
local RandomElement = ____game.RandomElement
function ____exports.load_levels_config()
    local data = sys.load_resource("/resources/levels.json")
    if data == nil then
        return
    end
    local levels = json.decode(data)
    for ____, level_data in ipairs(levels) do
        local level = {
            field = {
                width = 10,
                height = 10,
                max_width = 8,
                max_height = 8,
                cell_size = 128,
                offset_border = 50,
                cells = {},
                elements = {}
            },
            coins = level_data.coins,
            additional_element = level_data.additional_element,
            exclude_element = level_data.exclude_element,
            time = level_data.time,
            steps = level_data.steps,
            targets = {},
            busters = {hammer = {name = "hammer", counts = level_data.busters.hammer, active = false, block = false}, spinning = {name = "spinning", counts = level_data.busters.spinning, active = false, block = false}, horizontal_rocket = {name = "horizontal_rocket", counts = level_data.busters.horizontal_rocket, active = false, block = false}, vertical_rocket = {name = "vertical_rocket", counts = level_data.busters.vertical_rocket, active = false, block = false}}
        }
        do
            local y = 0
            while y < #level_data.field do
                level.field.cells[y + 1] = {}
                level.field.elements[y + 1] = {}
                do
                    local x = 0
                    while x < #level_data.field[y + 1] do
                        local data = level_data.field[y + 1][x + 1]
                        if type(data) == "string" then
                            repeat
                                local ____switch8 = data
                                local ____cond8 = ____switch8 == "-"
                                if ____cond8 then
                                    level.field.cells[y + 1][x + 1] = NotActiveCell
                                    level.field.elements[y + 1][x + 1] = NullElement
                                    break
                                end
                                ____cond8 = ____cond8 or ____switch8 == ""
                                if ____cond8 then
                                    level.field.cells[y + 1][x + 1] = CellId.Base
                                    level.field.elements[y + 1][x + 1] = RandomElement
                                    break
                                end
                            until true
                        else
                            if data.element ~= nil then
                                level.field.elements[y + 1][x + 1] = data.element
                            else
                                level.field.elements[y + 1][x + 1] = RandomElement
                            end
                            if data.cell ~= nil then
                                level.field.cells[y + 1][x + 1] = {CellId.Base, data.cell}
                                if level.field.elements[y + 1][x + 1] == RandomElement and (data.cell == CellId.Stone or data.cell == CellId.Box) then
                                    level.field.elements[y + 1][x + 1] = NullElement
                                end
                            else
                                level.field.cells[y + 1][x + 1] = CellId.Base
                            end
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        for ____, target_data in ipairs(level_data.targets) do
            local target
            if target_data.type.element ~= nil then
                target = {id = target_data.type.element, type = TargetType.Element, count = 0, uids = {}}
            end
            if target_data.type.cell ~= nil then
                target = {id = target_data.type.cell, type = TargetType.Cell, count = 0, uids = {}}
            end
            if target ~= nil then
                local count = tonumber(target_data.count)
                target.count = count ~= nil and count or target.count
                local ____level_targets_0 = level.targets
                ____level_targets_0[#____level_targets_0 + 1] = target
            end
        end
        local ____GAME_CONFIG_levels_1 = GAME_CONFIG.levels
        ____GAME_CONFIG_levels_1[#____GAME_CONFIG_levels_1 + 1] = level
    end
end
return ____exports
