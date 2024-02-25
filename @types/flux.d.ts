/* eslint-disable @typescript-eslint/no-explicit-any */
/** @noResolution */
declare module 'utils.flux' {
    /**
     * Updates the flux state.
     * @param dt The delta time since the last update.
     */
    export function update(dt: number): void;

    /**
     * Creates a new tween for the specified object.
     * @param obj The object containing the variables to tween.
     * @param time The duration of the tween in seconds.
     * @param params The destination values for the variables to tween.
     * @return A FluxClass instance representing the tween.
     */
    export function to(obj: any, time: number, params: any): FluxClass;

    /**
     * Creates a new flux group.
     * @return A FluxGroup instance.
     */
    export function group(): FluxGroup;
}

type CallbackFn = (...args: any[]) => any;

interface FluxGroup {
    /**
     * Updates the flux group state.
     * @param dt The delta time since the last update.
     */
    update(dt: number): void;

    /**
     * Creates a new tween for the specified object and adds it to the group.
     * @param obj The object containing the variables to tween.
     * @param time The duration of the tween in seconds.
     * @param params The destination values for the variables to tween.
     * @return A FluxClass instance representing the tween.
     */
    to(obj: any, time: number, params: any): FluxClass;
}

interface FluxClass {
    /**
     * Sets the easing type for the tween.
     * @param type The easing type to use.
     * @return The FluxClass instance for chaining.
     */
    ease(type: Easing): this;

    /**
     * Sets the delay before the tween starts.
     * @param time The delay in seconds.
     * @return The FluxClass instance for chaining.
     */
    delay(time: number): this;

    /**
     * Sets a callback function to be called when the tween starts.
     * @param fn The callback function.
     * @return The FluxClass instance for chaining.
     */
    onstart(fn: CallbackFn): this;

    /**
     * Sets a callback function to be called each frame the tween updates a value.
     * @param fn The callback function.
     * @return The FluxClass instance for chaining.
     */
    onupdate(fn: CallbackFn): this;

    /**
     * Sets a callback function to be called once the tween has finished.
     * @param fn The callback function.
     * @return The FluxClass instance for chaining.
     */
    oncomplete(fn: CallbackFn): this;

    /**
     * Creates a new tween and chains it to the end of the existing tween.
     * @param obj The object containing the variables to tween (optional).
     * @param time The duration of the tween in seconds.
     * @param params The destination values for the variables to tween.
     * @return The FluxClass instance for chaining.
     */
    after(obj: any, time: number, params: any): this;

    /**
     * Stops the tween immediately, leaving the tweened variables at their current values.
     */
    stop(): void;
}

type Easing = 'linear' | 'quadin' | 'quadout' | 'quadinout' | 'cubicin' | 'cubicout' | 'cubicinout' |
    'quartin' | 'quartout' | 'quartinout' | 'quintin' | 'quintout' | 'quintinout' | 'expoin' |
    'expoout' | 'expoinout' | 'sinein' | 'sineout' | 'sineinout' | 'circin' | 'circout' | 'circinout' |
    'backin' | 'backout' | 'backinout' | 'elasticin' | 'elasticout' | 'elasticinout';