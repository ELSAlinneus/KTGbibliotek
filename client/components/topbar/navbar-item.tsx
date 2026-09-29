'use client'
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NavbarItem({ title, href }: { title: string, href: string }) {
    const router = useRouter();
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        router.push(href);
    }
    return (
        <Link href={href} className="text-white" onClick={handleClick}>
            {title}
        </Link>
    );
}