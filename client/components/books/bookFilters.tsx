import { Book } from "@/lib/types/Book";
import { PublicUserProfile } from "@/lib/types/Profile";
import Searchbar from "@/components/books/searchbar";

export type BookFilterValues = {
    searchQuery: string;
    language: string;
    owner: string;
    custody: string;
    status: string;
};

type BookFiltersProps = {
    books: Book[];
    users: PublicUserProfile[];
    values: BookFilterValues;
    onChange: (values: BookFilterValues) => void;
};

export default function BookFilters({ books, users, values, onChange }: BookFiltersProps) {
    const languages = Array.from(new Set(books.map((book) => book.Language).filter(Boolean))).sort();
    const hasActiveFilters = Object.values(values).some(Boolean);
    const updateFilter = (key: keyof BookFilterValues, value: string) => {
        onChange({ ...values, [key]: value });
    };

    return (
        <section className="mx-4 mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm mt-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Sök och filtrera</h2>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={() => onChange({ searchQuery: "", language: "", owner: "", custody: "", status: "" })}
                        className="text-sm font-medium text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900"
                    >
                        Rensa filter
                    </button>
                )}
            </div>
            <Searchbar
                onSearch={(searchQuery) => updateFilter("searchQuery", searchQuery)}
                placeholder="Sök efter titel, författare eller ISBN..."
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <label className="grid gap-1 text-sm font-medium text-slate-600">
                    Språk
                    <select
                        value={values.language}
                        onChange={(event) => updateFilter("language", event.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                        <option value="">Alla språk</option>
                        {languages.map((language) => <option key={language} value={language}>{language}</option>)}
                    </select>
                </label>
                <label className="grid gap-1 text-sm font-medium text-slate-600">
                    Ägare
                    <select
                        value={values.owner}
                        onChange={(event) => updateFilter("owner", event.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                        <option value="">Alla ägare</option>
                        {users.map((user) => <option key={user.userId} value={user.userId}>{user.displayName}</option>)}
                    </select>
                </label>
                <label className="grid gap-1 text-sm font-medium text-slate-600">
                    Nuvarande innehavare
                    <select
                        value={values.custody}
                        onChange={(event) => updateFilter("custody", event.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                        <option value="">Alla innehavare</option>
                        {users.map((user) => <option key={user.userId} value={user.userId}>{user.displayName}</option>)}
                    </select>
                </label>
                <label className="grid gap-1 text-sm font-medium text-slate-600">
                    Status
                    <select
                        value={values.status}
                        onChange={(event) => updateFilter("status", event.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                        <option value="">Alla statusar</option>
                        <option value="available">Tillgänglig</option>
                        <option value="borrowed">Utlånad</option>
                    </select>
                </label>
            </div>
        </section>
    );
}