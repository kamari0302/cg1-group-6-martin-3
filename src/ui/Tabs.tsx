import React from 'react';

interface ITab {
    title: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export const Tab = (props: ITab) => {

    const [height, setHeight] = React.useState(0);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (ref.current) {
            setHeight(ref.current.scrollHeight);
        }
    }, [])

    return (
        <div className={props.className} ref={ref}>
            {props.children}
        </div>
    )
}

export const TabContainer = (props: {
    children: React.ReactElement<ITab>[] | React.ReactElement<ITab>
    activeTab?: number;
    className?: string;
}) => {
    const children = props.children instanceof Array ? props.children : [props.children];
    const [activeTab, setActiveTab] = React.useState(props.activeTab ?? 0);
    return (
        <div className={'flex flex-col grow w-full ' + (props.className ?? "")}>
            <div className='relative'>
                {children.map((child, i) => {
                    return (
                        <button
                            key={i}
                            className={[
                                'p-4 z-10 text-lg uppercase font-bold'
                            ].join(' ')}
                            style={{
                                width: `${100 / children.length}%`
                            }}
                            onClick={() => setActiveTab(i)}
                        >
                            {child.props.title}
                        </button>
                    )
                })}
                <div
                    className='absolute inset-0 border-b-2 z-0 border-jgu1 transition-all ease-in-out duration-200'
                    style={{
                        width: `${100 / children.length}%`,
                        transform: `translateX(${activeTab * 100}%)`
                    }}
                >
                    &nbsp;
                </div>
            </div>
            <div className='grow w-full overflow-y-scroll'>
                {children[activeTab]}
            </div>
        </div>
    )
}