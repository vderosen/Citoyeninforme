#!/usr/bin/env node

/**
 * build-rag-index.js
 *
 * Reads all text_clean/*.json source documents, chunks them into
 * ~500-token segments with overlap, embeds each chunk via Gemini
 * gemini-embedding-001, and writes the result to rag_index.json.
 *
 * Memory-efficient: embeds in parallel batches and writes one batch
 * at a time, never holding all embeddings in memory simultaneously.
 *
 * Usage:  node scripts/build-rag-index.js
 * Env:    GEMINI_API_KEY
 * Output: data_pipeline/rag_index.json
 */

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const TEXT_CLEAN_DIR = path.join(
    __dirname, "..", "data_pipeline", "rag_sources_by_vass", "text_clean"
);
const SOURCES_FILE = path.join(
    __dirname, "..", "data_pipeline", "rag_sources_by_vass", "sources.jsonl"
);
const OUTPUT_FILE = path.join(__dirname, "..", "data_pipeline", "rag_index.json");

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSION = 768;
const CHUNK_SIZE_CHARS = 1500;
const CHUNK_OVERLAP_CHARS = 200;
// Gemini embedding API does not support batching — parallelize individual calls
const EMBEDDING_BATCH_SIZE = 20;

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
        if (process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
}

// ---------------------------------------------------------------------------
// Source metadata loader
// ---------------------------------------------------------------------------
function loadSourcesMetadata() {
    const lines = fs.readFileSync(SOURCES_FILE, "utf8").split("\n").filter(Boolean);
    const map = new Map();
    for (const line of lines) {
        const obj = JSON.parse(line);
        if (obj.status !== "extracted") continue;
        if (obj.candidate === "Test") continue;
        if (!map.has(obj.source_id)) {
            map.set(obj.source_id, {
                candidate: obj.candidate,
                title: obj.title || "",
                url: obj.url || "",
            });
        }
    }
    return map;
}

// ---------------------------------------------------------------------------
// Chunking
// ---------------------------------------------------------------------------
function chunkText(text, chunkSize, overlap) {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
        let end = Math.min(start + chunkSize, text.length);
        if (end < text.length) {
            const searchFrom = Math.max(start + Math.floor(chunkSize * 0.7), start);
            for (let i = end; i >= searchFrom; i--) {
                const ch = text[i];
                if (ch === "." || ch === "!" || ch === "?" || ch === "\n") {
                    end = i + 1;
                    break;
                }
            }
        }
        const chunk = text.slice(start, end).trim();
        if (chunk.length > 50) {
            chunks.push(chunk);
        }
        // Ensure we always advance (avoid infinite loop)
        const nextStart = end - overlap;
        start = nextStart > start ? nextStart : end;
    }
    return chunks;
}

// ---------------------------------------------------------------------------
// Gemini Embeddings
// ---------------------------------------------------------------------------
async function embedSingle(text, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: `models/${EMBEDDING_MODEL}`,
            content: { parts: [{ text }] },
        }),
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini Embeddings API error ${response.status}: ${errorBody}`);
    }
    const data = await response.json();
    return data.embedding.values;
}

async function embedBatch(texts, apiKey) {
    // Gemini doesn't support batching — parallelize individual calls
    return Promise.all(texts.map((text) => embedSingle(text, apiKey)));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
    loadDotEnv();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("ERROR: GEMINI_API_KEY not found in .env");
        process.exit(1);
    }

    console.log("[build-rag-index] Loading source metadata...");
    const sourcesMap = loadSourcesMetadata();
    console.log(`[build-rag-index] Found ${sourcesMap.size} unique sources`);

    // Step 1: Read & chunk all documents (text only, no embeddings yet)
    console.log("[build-rag-index] Reading and chunking text_clean files...");
    const files = fs.readdirSync(TEXT_CLEAN_DIR).filter((f) => f.endsWith(".json")).sort();

    // Store only metadata + text per chunk (no embeddings in memory)
    const chunkMetas = [];

    for (const file of files) {
        const filePath = path.join(TEXT_CLEAN_DIR, file);
        const doc = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const sourceId = doc.source_id;
        const meta = sourcesMap.get(sourceId);
        if (!meta) { console.warn(`  SKIP: no metadata for ${sourceId}`); continue; }
        const fullText = doc.full_text || "";
        if (!fullText.trim()) { console.warn(`  SKIP: empty text for ${sourceId}`); continue; }

        const chunks = chunkText(fullText, CHUNK_SIZE_CHARS, CHUNK_OVERLAP_CHARS);
        for (let i = 0; i < chunks.length; i++) {
            chunkMetas.push({
                id: `${sourceId}__${i}`,
                text: chunks[i],
                candidate: meta.candidate,
                source_id: sourceId,
                source_title: meta.title,
                source_url: meta.url,
            });
        }
        console.log(`  ${meta.candidate.padEnd(12)} | ${chunks.length} chunks | ${file}`);
    }

    const totalChunks = chunkMetas.length;
    const candidates = [...new Set(chunkMetas.map((c) => c.candidate))].sort();
    console.log(`\n[build-rag-index] Total chunks: ${totalChunks}`);
    console.log(`[build-rag-index] Candidates: ${candidates.join(", ")}`);

    // Step 2: Open output file stream and write header
    const fd = fs.openSync(OUTPUT_FILE, "w");
    const header = `{"model":${JSON.stringify(EMBEDDING_MODEL)},"dimension":${EMBEDDING_DIMENSION},"created_at":${JSON.stringify(new Date().toISOString())},"chunk_count":${totalChunks},"candidates":${JSON.stringify(candidates)},"chunks":[`;
    fs.writeSync(fd, header);

    // Step 3: Embed in batches and write each chunk immediately (then free memory)
    let chunksWritten = 0;
    const totalBatches = Math.ceil(totalChunks / EMBEDDING_BATCH_SIZE);

    for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
        const start = batchIdx * EMBEDDING_BATCH_SIZE;
        const end = Math.min(start + EMBEDDING_BATCH_SIZE, totalChunks);
        const batchMetas = chunkMetas.slice(start, end);
        const batchTexts = batchMetas.map((c) => c.text);

        process.stdout.write(
            `[build-rag-index] Batch ${batchIdx + 1}/${totalBatches} (${batchTexts.length} chunks)... `
        );

        const embeddings = await embedBatch(batchTexts, apiKey);

        // Write each chunk with its embedding immediately
        for (let i = 0; i < batchMetas.length; i++) {
            const m = batchMetas[i];
            const emb = embeddings[i];
            // Round to 6 decimals
            const embArr = emb.map((v) => Math.round(v * 1e6) / 1e6);
            const obj = JSON.stringify({
                id: m.id,
                text: m.text,
                candidate: m.candidate,
                source_id: m.source_id,
                source_title: m.source_title,
                source_url: m.source_url,
                embedding: embArr,
            });
            fs.writeSync(fd, (chunksWritten === 0 ? "" : ",") + obj);
            chunksWritten++;
        }

        console.log("done");
        // embeddings goes out of scope here → GC can reclaim
    }

    fs.writeSync(fd, "]}");
    fs.closeSync(fd);

    const sizeMB = (fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(1);
    console.log(`\n[build-rag-index] ✅ Index written to ${OUTPUT_FILE}`);
    console.log(`[build-rag-index] Size: ${sizeMB} MB | Chunks: ${totalChunks}`);
}

main().catch((err) => {
    console.error("[build-rag-index] FATAL:", err);
    process.exit(1);
});
