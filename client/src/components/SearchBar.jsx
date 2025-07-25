import { useEffect } from "react";

export default function SearchBar({ value, onChange }) {
    useEffect(() => {
        const handleShortcut = (e) => {
            if (e.key === "f" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                document.getElementById("search-input").focus();
            }
        };
        document.addEventListener("keydown", handleShortcut);
        return () => {
            document.removeEventListener("keydown", handleShortcut);
        };
    }, []);

    return (
        <div className="flex justify-between items-center bg-gray-100 rounded-lg">
            <div className="flex gap-2">
                <div className="relative">
                    <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2">
                        <svg className="fill-gray-500 dark:fill-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z" fill=""></path>
                        </svg>
                    </span>
                    <input 
                        id="search-input" 
                        type="text" 
                        placeholder="Search or type command..." 
                        className="shadow-xs focus:border-blue-300 focus:ring-blue-500/10 h-11 w-full rounded-lg bg-transparent py-2.5 pr-14 pl-12 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden xl:w-[430px]"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        autoComplete="off"
                    />
                    <button id="search-button" className="absolute top-1/2 right-2.5 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-xs -tracking-[0.2px] text-gray-500 hover:border-gray-200">
                        <span> ⌘ </span>
                        <span> F </span>
                    </button>
                </div>
            </div>
        </div>
    )
}