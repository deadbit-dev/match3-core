local ____exports = {}
____exports.Direction = Direction or ({})
____exports.Direction.Up = 0
____exports.Direction[____exports.Direction.Up] = "Up"
____exports.Direction.Down = 1
____exports.Direction[____exports.Direction.Down] = "Down"
____exports.Direction.Left = 2
____exports.Direction[____exports.Direction.Left] = "Left"
____exports.Direction.Right = 3
____exports.Direction[____exports.Direction.Right] = "Right"
____exports.Direction.None = 4
____exports.Direction[____exports.Direction.None] = "None"
____exports.Axis = Axis or ({})
____exports.Axis.Vertical = 0
____exports.Axis[____exports.Axis.Vertical] = "Vertical"
____exports.Axis.Horizontal = 1
____exports.Axis[____exports.Axis.Horizontal] = "Horizontal"
____exports.Axis.All = 2
____exports.Axis[____exports.Axis.All] = "All"
local function is_point_in_zone(A, B, C, D, E)
    local function side(a, b, p)
        local val = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)
        if val == 0 then
            return 0
        end
        return val > 0 and 1 or -1
    end
    return side(A, B, E) == -1 and side(B, C, E) == -1 and side(C, D, E) == -1 and side(D, A, E) == -1
end
function ____exports.rotate_around(vec, angle_rad)
    local c = math.cos(angle_rad)
    local s = math.sin(angle_rad)
    local x = vec.x
    local y = vec.y
    vec.x = x * c - y * s
    vec.y = x * s + y * c
end
function ____exports.rotate_around_center(vec, center, angle_rad)
    local c = math.cos(angle_rad)
    local s = math.sin(angle_rad)
    local x = vec.x - center.x
    local y = vec.y - center.y
    vec.x = x * c - y * s + center.x
    vec.y = x * s + y * c + center.y
end
local a = vmath.vector3(0, 0, 0)
local b = vmath.vector3(0, 0, 0)
local c = vmath.vector3(0, 0, 0)
local d = vmath.vector3(0, 0, 0)
function ____exports.is_intersect_zone(check_pos, go_pos, go_size, go_angle_deg, inner_offset)
    local w = go_size.x
    local h = go_size.y
    local angle = math.rad(go_angle_deg)
    a.x = -w / 2
    a.y = h / 2
    b.x = w / 2
    b.y = h / 2
    c.x = w / 2
    c.y = -h / 2
    d.x = -w / 2
    d.y = -h / 2
    if angle ~= 0 then
        ____exports.rotate_around(a, angle)
        ____exports.rotate_around(b, angle)
        ____exports.rotate_around(c, angle)
        ____exports.rotate_around(d, angle)
    end
    if inner_offset then
        ____exports.rotate_around(inner_offset, angle)
        a.x = a.x + inner_offset.x
        a.y = a.y + inner_offset.y
        b.x = b.x + inner_offset.x
        b.y = b.y + inner_offset.y
        c.x = c.x + inner_offset.x
        c.y = c.y + inner_offset.y
        d.x = d.x + inner_offset.x
        d.y = d.y + inner_offset.y
    end
    a.x = a.x + go_pos.x
    a.y = a.y + go_pos.y
    b.x = b.x + go_pos.x
    b.y = b.y + go_pos.y
    c.x = c.x + go_pos.x
    c.y = c.y + go_pos.y
    d.x = d.x + go_pos.x
    d.y = d.y + go_pos.y
    return is_point_in_zone(
        a,
        b,
        c,
        d,
        check_pos
    )
end
function ____exports.rotateMatrix(matrix, degrees)
    local rows = #matrix
    local cols = #matrix[1]
    local rotated = {}
    do
        local y = 0
        while y < cols do
            rotated[y + 1] = {}
            do
                local x = 0
                while x < rows do
                    rotated[y + 1][x + 1] = 0
                    x = x + 1
                end
            end
            y = y + 1
        end
    end
    do
        local i = 0
        while i < rows do
            do
                local j = 0
                while j < cols do
                    local newRow
                    local newCol
                    repeat
                        local ____switch15 = degrees
                        local ____cond15 = ____switch15 == 90
                        if ____cond15 then
                            newRow = j
                            newCol = rows - 1 - i
                            break
                        end
                        ____cond15 = ____cond15 or ____switch15 == 180
                        if ____cond15 then
                            newRow = rows - 1 - i
                            newCol = cols - 1 - j
                            break
                        end
                        ____cond15 = ____cond15 or ____switch15 == 270
                        if ____cond15 then
                            newRow = cols - 1 - j
                            newCol = i
                            break
                        end
                        do
                            Log.error("[ROTATION MATRIX] Invalid degrees: ", degrees)
                            return matrix
                        end
                    until true
                    rotated[newRow + 1][newCol + 1] = matrix[i + 1][j + 1]
                    j = j + 1
                end
            end
            i = i + 1
        end
    end
    return rotated
end
function ____exports.is_valid_pos(x, y, size_x, size_y)
    if x < 0 or x >= size_x or y < 0 or y >= size_y then
        return false
    end
    return true
end
function ____exports.get_neighbors(x, y, array, mask)
    local neighbors = {}
    do
        local i = y - 1
        while i <= y + 1 do
            do
                local j = x - 1
                while j <= x + 1 do
                    if i >= 0 and i < #array and j >= 0 and j < #array[1] and mask[i - (y - 1) + 1][j - (x - 1) + 1] == 1 then
                        neighbors[#neighbors + 1] = array[i + 1][j + 1]
                    end
                    j = j + 1
                end
            end
            i = i + 1
        end
    end
    return neighbors
end
function ____exports.get_debug_intersect_points()
    return {a, b, c, d}
end
return ____exports
