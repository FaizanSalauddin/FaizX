// src/components/EducationCards.jsx
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function EducationCards() {
    const [education, setEducation] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const res = await fetch(`${API_URL}/candidate`);
                if (!res.ok) throw new Error("Failed to load education.");

                const data = await res.json();
                if (cancelled) return;

                setEducation(data.education || []);
            } catch (err) {
                console.error("Education load error:", err);
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
                        Loading education…
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
                    ❌ Could not load education: {error}
                </p>
            </div>
        );
    }

    if (education.length === 0) {
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
                    No education details available.
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
                    Here is Faizan&apos;s academic background.
                </p>
            </div>

            {/* Timeline */}
            <div className="relative pl-6">
                {/* Vertical line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-[#d4af37]/40 via-[#d4af37]/20 to-transparent" />

                <div className="flex flex-col gap-4">
                    {education.map((edu, index) => {
                        // normalise possible field names
                        const title =
                            edu.degree || edu.qualification || "Qualification";
                        const institution = edu.institution || "";
                        const duration =
                            edu.duration || edu.year || "";
                        const score = edu.cgpa
                            ? `CGPA: ${edu.cgpa}`
                            : edu.percentage
                                ? `Percentage: ${edu.percentage}`
                                : "";

                        const isCurrent = /ongoing|present/i.test(duration);

                        return (
                            <div
                                key={index}
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
                                {/* Glow */}
                                <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#d4af37]/[0.07] blur-3xl" />

                                {/* Timeline dot */}
                                <div className="absolute -left-[26px] top-6 flex h-4 w-4 items-center justify-center">
                                    <span className="absolute h-4 w-4 animate-ping rounded-full bg-[#d4af37]/30" />
                                    <span className="relative h-2.5 w-2.5 rounded-full bg-[#d4af37] shadow-[0_0_10px_#d4af37]" />
                                </div>

                                {/* Header */}
                                <div className="relative mb-2 flex flex-wrap items-center justify-between gap-2">
                                    <h3 className="text-[14.5px] font-semibold text-[#f5f2e8] sm:text-[15.5px]">
                                        {title}
                                    </h3>

                                    {isCurrent && (
                                        <span className="rounded-full border border-[#d4af37]/35 bg-[#d4af37]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#f5d76e]">
                                            Ongoing
                                        </span>
                                    )}
                                </div>

                                {/* Institution + duration */}
                                <div className="relative mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#a99f8a]">
                                    <span className="font-medium text-[#cfc7b6]">
                                        {institution}
                                    </span>
                                    {duration && (
                                        <>
                                            <span className="text-[#3d3a34]">•</span>
                                            <span>{duration}</span>
                                        </>
                                    )}
                                </div>

                                {/* Score badge */}
                                {score && (
                                    <div className="relative inline-flex items-center gap-1.5 rounded-md border border-[#d4af37]/20 bg-[#d4af37]/[0.06] px-2.5 py-1 text-[11.5px] font-medium text-[#d4c98a]">
                                        <svg
                                            width="11"
                                            height="11"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-[#d4af37]"
                                        >
                                            <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z" />
                                        </svg>
                                        {score}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default EducationCards;