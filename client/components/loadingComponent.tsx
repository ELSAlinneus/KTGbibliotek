export default function LoadingComponent() {
    return (
        <div className="mt-30 flex h-full w-full items-center justify-center">
            <div className=" h-16 w-16 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        </div>
    );
}