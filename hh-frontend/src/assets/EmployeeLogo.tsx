


const EmployeeLogo = ({className}: {className?: string}) => {
    return (
        <svg
            viewBox="30 12 60 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            className={className}
        >

            <circle cx="60" cy="28" r="14" />

            <path d="M32 56 C32 42, 88 42, 88 56 L88 100 Q88 110, 78 110 L42 110 Q32 110, 32 100 Z" />
            <path d="M50 47 L70 47 L65 55 L55 55 L50 47 M56 55 L52 80 L60 90 L68 80 L64 55 Z" />
        </svg>
    )
}

export default EmployeeLogo;