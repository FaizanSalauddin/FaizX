import ProjectCards from "./ProjectCrads";
import EducationCards from "./EducationCards";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

function ChatMessage({ message }) {
    const isUser = message.role === "user";

    // Projects → cards
    if (message?.type === "projects") {
        return (
            <div className="w-full">
                <ProjectCards />
            </div>
        );
    }

    // Education → timeline cards
    if (message?.type === "education") {
        return (
            <div className="w-full">
                <EducationCards />
            </div>
        );
    }

    return (
        <div
            className={`
                flex
                w-full
                gap-3

                ${isUser ? "justify-end" : "justify-start"}

               animate-[messageFade_0.3s_ease-out]
            `}
        >

            {/* =============================
                AI AVATAR
            ============================== */}

            {!isUser && (
                <div
                    className="
                        relative
                        mt-0.5

                        flex
                        h-8
                        w-8
                        shrink-0

                        items-center
                        justify-center

                        overflow-hidden
                        rounded-xl

                        border
                        border-[#d4af37]/25

                        bg-black

                        shadow-[0_0_20px_rgba(212,175,55,0.18)]
                    "
                >
                    <div
                        className="
                            absolute
                            inset-0
                            bg-[#d4af37]/10
                            blur-md
                        "
                    />

                    <img
                        src="/logo.png"
                        alt="AI"
                        className="
                            relative
                            z-10

                            h-full
                            w-full

                            object-contain
                            p-0.5
                        "
                    />
                </div>
            )}


            {/* =============================
                MESSAGE BUBBLE
            ============================== */}

            <div
                className={`
                    max-w-[85%]
                    sm:max-w-[75%]

                    text-[14.5px]
                    leading-[1.65]

                    break-words

                    ${isUser
                        ? `
                                rounded-2xl
                                rounded-br-md

                                border
                                border-[#d4af37]/20

                                bg-gradient-to-br
                                from-[#3a3016]
                                via-[#211d13]
                                to-[#17120d]

                                px-4
                                py-3

                                text-[#f8f3df]

                                shadow-[0_8px_30px_-12px_rgba(212,175,55,0.20)]
                            `
                        : `
                                rounded-2xl
                                rounded-bl-md

                                border
                                border-white/[0.07]

                                bg-gradient-to-br
                                from-white/[0.035]
                                to-[#d4af37]/[0.015]

                                px-4
                                py-3

                                text-[#e3dfd5]

                                shadow-[0_8px_30px_-12px_rgba(0,0,0,0.55)]

                                backdrop-blur-sm
                            `
                    }
                `}
            >

                {isUser ? (

                    <div className="whitespace-pre-wrap">
                        {message.content}
                    </div>

                ) : (

                    <div
                        className="
                            [&>*:first-child]:mt-0
                            [&>*:last-child]:mb-0
                        "
                    >
                        {message.content ? (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    // ------- PARAGRAPHS -------
                                    p: ({ node, ...props }) => (
                                        <p
                                            className="mb-2 leading-relaxed last:mb-0"
                                            {...props}
                                        />
                                    ),

                                    // ------- HEADINGS -------
                                    h1: ({ node, ...props }) => (
                                        <h1
                                            className="
                                                mb-2 mt-4
                                                bg-gradient-to-r
                                                from-[#f5d76e] via-[#d4af37] to-[#c2410c]
                                                bg-clip-text
                                                text-[19px] font-semibold
                                                text-transparent
                                                first:mt-0
                                            "
                                            {...props}
                                        />
                                    ),
                                    h2: ({ node, ...props }) => (
                                        <h2
                                            className="
                                                mb-2 mt-4
                                                text-[17px] font-semibold
                                                text-[#f5d76e]
                                                first:mt-0
                                            "
                                            {...props}
                                        />
                                    ),
                                    h3: ({ node, ...props }) => (
                                        <h3
                                            className="
                                                mb-1.5 mt-3
                                                text-[15px] font-semibold
                                                text-[#f5d76e]
                                                first:mt-0
                                            "
                                            {...props}
                                        />
                                    ),
                                    h4: ({ node, ...props }) => (
                                        <h4
                                            className="
                                                mb-1.5 mt-3
                                                text-[14px] font-semibold
                                                text-[#d4af37]
                                                first:mt-0
                                            "
                                            {...props}
                                        />
                                    ),

                                    // ------- LISTS -------
                                    ul: ({ node, ...props }) => (
                                        <ul
                                            className="mb-2 ml-1 list-none space-y-1"
                                            {...props}
                                        />
                                    ),
                                    ol: ({ node, ...props }) => (
                                        <ol
                                            className="mb-2 ml-5 list-decimal space-y-1"
                                            {...props}
                                        />
                                    ),
                                    li: ({ node, ...props }) => (
                                        <li
                                            className="
                                                relative
                                                pl-5
                                                leading-relaxed

                                                before:absolute
                                                before:left-0
                                                before:top-[10px]
                                                before:h-1.5
                                                before:w-1.5
                                                before:rounded-full
                                                before:bg-[#d4af37]
                                                before:shadow-[0_0_6px_rgba(212,175,55,0.45)]
                                            "
                                            {...props}
                                        />
                                    ),

                                    // ------- INLINE -------
                                    strong: ({ node, ...props }) => (
                                        <strong
                                            className="font-semibold text-[#f5d76e]"
                                            {...props}
                                        />
                                    ),
                                    em: ({ node, ...props }) => (
                                        <em
                                            className="italic text-[#d8d0bd]"
                                            {...props}
                                        />
                                    ),

                                    // ------- LINE BREAK -------
                                    br: () => <br />,

                                    // ------- LINKS -------
                                    a: ({ node, ...props }) => (
                                        <a
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="
                                                text-[#d4af37]
                                                underline
                                                decoration-[#d4af37]/30
                                                underline-offset-2
                                                transition-colors
                                                hover:text-[#f5d76e]
                                                hover:decoration-[#f5d76e]
                                            "
                                            {...props}
                                        />
                                    ),

                                    // ------- INLINE CODE -------
                                    code: ({ node, inline, className, children, ...props }) => {
                                        if (inline) {
                                            return (
                                                <code
                                                    className="
                                                        rounded-md
                                                        border border-[#d4af37]/15
                                                        bg-[#d4af37]/[0.06]
                                                        px-1.5 py-0.5
                                                        font-mono text-[12.5px]
                                                        text-[#f5d76e]
                                                    "
                                                    {...props}
                                                >
                                                    {children}
                                                </code>
                                            );
                                        }

                                        return (
                                            <code
                                                className="font-mono text-[13px] leading-relaxed text-[#e8e1cf]"
                                                {...props}
                                            >
                                                {children}
                                            </code>
                                        );
                                    },

                                    // ------- CODE BLOCK -------
                                    pre: ({ node, ...props }) => (
                                        <pre
                                            className="
                                                my-3
                                                overflow-x-auto
                                                rounded-xl
                                                border border-[#d4af37]/10
                                                bg-[#050505]
                                                p-4
                                                shadow-[0_10px_35px_-15px_rgba(0,0,0,0.8)]
                                            "
                                            {...props}
                                        />
                                    ),

                                    // ------- TABLES (fallback) -------
                                    table: ({ node, ...props }) => (
                                        <div className="my-3 overflow-x-auto rounded-xl border border-[#d4af37]/15">
                                            <table
                                                className="w-full border-collapse text-[12.5px]"
                                                {...props}
                                            />
                                        </div>
                                    ),
                                    thead: ({ node, ...props }) => (
                                        <thead
                                            className="bg-[#d4af37]/[0.06]"
                                            {...props}
                                        />
                                    ),
                                    th: ({ node, ...props }) => (
                                        <th
                                            className="
                                                px-3 py-2
                                                text-left
                                                text-[11px] font-semibold
                                                uppercase tracking-wider
                                                text-[#d4af37]
                                            "
                                            {...props}
                                        />
                                    ),
                                    td: ({ node, ...props }) => (
                                        <td
                                            className="
                                                border-t border-[#d4af37]/10
                                                px-3 py-2
                                                align-top
                                                text-[#cfc7b6]
                                            "
                                            {...props}
                                        />
                                    ),

                                    // ------- BLOCKQUOTE -------
                                    blockquote: ({ node, ...props }) => (
                                        <blockquote
                                            className="
                                                my-2
                                                border-l-2 border-[#d4af37]/40
                                                bg-[#d4af37]/[0.03]
                                                py-2 pl-3
                                                italic text-[#cfc7b6]
                                            "
                                            {...props}
                                        />
                                    ),

                                    // ------- HORIZONTAL RULE -------
                                    hr: ({ node, ...props }) => (
                                        <hr
                                            className="my-4 border-[#d4af37]/15"
                                            {...props}
                                        />
                                    ),
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        ) : (
                            <span className="text-[#8b8373]">
                                Thinking...
                            </span>
                        )}
                    </div>

                )}

            </div>


            {/* =============================
                USER AVATAR
            ============================== */}

            {isUser && (
                <div
                    className="
                        mt-0.5

                        flex
                        h-8
                        w-8
                        shrink-0

                        items-center
                        justify-center

                        rounded-xl

                        border
                        border-[#d4af37]/15

                        bg-gradient-to-br
                        from-[#d4af37]/10
                        to-[#7f1d1d]/10

                        text-[11px]
                        font-medium

                        text-[#d4af37]
                    "
                >
                    You
                </div>
            )}


            <style>{`
                @keyframes messageIn {
                    from {
                        opacity: 0;
                        transform: translateY(8px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>

        </div>
    );
}

export default ChatMessage;