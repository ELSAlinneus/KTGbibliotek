type AdminInfoBadgeProps = {
    onClose: () => void;
};

export default function AdminInfoBadge({ onClose }: AdminInfoBadgeProps) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-blue-400/40 bg-blue-950/50 px-4 py-3 text-sm text-blue-100">
            <span>
                <i className="fa-solid fa-circle-info mr-2" aria-hidden="true" />
                Du är inloggad som admin och kan redigera startsidans innehåll.
            </span>
            <button
                type="button"
                onClick={onClose}
                className="ml-4 rounded p-1 text-blue-200 hover:bg-blue-900"
                aria-label="Dölj admininformationen"
            >
                <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
        </div>
    );
}
