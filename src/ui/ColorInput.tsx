import { Vector3 } from "@math.gl/core"
import React from "react"

const toHex = (n: Vector3) => {
    return '#' +
        Math.round(n[0] * 255).toString(16).padStart(2, '0') +
        Math.round(n[1] * 255).toString(16).padStart(2, '0') +
        Math.round(n[2] * 255).toString(16).padStart(2, '0')
}

export const ColorInput = (props: {
    value: Vector3,
    onChange: (color: Vector3) => void
}) => {
    const [color, setColor] = React.useState(props.value)
    return (
        <input
            style={{
                backgroundColor: toHex(color)
            }}
            className="w-full rounded-xl"
            type="color"
            defaultValue={toHex(color)}
            onChange={e => {
                const c = new Vector3([
                    parseInt(e.target.value.substring(1, 3), 16) / 255,
                    parseInt(e.target.value.substring(3, 5), 16) / 255,
                    parseInt(e.target.value.substring(5, 7), 16) / 255
                ]);
                console.log(c, e.target.value, e.target.value.substring(1, 3))
                setColor(c);
                props.onChange(c);
            }}
        ></input>
    )
}