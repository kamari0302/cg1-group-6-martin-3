export const CardButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    onClick?: () => void;
    children?: React.ReactNode;
}) => {
    return (
        <button
            {...props}
            onClick={props.onClick} 
            className='bg-jgu2 uppercase p-2 text-neutral-50 transition-all active:scale-100 hover:scale-110 duration-200 ease-in-out rounded-xl pr-4 pl-4 pointer-events-auto w-36 h-36'>
            {props.children ?? <>&nbsp;</>}
        </button>
    )
}

export const CardButtonGroup = (props: {
    children?: React.ReactNode;
}) => {
    return (
        <div className='w-full pt-24 h-[inherit] overflow-y-scroll flex justify-center items-center flex-wrap gap-2'>
            {props.children}
        </div>
    )
}
