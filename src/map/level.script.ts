/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */


go.property('number', 1);
go.property('click_radius', 25);

interface props {
    number: number,
    click_radius: number
}

export function on_message(this: props, message_id: hash, message: any, sender: hash): void {
    Manager.on_message(this, message_id, message, sender);
    if(message_id == ID_MESSAGES.MSG_TOUCH) check_click(this, message_id, message);
}

function check_click(obj: props, action_id: string | hash, action: any): void {
    if (action_id == ID_MESSAGES.MSG_TOUCH && action.released) {
        const game_height = 960;
        action.y -= game_height;
        
        const pos = go.get_world_position();
        
        const is_x = (action.x < pos.x + obj.click_radius) && (action.x > pos.x - obj.click_radius);
        const is_y = (action.y < pos.y + obj.click_radius) && (action.y > pos.y - obj.click_radius);
        if(is_x && is_y) load_level(obj.number - 1);
    }
}

function load_level(level: number) {
    GameStorage.set('current_level', level);
    Scene.load('game');
}