'use client'
import { useRouter } from "next/navigation";

export default function NavbarItem({ title, href }: { title: string, href: string }) {
    const router = useRouter();
    const handleClick = (e: any) => {
        e.preventDefault();
        router.push(href);
    }
    return (
        <a href={href} className="text-white" onClick={handleClick}>{title}</a>
    );
}