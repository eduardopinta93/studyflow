"use client"
import Link from 'next/link';
import {usePathname} from 'next/navigation';

const navigationLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/courses', label: 'Courses' },
    { href: '/assignments', label: 'Assignments' },
];

export default function Navigation() {
    const pathname = usePathname();
    return (
        <nav aria-label="Main navigation">
            <ul>
                {navigationLinks.map((link) => (
                    <li key={link.href}>
                        <Link href={link.href} className={pathname === link.href ? "active" : "hover"}>
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}