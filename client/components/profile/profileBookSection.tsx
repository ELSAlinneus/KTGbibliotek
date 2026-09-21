import { ReactNode } from "react";

type ProfileBookSectionProps = {
    title: string;
    children: ReactNode;
};

export default function ProfileBookSection({ title, children }: ProfileBookSectionProps) {
    return (
        <section className="mb-4 ml-10 mr-10 mt-4 rounded-lg border border-slate-700 bg-slate-800 p-4">
            <h2 className="font-bold">{title}</h2>
            <div className="mt-2 space-y-2">{children}</div>
        </section>
    );
}
