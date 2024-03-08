import React from 'react';
import { useForceUpdate } from '../Utility';

interface IMultiSwitchSlement {
    label: string;
    value?: any;
}

export const MultiSwitchElement = (props: IMultiSwitchSlement) => {
    return <></>
}

export const MultiSwitch = (props: {
    className?: string;
    children: React.ReactElement<IMultiSwitchSlement | null>[];
    onChange?: (value: any) => void;
}) => {

    const [selected, setSelected] = React.useState<number>(0);
    const children = props.children.filter((child) => child != null);
    const buttonRefs = React.useRef<HTMLButtonElement[]>([]);

    const forceUpdate = useForceUpdate();
    React.useEffect(() => {
        // we need to rerender the component on initialization finished to get the correct button positions
        forceUpdate();
    }, [])

    return (
        <div className={'relative w-full h-fit rounded-xl text-neutral-50 flex flex-wrap'}>
            {
                children.map((child, index) => {
                    return (
                        <button
                            key={index}
                            ref={ref => buttonRefs.current[index] = ref}
                            className='z-10 h-10 flex justify-center items-center p-4'
                            onClick={() => {
                                setSelected(index);
                                props.onChange && props.onChange(child.props.value ?? index);
                            }}
                        >
                            {child.props.label}
                        </button>
                    )
                })
            }
            <div 
                className='absolute pointer-events-none bg-jgu1 rounded-full transition-all duration-300 ease-in-out'
                style={{
                    top: buttonRefs.current[selected]?.offsetTop ?? 0,
                    left: buttonRefs.current[selected]?.offsetLeft ?? 0,
                    height: buttonRefs.current[selected]?.offsetHeight ?? 32,
                    width: buttonRefs.current[selected]?.offsetWidth ?? 32,
                }}
            >
                &nbsp;
            </div>
        </div>
    )
}