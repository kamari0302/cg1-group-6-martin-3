import React from "react";

export const RangeSlider = (props: {
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (value: number) => void
}) => {
    return (
        <input
            className="w-full"
            type='range'
            min={props.min}
            max={props.max}
            step={props.step}
            defaultValue={props.value}
            onChange={e => props.onChange(e.target.valueAsNumber)}
        />
    )
}