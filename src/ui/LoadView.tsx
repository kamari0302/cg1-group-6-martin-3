export const LoadView = (props: {
    loading?: boolean
}) => {
    return (
        <div className={'absolute inset-0 flex justify-center items-center bg-neutral-500/60 pointer-events-none ease-in-out duration-300 transition-[opacity] backdrop-blur ' + (props.loading ? "opacity-100" : "opacity-0")}>
            <div className='bg-jgu2 rounded-full p-4 w-12 h-12 flex justify-center items-center text-neutral-50 animate-spin'>
                <i className='bi bi-arrow-clockwise text-xl'></i>
            </div>
        </div>
    )
}