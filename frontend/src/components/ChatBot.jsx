import {
    useEffect,
    useRef,
    useState,
} from "react";

import ChatMessage from "./ChatMessage";

const API_URL = import.meta.env.VITE_API_URL;

const STORAGE_KEY = "portfolio_chat";
const SESSION_KEY = "portfolio_session_id";

function ChatBot() {

    // =========================================
    // MESSAGES (persisted)
    // =========================================

    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error("Failed to load saved messages:", error);
            return [];
        }
    });


    // =========================================
    // INPUT / UI STATE
    // =========================================

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const [jdLoading, setJdLoading] = useState(false);
    const [jdFile, setJdFile] = useState(null);
    const [jdMessage, setJdMessage] = useState("");


    // =========================================
    // SESSION ID (persisted)
    // =========================================

    const [sessionId] = useState(() => {
        const existing = localStorage.getItem(SESSION_KEY);
        if (existing) return existing;

        const fresh = crypto.randomUUID();
        localStorage.setItem(SESSION_KEY, fresh);
        return fresh;
    });


    // =========================================
    // REFS
    // =========================================

    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);


    // =========================================
    // PERSIST MESSAGES
    // =========================================

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        } catch (error) {
            console.error("Failed to save messages:", error);
        }
    }, [messages]);


    // =========================================
    // AUTO-SCROLL TO BOTTOM
    // =========================================

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading, jdLoading]);


    // =========================================
    // AUTO-GROW TEXTAREA (up to ~5 lines)
    // =========================================

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;

        el.style.height = "auto";
        const maxHeight = 160; // ~5 lines
        el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
    }, [input]);


    // =========================================
    // NAVBAR ACTIONS
    // =========================================

    const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL;

    const handleContact = () => {
        if (!CONTACT_EMAIL) {
            console.error("VITE_CONTACT_EMAIL is not set in .env");
            return;
        }

        const subject = "Opportunity for You — Interested after reviewing your profile";

        const body = `Hi Faizan,

I came across your AI portfolio and reviewed your profile. I'm interested in discussing an opportunity with you.

Role / Position:
Company:
Location (or Remote):
Brief about the role:

Looking forward to hearing from you.

Best regards,
`;

        const mailto =
            `mailto:${CONTACT_EMAIL}` +
            `?subject=${encodeURIComponent(subject)}` +
            `&body=${encodeURIComponent(body)}`;

        window.location.href = mailto;
    };

    const handleResumeDownload = () => {
        const link = document.createElement("a");
        link.href = "/resume.pdf";
        link.download = "Faizan-Salauddin-Resume.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    // =========================================
    // FORMAT JD RESULT (markdown for chat)
    // =========================================

    const formatJdResult = (result) => {
        if (!result) return "Unable to generate job suitability result.";

        const matched = Array.isArray(result.matched_requirements)
            ? result.matched_requirements
            : [];

        const missing = Array.isArray(result.missing_requirements)
            ? result.missing_requirements
            : [];

        const evidence = Array.isArray(result.evidence)
            ? result.evidence
            : [];

        const eligible = result.eligible || "Unknown";

        const eligibleEmoji =
            eligible === "Yes" ? "✅" :
                eligible === "Partially" ? "🟡" :
                    eligible === "No" ? "❌" : "❔";

        return `## Job Match Analysis

**Eligibility: ${eligibleEmoji} ${eligible}**

**Score: ${result.score}/100**

**Suitability: ${result.suitability}**

${result.summary || ""}

### Matched Requirements

${matched.length
                ? matched.map((item) => `- ${item}`).join("\n")
                : "- No direct matches found."
            }

### Missing Requirements

${missing.length
                ? missing.map((item) => `- ${item}`).join("\n")
                : "- No major missing requirements found."
            }

### Evidence From Faizan's Profile

${evidence.length
                ? evidence.map((item) => `- ${item}`).join("\n")
                : "- No supporting evidence found."
            }

### Recommendation

${result.recommendation || ""}
`;
    };


    // =========================================
    // JD FILE UPLOAD
    // =========================================

    const handleJobDescriptionUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const allowedExtensions = [".pdf", ".docx", ".txt"];
        const extension = "." + file.name.split(".").pop().toLowerCase();

        if (!allowedExtensions.includes(extension)) {
            setJdMessage("Please upload a PDF, DOCX or TXT file.");
            setJdFile(null);
            event.target.value = "";
            return;
        }

        setJdFile(file);
        setJdLoading(true);
        setJdMessage(`Analyzing ${file.name}...`);

        try {
            const formData = new FormData();
            formData.append("session_id", sessionId);
            formData.append("file", file);

            const response = await fetch(`${API_URL}/match-jd`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.detail || "Failed to analyze job description.");
            }

            setJdMessage(`✓ ${file.name} analyzed successfully`);

            setMessages((previous) => [
                ...previous,
                {
                    role: "user",
                    content: `📄 Uploaded Job Description: ${file.name}`,
                },
                {
                    role: "assistant",
                    content: formatJdResult(data.match),
                },
            ]);

        } catch (error) {
            console.error("JD upload error:", error);
            setJdMessage(error.message || "Failed to analyze job description.");
            setJdFile(null);

            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    content: `❌ ${error.message || "Failed to analyze the job description."}`,
                },
            ]);
        } finally {
            setJdLoading(false);
            event.target.value = "";
        }
    };


    // =========================================
    // DETECT PASTED JD
    // =========================================

    const isLikelyJobDescription = (text) => {
        if (text.length < 250) return false;

        const signals = [
            /job description/i,
            /responsibilities/i,
            /requirements/i,
            /qualifications/i,
            /required skills/i,
            /preferred skills/i,
            /must have/i,
            /nice to have/i,
            /experience required/i,
            /we are looking for/i,
            /what you'?ll do/i,
            /what you will do/i,
            /skills required/i,
            /education requirements/i,
            /years of experience/i,
            /candidate should/i,
        ];

        const matchedSignals = signals.filter((regex) => regex.test(text)).length;

        return (
            matchedSignals >= 3 ||
            (text.length >= 500 && matchedSignals >= 2)
        );
    };


    // =========================================
    // DETECT PROJECTS REQUEST
    // =========================================

    const isProjectsRequest = (text) => {
        const t = text.toLowerCase().trim();

        const mentionsProjects =
            /\bprojects?\b/.test(t) ||
            /\bproject'?s\b/.test(t) ||
            /ashmir\s*mocktail/.test(t) ||
            /al[-\s]?ansar/.test(t) ||
            /thread\s*store/.test(t);

        if (!mentionsProjects) return false;

        const looksLikeJd =
            t.length >= 250 &&
            /(job description|responsibilities|requirements|qualifications|we are looking for|what you'?ll do|skills required)/i.test(t);

        if (looksLikeJd) return false;

        const askingPhrases = [
            /\b(show|tell|list|what|which|about|explain|give|see|view|display|built|made|worked\s+on|walk\s+me\s+through)\b/,
            /\b(of|by|from)\b/,
            /\b(bata|batao|dikha|dikhao|dikha\s*do|sunao|bata\s*do|kya|kaunse|kaun|kons|konse|hai|hain|ke\s*bare|ke\s*baare)\b/,
        ];

        const isAsking = askingPhrases.some((re) => re.test(t));

        return isAsking || t.split(" ").length <= 6;
    };


    // =========================================
    // DETECT EDUCATION REQUEST
    // =========================================

    const isEducationRequest = (text) => {
        const t = text.toLowerCase().trim();

        const mentionsEducation =
            /\beducation\b/.test(t) ||
            /\bstudy\b/.test(t) ||
            /\bstudies\b/.test(t) ||
            /\bacademic/.test(t) ||
            /\bcollege\b/.test(t) ||
            /\buniversity\b/.test(t) ||
            /\bdegree\b/.test(t) ||
            /\bqualification/.test(t) ||
            /heritage\s+institute/.test(t) ||
            /b\.?tech\b/.test(t) ||
            /class\s*(x|10|xii|12)/.test(t) ||
            /\bpadhai\b/.test(t) ||
            /\bshiksha\b/.test(t);

        if (!mentionsEducation) return false;

        if (
            t.length >= 250 &&
            /(job description|responsibilities|requirements|qualifications|we are looking for)/i.test(t)
        ) {
            return false;
        }

        return true;
    };


    // =========================================
    // SEND MESSAGE
    // =========================================

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput("");
        setLoading(true);

        // -------------------------------------
        // PROJECTS FLOW
        // -------------------------------------
        if (isProjectsRequest(userMessage)) {
            setMessages((previous) => [
                ...previous,
                { role: "user", content: userMessage },
                { role: "assistant", type: "projects", content: "" },
            ]);
            setLoading(false);
            return;
        }

        // -------------------------------------
        // EDUCATION FLOW   (moved OUT of JD check)
        // -------------------------------------
        if (isEducationRequest(userMessage)) {
            setMessages((previous) => [
                ...previous,
                { role: "user", content: userMessage },
                { role: "assistant", type: "education", content: "" },
            ]);
            setLoading(false);
            return;
        }

        // -------------------------------------
        // PASTED JD FLOW
        // -------------------------------------
        if (isLikelyJobDescription(userMessage)) {
            setMessages((previous) => [
                ...previous,
                { role: "user", content: userMessage },
                {
                    role: "assistant",
                    content: "Analyzing the job description and comparing it with Faizan's profile...",
                },
            ]);

            try {
                const response = await fetch(`${API_URL}/match-jd-text`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        session_id: sessionId,
                        job_description: userMessage,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.detail || "Failed to analyze job description.");
                }

                const formattedResult = formatJdResult(data.match);

                setMessages((previous) => {
                    const updated = [...previous];
                    updated[updated.length - 1] = {
                        role: "assistant",
                        content: formattedResult,
                    };
                    return updated;
                });

            } catch (error) {
                console.error("JD text analysis error:", error);

                setMessages((previous) => {
                    const updated = [...previous];
                    updated[updated.length - 1] = {
                        role: "assistant",
                        content:
                            error.message ||
                            "Something went wrong while analyzing the job description.",
                    };
                    return updated;
                });
            } finally {
                setLoading(false);
            }

            return;
        }

        // -------------------------------------
        // NORMAL CHAT FLOW
        // -------------------------------------

        setMessages((previous) => [
            ...previous,
            { role: "user", content: userMessage },
            { role: "assistant", content: "" },
        ]);

        try {
            const response = await fetch(`${API_URL}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: sessionId,
                    message: userMessage,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get response from server.");
            }

            if (!response.body) {
                throw new Error("Streaming is not supported by this browser.");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let assistantMessage = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                assistantMessage += chunk;

                setMessages((previous) => {
                    const updated = [...previous];
                    updated[updated.length - 1] = {
                        role: "assistant",
                        content: assistantMessage,
                    };
                    return updated;
                });
            }

        } catch (error) {
            console.error("Chat error:", error);

            setMessages((previous) => {
                const updated = [...previous];
                updated[updated.length - 1] = {
                    role: "assistant",
                    content: "Something went wrong. Please try again.",
                };
                return updated;
            });
        } finally {
            setLoading(false);
        }
    };


    // =========================================
    // ENTER KEY
    // =========================================

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };


    // =========================================
    // RENDER
    // =========================================

    return (
        <div
            className="
                relative
                flex
                h-[100dvh]
                w-full
                overflow-hidden
                bg-[#050505]
                text-[#e8e3d8]
                selection:bg-[#d4af37]/30 selection:text-[#fff8dc]
                antialiased
            "
        >

            {/* AMBIENT LIGHTING */}
            {/* AMBIENT LIGHTING — static, GPU-friendly */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                    className="absolute -left-[10%] -top-[15%] h-[580px] w-[580px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(212,175,55,0.10) 0%, rgba(212,175,55,0) 70%)",
                        transform: "translateZ(0)",
                    }}
                />
                <div
                    className="absolute -right-[10%] top-[25%] h-[620px] w-[620px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(153,27,27,0.08) 0%, rgba(153,27,27,0) 70%)",
                        transform: "translateZ(0)",
                    }}
                />
                <div
                    className="absolute -bottom-[15%] left-[25%] h-[520px] w-[520px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, rgba(212,175,55,0) 70%)",
                        transform: "translateZ(0)",
                    }}
                />

                {/* SUBTLE BACKGROUND GRID PATTERN */}
                <div
                    className="
            absolute inset-0 opacity-[0.035]
            [background-image:linear-gradient(#d4af37_1px,transparent_1px),linear-gradient(90deg,#d4af37_1px,transparent_1px)]
            [background-size:48px_48px]
            [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]
        "
                />
            </div>

            {/* MAIN */}
            <main className="relative z-10 flex min-w-0 flex-1 flex-col">

                {/* NAVBAR */}
                <header
                    className="
                        relative z-20 flex min-h-[64px] shrink-0
                        items-center justify-between gap-3
                        border-b border-[#d4af37]/15
                        bg-[#070708]/80 px-3.5 py-2.5
                        sm:px-6
                        md:min-h-[72px]
                    "
                >
                    {/* BRAND */}
                    <div className="flex min-w-0 shrink items-center gap-3">
                        <div
                            className="
                                group relative flex h-10 w-10 shrink-0
                                items-center justify-center
                                overflow-hidden rounded-xl
                                border border-[#d4af37]/30
                                bg-gradient-to-b from-black via-[#080808] to-[#121212]
                                shadow-[0_0_20px_rgba(212,175,55,0.15)]
                                transition-all duration-300
                                hover:border-[#d4af37]/50
                                hover:shadow-[0_0_25px_rgba(212,175,55,0.28)]
                                sm:h-11 sm:w-11
                            "
                        >
                            <div className="absolute inset-0 rounded-xl bg-[#d4af37]/15 blur-md transition-opacity duration-300 group-hover:opacity-100" />
                            <img
                                src="/logo.png"
                                alt="Faizan"
                                className="relative z-10 h-full w-full object-contain p-1 transition-transform duration-300 group-hover:scale-105 mix-blend-screen"
                            />
                        </div>

                        <div className="min-w-0">
                            <h1
                                className="
                                    max-w-[110px] truncate
                                    text-[16px] font-bold tracking-wider
                                    bg-gradient-to-r from-[#fff8dc] via-[#f5d76e] to-[#d4af37]
                                    bg-clip-text text-transparent
                                    drop-shadow-[0_0_12px_rgba(212,175,55,0.3)]
                                    sm:max-w-none sm:text-[18px]
                                "
                            >
                                FaizX
                            </h1>

                            <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-[#827b6d]">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d4af37] opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d4af37] shadow-[0_0_8px_#d4af37]" />
                                </span>
                                <span className="text-[#a39c8e]">Online</span>
                            </div>
                        </div>
                    </div>


                    {/* ACTIONS */}
                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-2.5">

                        <button
                            type="button"
                            onClick={handleContact}
                            title="Contact Faizan"
                            className="
                                flex h-9 items-center justify-center gap-1.5
                                rounded-xl border border-[#d4af37]/20
                                bg-[#d4af37]/[0.04] px-2.5
                                text-[12px] font-medium text-[#dcd5c7]
                                shadow-sm backdrop-blur-md
                                transition-all duration-200
                                hover:border-[#d4af37]/40
                                hover:bg-[#d4af37]/[0.1]
                                hover:text-[#fff8dc]
                                hover:shadow-[0_0_16px_rgba(212,175,55,0.15)]
                                active:scale-95
                                sm:h-9.5 sm:px-3 sm:text-[12.5px]
                                md:px-3.5
                            "
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-[#d4af37]"
                            >
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                            <span className="hidden sm:inline">Contact</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleResumeDownload}
                            title="Download Resume"
                            className="
                                flex h-9 items-center justify-center gap-1.5
                                rounded-xl border border-[#d4af37]/20
                                bg-[#d4af37]/[0.04] px-2.5
                                text-[12px] font-medium text-[#dcd5c7]
                                shadow-sm backdrop-blur-md
                                transition-all duration-200
                                hover:border-[#d4af37]/40
                                hover:bg-[#d4af37]/[0.1]
                                hover:text-[#fff8dc]
                                hover:shadow-[0_0_16px_rgba(212,175,55,0.15)]
                                active:scale-95
                                sm:h-9.5 sm:px-3 sm:text-[12.5px]
                                md:px-3.5
                            "
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-[#d4af37]"
                            >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>

                            <span className="hidden sm:inline">Resume</span>
                        </button>

                        <label
                            title="Upload Job Description"
                            className="
                                flex h-9 shrink-0 cursor-pointer
                                items-center justify-center gap-1.5
                                rounded-xl border border-[#d4af37]/35
                                bg-gradient-to-r from-[#d4af37]/15 via-[#d4af37]/10 to-[#8f1d1d]/15
                                px-2.5 text-[12px] font-semibold text-[#fce893]
                                shadow-[0_0_15px_rgba(212,175,55,0.1)] backdrop-blur-md
                                transition-all duration-200
                                hover:border-[#d4af37]/60
                                hover:bg-[#d4af37]/20
                                hover:text-[#ffffff]
                                hover:shadow-[0_0_20px_rgba(212,175,55,0.22)]
                                active:scale-95
                                sm:h-9.5 sm:px-3.5 sm:text-[12.5px]
                            "
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-[#f5d76e]"
                            >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>

                            <span>Upload JD</span>

                            <input
                                type="file"
                                accept=".pdf,.docx,.txt"
                                onChange={handleJobDescriptionUpload}
                                className="hidden"
                            />
                        </label>
                    </div>
                </header>


                {/* JD STATUS BAR */}
                {jdMessage && (
                    <div
                        className="
                            relative z-20 border-b border-[#d4af37]/20
                            bg-[#0a0a0c]/90 px-4 py-2 text-center
                            text-[11px] font-medium tracking-wide text-[#c4bcae] 
                            sm:px-6 sm:text-[12px]
                        "
                    >
                        <span className="break-all">{jdMessage}</span>
                        {jdFile && (
                            <span className="ml-2 font-semibold text-[#f5d76e]">● JD Ready</span>
                        )}
                    </div>
                )}


                {/* MESSAGES (scrollable) */}
                <section className="relative flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">

                    {messages.length === 0 && !jdLoading ? (
                        /* EMPTY / WELCOME */
                        <div className="flex min-h-full flex-col items-center justify-center px-5 py-10">

                            <div className="relative mb-6">
                                <div className="absolute inset-0 rounded-3xl bg-[#d4af37]/30 blur-[40px] animate-pulse-slow" />

                                <div
                                    className="
                                        relative flex h-24 w-24 items-center justify-center
                                        overflow-hidden rounded-2xl
                                        border border-[#d4af37]/40 bg-gradient-to-b from-black via-[#080808] to-[#121212]
                                        shadow-[0_15px_40px_-10px_rgba(212,175,55,0.3)]
                                    "
                                >
                                    <div className="absolute inset-0 z-10 bg-gradient-to-br from-[#d4af37]/20 via-transparent to-[#991b1b]/15" />
                                    <img
                                        src="/logo.png"
                                        alt="FS"
                                        className="absolute inset-0 h-full w-full object-cover p-1.5 mix-blend-screen"
                                    />
                                </div>
                            </div>

                            <h2
                                className="
                                    relative mb-2 text-center
                                    text-[32px] font-extrabold leading-tight
                                    tracking-tight
                                    sm:text-4xl md:text-5xl
                                "
                            >
                                <span className="pointer-events-none absolute inset-x-8 top-1/2 -z-10 h-16 -translate-y-1/2 rounded-full bg-[#d4af37]/15 blur-3xl" />

                                <span className="block bg-gradient-to-r from-[#ffffff] via-[#f5d76e] to-[#d4af37] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(212,175,55,0.25)]">
                                    Hi, I&apos;m FaizX
                                </span>
                            </h2>

                            <p className="mb-3 text-center text-[12px] font-semibold uppercase tracking-[0.4em] text-[#9a9180] sm:text-[13px]">
                                Faizan&apos;s AI Assistant
                            </p>

                            <p className="mb-8 max-w-md text-center text-[10px] leading-relaxed text-[#a8a192] sm:text-[15px]">
                                Ask me about Faizan&apos;s skills, projects, experience, or check his fit for a job by uploading or pasting job descriptions.
                            </p>

                            <div className="grid w-full max-w-md grid-cols-1 gap-2.5 sm:grid-cols-2">

                                <button
                                    className="
                                        group flex items-center gap-3 rounded-2xl
                                        border border-[#d4af37]/15 bg-white/[0.02]
                                        p-3 text-left text-[13px] font-medium text-[#dcd5c7]
                                        shadow-sm backdrop-blur-md
                                        transition-all duration-300
                                        hover:-translate-y-0.5
                                        hover:border-[#d4af37]/35
                                        hover:bg-[#d4af37]/[0.06]
                                        hover:text-[#fff8dc]
                                        hover:shadow-[0_12px_30px_-10px_rgba(212,175,55,0.22)]
                                        active:translate-y-0
                                        sm:col-span-2
                                    "
                                    onClick={() => setInput("Tell me about Faizan's projects")}
                                >
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/10 text-[13px] text-[#d4af37] transition-transform duration-300 group-hover:scale-110">
                                        ◈
                                    </span>
                                    <span className="flex-1">Tell me about Faizan&apos;s projects</span>
                                    <span className="text-[13px] text-[#6b6457] transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#d4af37]">
                                        →
                                    </span>
                                </button>

                                <button
                                    className="
                                        group flex items-center gap-3 rounded-2xl
                                        border border-[#d4af37]/15 bg-white/[0.02]
                                        p-3 text-left text-[13px] font-medium text-[#dcd5c7]
                                        shadow-sm backdrop-blur-md
                                        transition-all duration-300
                                        hover:-translate-y-0.5
                                        hover:border-[#d4af37]/35
                                        hover:bg-[#d4af37]/[0.06]
                                        hover:text-[#fff8dc]
                                        hover:shadow-[0_12px_30px_-10px_rgba(212,175,55,0.22)]
                                        active:translate-y-0
                                    "
                                    onClick={() => setInput("What are Faizan's technical skills?")}
                                >
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/10 text-[13px] text-[#f5d76e] transition-transform duration-300 group-hover:scale-110">
                                        ⚡
                                    </span>
                                    <span className="flex-1">Technical skills</span>
                                    <span className="text-[13px] text-[#6b6457] transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#d4af37]">
                                        →
                                    </span>
                                </button>

                                <button
                                    className="
                                        group flex items-center gap-3 rounded-2xl
                                        border border-[#d4af37]/15 bg-white/[0.02]
                                        p-3 text-left text-[13px] font-medium text-[#dcd5c7]
                                        shadow-sm backdrop-blur-md
                                        transition-all duration-300
                                        hover:-translate-y-0.5
                                        hover:border-[#d4af37]/35
                                        hover:bg-[#d4af37]/[0.06]
                                        hover:text-[#fff8dc]
                                        hover:shadow-[0_12px_30px_-10px_rgba(212,175,55,0.22)]
                                        active:translate-y-0
                                    "
                                    onClick={() => setInput("Tell me about Faizan's education")}
                                >
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/10 text-[13px] text-[#f5d76e] transition-transform duration-300 group-hover:scale-110">
                                        ✦
                                    </span>
                                    <span className="flex-1">Education</span>
                                    <span className="text-[13px] text-[#6b6457] transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#d4af37]">
                                        →
                                    </span>
                                </button>

                            </div>
                        </div>

                    ) : (
                        /* CHAT MESSAGES */
                        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">

                            {messages.map((message, index) => (
                                <ChatMessage key={index} message={message} />
                            ))}

                            {/* Typing indicator */}
                            {loading && messages[messages.length - 1]?.content === "" && (
                                <div className="flex items-center gap-3">
                                    <div className="relative flex h-8.5 w-8.5 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#d4af37]/30 bg-black shadow-[0_0_12px_rgba(212,175,55,0.15)]">
                                        <img
                                            src="/logo.png"
                                            alt="AI"
                                            className="h-full w-full object-cover mix-blend-screen"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-[#d4af37]/15 bg-white/[0.03] px-4 py-3 backdrop-blur-md shadow-sm">
                                        <span className="h-1.5 w-1.5 animate-[typing_1.4s_ease-in-out_infinite] rounded-full bg-[#8d8576]" />
                                        <span className="h-1.5 w-1.5 animate-[typing_1.4s_ease-in-out_0.2s_infinite] rounded-full bg-[#d4af37]" />
                                        <span className="h-1.5 w-1.5 animate-[typing_1.4s_ease-in-out_0.4s_infinite] rounded-full bg-[#f5d76e]" />
                                    </div>
                                </div>
                            )}

                            {/* JD loading indicator */}
                            {jdLoading && (
                                <div className="flex items-center gap-3">
                                    <div className="relative flex h-8.5 w-8.5 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#d4af37]/30 bg-black shadow-[0_0_12px_rgba(212,175,55,0.15)]">
                                        <img
                                            src="/logo.png"
                                            alt="AI"
                                            className="h-full w-full object-cover mix-blend-screen"
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 rounded-2xl rounded-bl-sm border border-[#d4af37]/15 bg-white/[0.03] px-4 py-3 backdrop-blur-md shadow-sm">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d4af37]/20 border-t-[#d4af37]" />
                                        <span className="text-[13px] font-medium text-[#c4bcae]">
                                            Analyzing job description...
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </section>


                {/* INPUT AREA */}
                <div
                    className="
                        relative z-20 shrink-0
                        border-t border-[#d4af37]/15
                        bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent
                        px-4 pb-4 pt-3 
                        sm:px-6 sm:pb-5
                    "
                >
                    <div className="mx-auto w-full max-w-3xl">
                        <div className="group relative">

                            <div className="pointer-events-none absolute -inset-0.5 rounded-[22px] bg-gradient-to-r from-[#d4af37]/35 via-[#f5d76e]/25 to-[#991b1b]/30 opacity-0 blur-md transition-opacity duration-300 group-focus-within:opacity-100" />

                            <div
                                className="
                                    relative flex items-end gap-2
                                    rounded-[20px] border border-[#d4af37]/20
                                    bg-[#0a0a0c]/90 p-2
                                    shadow-[0_10px_35px_-10px_rgba(0,0,0,0.8)]
                                    backdrop-blur-2xl transition-all duration-300
                                    focus-within:border-[#d4af37]/45
                                    group-focus-within:shadow-[0_10px_40px_-10px_rgba(212,175,55,0.2)]
                                "
                            >

                                <textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(event) => setInput(event.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask me anything about Faizan..."
                                    rows={1}
                                    disabled={loading}
                                    className="
                                        no-scrollbar
                                        max-h-40 min-h-11 flex-1 resize-none
                                        bg-transparent px-3 py-2
                                        text-[14.5px] leading-relaxed
                                        text-[#f8f5ee] placeholder:text-[#686256]
                                        focus:outline-none disabled:opacity-50
                                    "
                                    style={{ overflowY: "auto" }}
                                />

                                <button
                                    className={`
                                        flex h-10 w-10 shrink-0 items-center justify-center
                                        rounded-xl text-base font-medium
                                        transition-all duration-200

                                        ${!input.trim() || loading
                                            ? "cursor-not-allowed bg-white/[0.04] text-[#5e584d]"
                                            : "bg-gradient-to-br from-[#f5d76e] via-[#d4af37] to-[#8f1d1d] text-black shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:shadow-[0_0_28px_rgba(212,175,55,0.5)] hover:brightness-110 active:scale-95"
                                        }
                                    `}
                                    onClick={sendMessage}
                                    disabled={!input.trim() || loading}
                                    aria-label="Send message"
                                >
                                    {loading ? (
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                                    ) : (
                                        <svg
                                            width="17"
                                            height="17"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <line x1="12" y1="19" x2="12" y2="5" />
                                            <polyline points="5 12 12 5 19 12" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <p className="mt-2.5 text-center text-[11px] font-medium tracking-wide text-[#6e675b]">
                            AI responses are generated based exclusively on Faizan&apos;s candidate profile.
                        </p>
                    </div>
                </div>

            </main>


            <style>{`
                @keyframes typing {
                    0%, 60%, 100% {
                        transform: translateY(0);
                        opacity: 0.4;
                    }
                    30% {
                        transform: translateY(-4px);
                        opacity: 1;
                    }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

export default ChatBot;