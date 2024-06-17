/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

go.property("with_x_position", false);
go.property("with_y_position", true);
go.property("with_scale", true);


interface props {
    with_x_position: boolean,
    with_y_position: boolean,
    with_scale: boolean,
    prev_game_width: number,
    prev_game_height: number,
    original_position: vmath.vector3,
    original_scale: vmath.vector3
}

const original_game_width = 540;
const original_game_height = 960;

export function init(this: props) {
    this.prev_game_width = original_game_width;
    this.prev_game_height = original_game_height;
    this.original_position = go.get_position();
    this.original_scale = go.get_scale();

    timer.delay(0.1, true, () => {
        const ltrb = Camera.get_ltrb();
        if(this.prev_game_width == ltrb.z && this.prev_game_height == ltrb.w) return;

        this.prev_game_width = ltrb.z;
        this.prev_game_height = ltrb.w;

        const changes_coff = math.abs(ltrb.w) / original_game_height;
        
        const half_of_width = original_game_width * 0.5;
        const delta_x = (half_of_width - this.original_position.x) * changes_coff;
        print(go.get_id(), delta_x, changes_coff);

        go.set_position(vmath.vector3(
            this.with_x_position ? half_of_width - delta_x : this.original_position.x,
            this.with_y_position ? this.original_position.y * changes_coff : this.original_position.y,
            this.original_position.z
        ));
        
        if(this.with_scale) {
            go.set_scale(vmath.vector3(
                this.original_scale.x * changes_coff,
                this.original_scale.y * changes_coff,
                this.original_scale.z
            ));
        }
    });
}