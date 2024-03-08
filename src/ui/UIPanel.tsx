import React from "react";

export const UIPanel = (props: {
    noExpand?: boolean
    children: React.ReactNode
    className?: string
}) => {

    const containerRef = React.useRef<HTMLDivElement>(null);
    const [height, setHeight] = React.useState(0);

    React.useEffect(() => {
        if (props.noExpand) {
            setHeight(containerRef.current?.scrollHeight ?? 0)
        }
    }, [props.noExpand])

    return (
        <div className={'absolute right-0 bottom-0 rounded-xl bg-jgu2/60 p-4 min-w-96 m-4 h-fit md:w-96 md:left-auto top-auto left-0 backdrop-blur shadow-xl flex flex-col ' + props.className}>
            {
                !props.noExpand ? (
                    <button
                        className="w-full rounded-xl"
                        onClick={() => {
                            if (height == 0) {
                                setHeight(containerRef.current?.scrollHeight ?? 0)
                            } else {
                                setHeight(0)
                            }
                        }}
                        style={{
                            marginBottom: height == 0 ? 0 : 12
                        }}
                    >
                        {
                            height == 0 ? (
                                <i className="bi bi-chevron-up text-white"></i>
                            ) : (
                                <i className="bi bi-chevron-down text-white"></i>
                            )
                        }
                    </button>
                ) : null
            }
            <div
                className="grow overflow-y-scroll flex flex-col gap-3 transition-[height] linear duration-200"
                ref={containerRef}
                style={{
                    height: height
                }}
            >
                {props.children}
            </div>
        </div>
    )
}