import React from "react"

export const UILabel = (props: {
    title: string,
    children: React.ReactNode
    className?: string
}) => {
    return (
        <div className={'flex flex-col w-full items-stretch gap-2 ' + props.className}>
            <div className='text-sm text-neutral-50 uppercase font-bold'>{props.title}</div>
            <div className='text-sm'>{props.children}</div>
        </div>
    )
}
