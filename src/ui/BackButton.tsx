export const BackButton = (props: {
    onClick: () => void
}) => {
    return (
        <button
            className='absolute top-4 left-4 w-16 h-16 z-[100] rounded-full flex items-center justify-center transition-all duration-200  bg-jgu2 hover:bg-jgu1 hover:scale-110 active:scale-100 text-white'
            onClick={props.onClick}
        >
            <i className='bi bi-arrow-left text-3xl'></i>
        </button>
    )
}