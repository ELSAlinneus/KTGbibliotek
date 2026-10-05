export default function AdminInfoBadge() {
    return (
        <div className="fixed bottom-4 right-4 z-[60] rounded-lg border border-red-400/50 bg-red-950/90 p-3 text-red-100 shadow-lg display flex items-center ">
            <i className="fa-solid fa-circle-info mr-2" aria-hidden="true" />
            <p className="text-sm font-medium">Du är inloggad som administratör.</p>
        </div>
    );
}
