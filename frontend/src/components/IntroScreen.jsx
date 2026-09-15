import { useEffect, useState } from "react";

const BRAND = "FaizX";

function IntroScreen({ onFinish }) {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const welcomeDelay = 250;
        const lettersStart = welcomeDelay + 700;
        const LETTER_DELAY = 240;
        const LETTER_DURATION = 800;
        const lettersTotal = BRAND.length * LETTER_DELAY + LETTER_DURATION;

        const lettersDone = lettersStart + lettersTotal + 300;
        const taglineDelay = lettersDone + 600;
        const fadeDelay = taglineDelay + 3000;
        const finishDelay = fadeDelay + 800;

        const t0 = setTimeout(() => setStep(1), welcomeDelay);
        const t1 = setTimeout(() => setStep(2), lettersStart);
        const t2 = setTimeout(() => setStep(3), taglineDelay);
        const t3 = setTimeout(() => setStep(4), fadeDelay);
        const t4 = setTimeout(() => onFinish?.(), finishDelay);

        return () => {
            clearTimeout(t0);
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
        };
    }, [onFinish]);

    return (
        <div
            className={`
                fixed inset-0 z-[9999] flex items-center justify-center
                bg-[#050505] overflow-hidden
                transition-opacity duration-700 ease-out
                ${step >= 4 ? "opacity-0 pointer-events-none" : "opacity-100"}
            `}
        >
            {/* ── NEW BACKGROUND ANIMATION: GEOMETRIC MESH & ORBITS ── */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {/* Rotating Geometric Ring 1 */}
                <div
                    className="
                        absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                        h-[650px] w-[650px] rounded-full
                        border border-[#d4af37]/[0.12]
                        shadow-[0_0_50px_rgba(212,175,55,0.03)]
                        animate-spin-slow
                    "
                >
                    <div className="absolute top-0 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#d4af37]/40 blur-[1px]" />
                    <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#991b1b]/50 blur-[1px]" />
                </div>

                {/* Rotating Geometric Ring 2 (Counter-rotation) */}
                <div
                    className="
                        absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                        h-[420px] w-[420px] rounded-full
                        border border-dashed border-[#d4af37]/[0.15]
                        animate-reverse-spin
                    "
                />

                {/* Floating Gold Dust Particles */}
                <div className="absolute inset-0">
                    <div className="absolute top-[20%] left-[25%] h-1.5 w-1.5 rounded-full bg-[#d4af37]/60 blur-[0.5px] animate-float-1" />
                    <div className="absolute top-[65%] left-[15%] h-2 w-2 rounded-full bg-[#d4af37]/40 blur-[1px] animate-float-2" />
                    <div className="absolute top-[30%] right-[20%] h-1 w-1 rounded-full bg-[#f5d76e]/70 blur-[0.5px] animate-float-3" />
                    <div className="absolute top-[75%] right-[25%] h-2.5 w-2.5 rounded-full bg-[#991b1b]/50 blur-[1px] animate-float-1" />
                </div>

                {/* Radial Glow Anchor */}
                <div
                    className="
                        absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                        h-[500px] w-[500px] rounded-full
                        bg-radial from-[#d4af37]/[0.08] via-transparent to-transparent
                        blur-[80px] animate-pulse-glow
                    "
                />
            </div>

            {/* PERSPECTIVE GRID BACKGROUND */}
            <div
                className="
                    pointer-events-none absolute inset-0
                    opacity-[0.07]
                    [background-image:linear-gradient(#d4af37_1px,transparent_1px),linear-gradient(90deg,#d4af37_1px,transparent_1px)]
                    [background-size:50px_50px]
                    [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]
                    animate-grid-drift
                "
            />

            {/* SCAN LINE */}
            {step >= 2 && (
                <div
                    className="
                        pointer-events-none absolute inset-x-0 h-[2px]
                        bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent
                        shadow-[0_0_24px_rgba(212,175,55,0.6)]
                        animate-scan
                    "
                />
            )}

            {/* CONTENT */}
            <div className="relative z-10 flex flex-col items-center px-6 text-center">

                {/* ── WELCOME TO (top) ── */}
                <p
                    className={`
                        font-[Rajdhani]
                        mb-3
                        text-[13px] uppercase tracking-[0.5em]
                        text-[#827b6d]
                        transition-all duration-1000 ease-out
                        sm:text-[14px]
                        ${step >= 1
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-3"
                        }
                    `}
                >
                    Welcome to
                </p>

                {/* ── BRAND LETTERS (right → in) ── */}
                <h1
                    className="
                        font-[Orbitron]
                        text-[64px] leading-none tracking-[0.08em]
                        sm:text-[88px] md:text-[112px]
                        select-none
                    "
                >
                    {BRAND.split("").map((letter, i) => (
                        <span
                            key={i}
                            className={`
                                inline-block
                                bg-gradient-to-b
                                from-[#fff8dc]
                                via-[#f5d76e]
                                to-[#d4af37]
                                bg-clip-text text-transparent
                                drop-shadow-[0_0_28px_rgba(212,175,55,0.35)]
                                will-change-transform
                                ${step >= 2
                                    ? "animate-letter-snap"
                                    : "opacity-0 translate-x-24 blur-md scale-90"
                                }
                            `}
                            style={{
                                animationDelay: `${i * 240}ms`,
                            }}
                        >
                            {letter}
                        </span>
                    ))}
                </h1>

                {/* ── UNDERLINE ── */}
                <div
                    className={`
                        mt-5 h-[2px]
                        bg-gradient-to-r from-transparent via-[#d4af37] to-transparent
                        shadow-[0_0_18px_rgba(212,175,55,0.7)]
                        transition-all duration-1000 ease-out
                        ${step >= 3 ? "w-[280px] opacity-100" : "w-0 opacity-0"}
                        sm:w-[380px]
                    `}
                />

                {/* ── TAGLINE (bigger font) ── */}
                <p
                    className={`
                        mt-9 max-w-3xl
                        font-[Rajdhani]
                        text-[18px] leading-relaxed
                        tracking-wide
                        text-[#b9b2a5]
                        transition-all duration-1000 ease-out
                        sm:text-[21px] md:text-[23px]
                        ${step >= 3
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4"
                        }
                    `}
                >
                    <span className="text-[#827b6d]">AI assistant of </span>
                    <span className="font-semibold text-[#f5f2e8]">
                        Faizan Salauddin
                    </span>
                </p>

                {/* ── QUOTE (bigger font) ── */}
                <p
                    className={`
                        mt-5 max-w-2xl
                        font-[Rajdhani]
                        text-[15px] leading-relaxed
                        text-[#8d8576] italic
                        transition-all duration-1000 ease-out
                        sm:text-[17px] md:text-[18px]
                        ${step >= 3
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4"
                        }
                    `}
                    style={{ transitionDelay: "200ms" }}
                >
                    “Ask me about Faizan's skills, projects, experience,
                    or check his fit for a job.”
                </p>
            </div>

            {/* INLINE KEYFRAMES */}
            <style>{`
                @keyframes scan {
                    0%   { top: -10%; opacity: 0; }
                    10%  { opacity: 1; }
                    90%  { opacity: 1; }
                    100% { top: 110%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 2.4s ease-in-out infinite;
                }

                /* Background Animations */
                @keyframes spin-slow {
                    0%   { transform: translate(-50%, -50%) rotate(0deg); }
                    100% { transform: translate(-50%, -50%) rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 25s linear infinite;
                }

                @keyframes reverse-spin {
                    0%   { transform: translate(-50%, -50%) rotate(360deg); }
                    100% { transform: translate(-50%, -50%) rotate(0deg); }
                }
                .animate-reverse-spin {
                    animation: reverse-spin 35s linear infinite;
                }

                @keyframes float-1 {
                    0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
                    50%      { transform: translateY(-25px) translateX(15px); opacity: 0.8; }
                }
                .animate-float-1 {
                    animation: float-1 6s ease-in-out infinite;
                }

                @keyframes float-2 {
                    0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.2; }
                    50%      { transform: translateY(-35px) translateX(-20px); opacity: 0.7; }
                }
                .animate-float-2 {
                    animation: float-2 8s ease-in-out infinite;
                }

                @keyframes float-3 {
                    0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
                    50%      { transform: translateY(-18px) translateX(-12px); opacity: 0.9; }
                }
                .animate-float-3 {
                    animation: float-3 5s ease-in-out infinite;
                }

                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
                    50%      { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
                }
                .animate-pulse-glow {
                    animation: pulse-glow 5s ease-in-out infinite;
                }

                @keyframes grid-drift {
                    0%   { transform: translateY(0px); }
                    100% { transform: translateY(50px); }
                }
                .animate-grid-drift {
                    animation: grid-drift 12s linear infinite;
                }

                /* Letter Animations */
                @keyframes letter-snap {
                    0% {
                        opacity: 0;
                        transform: translateX(90px) scale(0.85);
                        filter: blur(10px);
                    }
                    55% {
                        opacity: 1;
                        transform: translateX(-6px) scale(1.08);
                        filter: blur(0px);
                    }
                    75% {
                        transform: translateX(2px) scale(0.98);
                    }
                    100% {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                        filter: blur(0px);
                    }
                }
                .animate-letter-snap {
                    animation:
                        letter-snap 800ms cubic-bezier(0.22, 1, 0.36, 1) both,
                        letter-glow 1.4s ease-out 800ms both;
                }

                @keyframes letter-glow {
                    0%   { text-shadow: 0 0 0 rgba(212,175,55,0); }
                    50%  { text-shadow: 0 0 22px rgba(212,175,55,0.55); }
                    100% { text-shadow: 0 0 8px rgba(212,175,55,0.25); }
                }
            `}</style>
        </div>
    );
}

export default IntroScreen;