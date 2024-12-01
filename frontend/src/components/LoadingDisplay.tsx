import { ThemeProvider } from "./Theming/ThemeProvider";

export default function LoadingDisplay() {
    return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <div className="w-screen h-screen flex flex-row justify-center items-center dark:bg-slate-800 bg-muted">
            <div className="w-[200px] h-[200px] rounded-md bg-background shadow-2xl flex flex-row justify-center items-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        </div>
    </ThemeProvider>
    );
}
