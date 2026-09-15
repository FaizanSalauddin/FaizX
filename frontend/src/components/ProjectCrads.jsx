// src/components/ProjectCards.jsx
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

// Convert "08/2026" or "12/2025 - 02/2026" → "August 2026" / "December 2025 – February 2026"
function formatDate(dateStr) {
    if (!dateStr) return "";

    const MONTHS = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];

    const convertOne = (part) => {
        const [mm, yyyy] = part.split("/").map((s) => s.trim());
        const m = parseInt(mm, 10);
        if (isNaN(m) || m < 1 || m > 12 || !yyyy) return part;
        return `${MONTHS[m - 1]} ${yyyy}`;
    };

    if (dateStr.includes("-")) {
        return dateStr
            .split("-")
            .map((s) => convertOne(s.trim()))
            .join(" – ");
    }

    return convertOne(dateStr);
}

function ProjectCards() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const res = await fetch(`${API_URL}/candidate`);
                if (!res.ok) throw new Error("Failed to load projects.");

                const data = await res.json();
                if (cancelled) return;

                const mapped = (data.projects || []).map((p) => ({
                    name: p.name,
                    type: p.type,
                    date: formatDate(p.date || ""),
                    url: p.url,
                    stack: p.tech_stack || [],
                    intro: p.intro || p.description || "",
                    features: p.features || [],
                }));

                setProjects(mapped);
            } catch (err) {
                console.error("Project load error:", err);
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, []);

    // ==========================================
    // LOADING
    // ==========================================
    if (loading) {
        return (
            <div className="flex items-center gap-3">
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#d4af37]/25 bg-black">
                    <img
                        src="/logo.png"
                        alt="AI"
                        className="h-full w-full object-cover mix-blend-screen"
                    />
                </div>

                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-[#d4af37]/10 bg-white/[0.025] px-4 py-3.5">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d4af37]/20 border-t-[#d4af37]" />
                    <span className="text-[12px] text-[#b9b2a5]">
                        Loading projects…
                    </span>
                </div>
            </div>
        );
    }

    // ==========================================
    // ERROR
    // ==========================================
    if (error) {
        return (
            <div className="flex items-center gap-2.5">
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#d4af37]/25 bg-black">
                    <img
                        src="/logo.png"
                        alt="AI"
                        className="h-full w-full object-cover mix-blend-screen"
                    />
                </div>
                <p className="text-[13px] text-[#b95b5b]">
                    ❌ Could not load projects: {error}
                </p>
            </div>
        );
    }

    // ==========================================
    // EMPTY
    // ==========================================
    if (projects.length === 0) {
        return (
            <div className="flex items-center gap-2.5">
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#d4af37]/25 bg-black">
                    <img
                        src="/logo.png"
                        alt="AI"
                        className="h-full w-full object-cover mix-blend-screen"
                    />
                </div>
                <p className="text-[13px] text-[#a99f8a]">
                    No projects to show.
                </p>
            </div>
        );
    }

    // ==========================================
    // LOADED
    // ==========================================
    return (
        <div className="flex flex-col gap-4">
            {/* Intro line */}
            <div className="flex items-center gap-2.5">
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#d4af37]/25 bg-black">
                    <img
                        src="/logo.png"
                        alt="AI"
                        className="h-full w-full object-cover mix-blend-screen"
                    />
                </div>

                <p className="text-[13px] text-[#a99f8a]">
                    Here are the {projects.length} full-stack projects Faizan has built.
                </p>
            </div>

            {/* Cards */}
            {projects.map((project) => (
                <div
                    key={project.name}
                    className="
                        group relative overflow-hidden
                        rounded-2xl border border-[#d4af37]/15
                        bg-gradient-to-br from-[#0c0c0c] to-[#080808]
                        p-4 transition-all duration-300
                        hover:border-[#d4af37]/35
                        hover:shadow-[0_18px_50px_-18px_rgba(212,175,55,0.28)]
                        sm:p-5
                    "
                >
                    {/* Subtle glow */}
                    <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#d4af37]/[0.07] blur-3xl" />

                    {/* Header row */}
                    <div className="relative mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="truncate text-[15px] font-semibold text-[#f5f2e8] sm:text-[16px]">
                                {project.name}
                            </h3>

                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#827b6d]">
                                <span>{project.type}</span>
                                {project.date && (
                                    <>
                                        <span className="text-[#3d3a34]">•</span>
                                        <span>{project.date}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {project.url && (
                            <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="
                                    flex h-8 shrink-0 items-center gap-1.5
                                    rounded-lg border border-[#d4af37]/30
                                    bg-[#d4af37]/[0.08] px-2.5
                                    text-[11px] font-medium text-[#f0d66b]
                                    transition-all
                                    hover:border-[#d4af37]/60
                                    hover:bg-[#d4af37]/[0.16]
                                    active:scale-95
                                "
                            >
                                <span>Live</span>
                                <svg
                                    width="11"
                                    height="11"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M7 17L17 7" />
                                    <path d="M7 7h10v10" />
                                </svg>
                            </a>
                        )}
                    </div>

                    {/* Intro */}
                    {project.intro && (
                        <p className="relative mb-3 text-[12.5px] leading-relaxed text-[#b9b2a5]">
                            {project.intro}
                        </p>
                    )}

                    {/* Tech stack */}
                    {project.stack.length > 0 && (
                        <div className="relative mb-3 flex flex-wrap gap-1.5">
                            {project.stack.map((tech) => (
                                <span
                                    key={tech}
                                    className="
                                        rounded-md border border-[#d4af37]/15
                                        bg-[#d4af37]/[0.05]
                                        px-2 py-0.5
                                        text-[10.5px] font-medium text-[#d4c98a]
                                    "
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Features */}
                    {project.features.length > 0 && (
                        <div className="relative">
                            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#827b6d]">
                                Key Features
                            </p>

                            <ul className="space-y-1">
                                {project.features.map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-start gap-2 text-[12px] leading-relaxed text-[#cfc7b6]"
                                    >
                                        <span className="mt-[2px] text-[#d4af37]">▸</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default ProjectCards;