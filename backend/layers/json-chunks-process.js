export function chunkPdfData(pdfData, maxTokens = 350) {
    const chunks = [];

    const estimateTokens = (text) => Math.ceil(text.length / 4);

    // Common heading patterns for policies/contracts/proposals
    const isHeading = (line) => {
        line = line.trim();

        return (
            // 1 Introduction / 2.1 Scope / 4.2.1 Password Policy
            /^(\d+(\.\d+)*)\s+.+$/.test(line) ||

            // PURPOSE / SCOPE / DEFINITIONS
            /^[A-Z][A-Z\s&/-]{3,}$/.test(line) ||

            // Appendix A
            /^Appendix\s+[A-Z0-9]/i.test(line)
        );
    };

    for (const page of pdfData.pages) {
        const lines = page.text
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);

        // Build semantic sections
        const sections = [];
        let currentHeading = "Untitled";
        let currentContent = [];

        for (const line of lines) {
            if (isHeading(line)) {
                if (currentContent.length) {
                    sections.push({
                        heading: currentHeading,
                        content: currentContent.join("\n"),
                    });
                }

                currentHeading = line;
                currentContent = [];
            } else {
                currentContent.push(line);
            }
        }

        if (currentContent.length) {
            sections.push({
                heading: currentHeading,
                content: currentContent.join("\n"),
            });
        }

        // Chunk each section
        for (const section of sections) {
            const fullText =
                `${section.heading}\n\n${section.content}`.trim();

            if (estimateTokens(fullText) <= maxTokens) {
                chunks.push({
                    pageContent: fullText,
                    metadata: {
                        type: "pdf",
                        page: page.num,
                        section: section.heading,
                    },
                });

                continue;
            }

            // Split oversized sections by paragraphs
            const paragraphs = section.content
                .split(/\n{2,}/)
                .map((p) => p.trim())
                .filter(Boolean);

            let buffer = [];
            let tokens = estimateTokens(section.heading);

            for (const paragraph of paragraphs) {
                const paragraphTokens = estimateTokens(paragraph);

                if (
                    buffer.length &&
                    tokens + paragraphTokens > maxTokens
                ) {
                    chunks.push({
                        pageContent:
                            `${section.heading}\n\n${buffer.join("\n\n")}`,
                        metadata: {
                            type: "pdf",
                            page: page.num,
                            section: section.heading,
                        },
                    });

                    buffer = [];
                    tokens = estimateTokens(section.heading);
                }

                buffer.push(paragraph);
                tokens += paragraphTokens;
            }

            if (buffer.length) {
                chunks.push({
                    pageContent:
                        `${section.heading}\n\n${buffer.join("\n\n")}`,
                    metadata: {
                        type: "pdf",
                        page: page.num,
                        section: section.heading,
                    },
                });
            }
        }
    }

    return chunks;
}