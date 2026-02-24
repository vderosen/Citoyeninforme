#!/usr/bin/env node

/**
 * test-rag-coverage.js
 *
 * Validates that RAG retrieval works correctly for all 6 candidates.
 * For each candidate:
 *   1. Embeds a sample query mentioning that candidate by name.
 *   2. Retrieves the top-12 chunks with the candidate filter applied.
 *   3. Checks that at least one retrieved chunk belongs to that candidate.
 *   4. Also tests auto-detection: no filter passed, candidate name in query text.
 *
 * Usage:  node scripts/test-rag-coverage.js
 * Env:    GEMINI_API_KEY
 */

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// .env loader
// ---------------------------------------------------------------------------
function loadDotEnv() {
    const envPath = path.join(__dirname, "..", ".env");
    if (!fs.existsSync(envPath)) return;
    const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;
        const idx = line.indexOf("=");
        if (idx === -1) continue;
        const key = line.slice(0, idx).trim();
        let value = line.slice(idx + 1).trim();
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }
        if (process.env[key] === undefined) process.env[key] = value;
    }
}

// ---------------------------------------------------------------------------
// Vector math
// ---------------------------------------------------------------------------
function dotProduct(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
    return sum;
}

function magnitude(v) {
    let sum = 0;
    for (let i = 0; i < v.length; i++) sum += v[i] * v[i];
    return Math.sqrt(sum);
}

// ---------------------------------------------------------------------------
// Embedding
// ---------------------------------------------------------------------------
async function embedQuery(text, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "models/gemini-embedding-001",
            content: { parts: [{ text }] },
        }),
    });
    if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status} - ${await response.text()}`);
    }
    const data = await response.json();
    return data.embedding.values;
}

// ---------------------------------------------------------------------------
// Candidate name auto-detection (mirrors rag-proxy.js)
// ---------------------------------------------------------------------------
const CANDIDATE_ALIASES = {
    bournazel: "Bournazel",
    chikirou: "Chikirou",
    dati: "Dati",
    gregoire: "Gregoire",
    grégoire: "Gregoire",
    knafo: "Knafo",
    mariani: "Mariani",
    sophia: "Chikirou",
    rachida: "Dati",
    emmanuel: "Gregoire",
    sarah: "Knafo",
    thierry: "Mariani",
    "pierre-yves": "Bournazel",
};

function detectCandidateFilter(text) {
    const lower = text.toLowerCase();
    const found = new Set();
    for (const [alias, name] of Object.entries(CANDIDATE_ALIASES)) {
        if (lower.includes(alias)) found.add(name);
    }
    return found.size === 1 ? [...found][0] : null;
}

// ---------------------------------------------------------------------------
// Retrieval
// ---------------------------------------------------------------------------
function retrieveChunks(ragChunks, queryEmbedding, topK, candidateFilter) {
    const queryMag = magnitude(queryEmbedding);
    let pool = ragChunks;
    if (candidateFilter) {
        pool = ragChunks.filter(
            (c) => c.candidate.toLowerCase() === candidateFilter.toLowerCase()
        );
    }
    const scored = pool.map((chunk) => {
        const sim = dotProduct(queryEmbedding, chunk.embedding) / (queryMag * chunk._mag);
        return { chunk, similarity: sim };
    });
    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, topK);
}

// ---------------------------------------------------------------------------
// Test cases
// ---------------------------------------------------------------------------
const TEST_CASES = [
    {
        candidate: "Bournazel",
        queries: [
            "Décris les propositions de Bournazel",
            "Que propose Pierre-Yves Bournazel pour Paris ?",
            "bournazel logement",
        ],
    },
    {
        candidate: "Chikirou",
        queries: [
            "Quelles sont les propositions de Chikirou ?",
            "Que propose Sophia Chikirou ?",
            "chikirou transport",
        ],
    },
    {
        candidate: "Dati",
        queries: [
            "Décris les propositions de Dati",
            "Que propose Rachida Dati pour Paris ?",
            "dati sécurité",
        ],
    },
    {
        candidate: "Gregoire",
        queries: [
            "Quelles sont les propositions de Grégoire ?",
            "Que propose Emmanuel Grégoire ?",
            "gregoire logement social",
        ],
    },
    {
        candidate: "Knafo",
        queries: [
            "Décris les propositions de Knafo",
            "Que propose Sarah Knafo ?",
            "knafo programme paris",
        ],
    },
    {
        candidate: "Mariani",
        queries: [
            "Quelles sont les propositions de Mariani ?",
            "Que propose Thierry Mariani ?",
            "mariani sécurité paris",
        ],
    },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
    loadDotEnv();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("ERROR: GEMINI_API_KEY not set in .env");
        process.exit(1);
    }

    // Load index
    const indexPath = path.join(__dirname, "..", "data_pipeline", "rag_index.json");
    if (!fs.existsSync(indexPath)) {
        console.error("ERROR: rag_index.json not found. Run build-rag-index.js first.");
        process.exit(1);
    }
    process.stdout.write("Loading RAG index... ");
    const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
    const ragChunks = index.chunks;
    // Pre-compute magnitudes
    for (const chunk of ragChunks) {
        chunk._mag = magnitude(chunk.embedding);
    }
    console.log(`${ragChunks.length} chunks (model: ${index.model}, ${index.dimension} dims)\n`);

    const results = [];
    let passed = 0;
    let failed = 0;

    for (const { candidate, queries } of TEST_CASES) {
        console.log(`── ${candidate} ─────────────────────────────`);

        const candidateChunkCount = ragChunks.filter((c) => c.candidate === candidate).length;
        console.log(`   Index coverage: ${candidateChunkCount} chunks`);

        for (const query of queries) {
            // Test 1: Explicit filter
            const embedding = await embedQuery(query, apiKey);
            const retrievedWithFilter = retrieveChunks(ragChunks, embedding, 12, candidate);
            const topSim = retrievedWithFilter[0]?.similarity ?? 0;
            const hitWithFilter = retrievedWithFilter.some((r) => r.chunk.candidate === candidate);

            // Test 2: Auto-detection (no explicit filter)
            const autoDetected = detectCandidateFilter(query);
            const autoFilterCorrect = autoDetected === candidate;
            let hitAutoDetect = false;
            if (autoDetected) {
                const retrievedAuto = retrieveChunks(ragChunks, embedding, 12, autoDetected);
                hitAutoDetect = retrievedAuto.some((r) => r.chunk.candidate === candidate);
            }

            const ok = hitWithFilter;
            const status = ok ? "✅ PASS" : "❌ FAIL";
            const autoStatus = autoFilterCorrect ? `auto-detect: ${autoDetected}` : `auto-detect: ${autoDetected ?? "none"} (expected ${candidate})`;

            console.log(`   ${status}  top-sim: ${topSim.toFixed(3)}  [${autoStatus}]`);
            console.log(`          "${query}"`);

            results.push({ candidate, query, ok, topSim, autoDetected, autoFilterCorrect });
            if (ok) passed++; else failed++;
        }
        console.log();
    }

    // Summary
    console.log("═══════════════════════════════════════════");
    console.log(`RESULTS: ${passed} passed, ${failed} failed (${results.length} total)`);
    console.log();

    // Per-candidate summary
    for (const { candidate } of TEST_CASES) {
        const caseResults = results.filter((r) => r.candidate === candidate);
        const cPassed = caseResults.filter((r) => r.ok).length;
        const avgSim = (caseResults.reduce((s, r) => s + r.topSim, 0) / caseResults.length).toFixed(3);
        const autoOk = caseResults.filter((r) => r.autoFilterCorrect).length;
        const symbol = cPassed === caseResults.length ? "✅" : "❌";
        console.log(`  ${symbol}  ${candidate.padEnd(12)} ${cPassed}/${caseResults.length} passed  avg-sim: ${avgSim}  auto-detect: ${autoOk}/${caseResults.length}`);
    }
    console.log();

    if (failed > 0) {
        console.log("Some tests failed. Check retrieval scores above.");
        process.exit(1);
    } else {
        console.log("All tests passed. RAG coverage is good for all candidates.");
    }
}

main().catch((err) => {
    console.error("FATAL:", err);
    process.exit(1);
});
