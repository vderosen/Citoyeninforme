# RAG Data Export — Paris 2026 Mayoral Candidates Programs

> **Exported:** 2026-02-18
> **Source project:** Programme Candidats à la mairie de Paris
> **Purpose:** Power a conversational RAG feature in the civic tech app where users can ask questions about candidates' programs after completing the swipe quiz.

---

## What's in this export

```
rag_export/
├── README.md                       ← This file
├── sources.jsonl                   ← Source registry: metadata per document
├── text_clean/                     ← Cleaned full text per source (26 files)
├── canonical_cards.jsonl           ← 203 canonical proposal topic cards
├── review_master_filtered.csv      ← 280 curated proposals (human-reviewed)
└── verified_explanations.csv       ← Human-validated explanations per card
```

**Total size:** ~2.5 MB (no PDFs included — text already extracted)

---

## Candidates covered

| Candidate | Party/Position | Documents | Text volume |
|-----------|---------------|-----------|-------------|
| **Bournazel** (Pierre-Yves) | Centre-right | 8 HTML pages | 129k chars |
| **Chikirou** (Sophia) | Left (LFI) | 1 PDF (204 pages) | 249k chars |
| **Dati** (Rachida) | Right (LR) | 10 PDFs | 63k chars |
| **Grégoire** (Emmanuel) | Left (PS) | 5 PDFs | 216k chars |
| **Knafo** (Sarah) | Right (RN) | 1 PDF (135 pages) | 145k chars |
| **Mariani** (Thierry) | Far-right | 1 PDF (24 pages) | 31k chars |

---

## File schemas

### `sources.jsonl` — Source registry

One JSON object per line. Each entry describes a source document.

| Field | Type | Description |
|-------|------|-------------|
| `source_id` | string | Unique slug ID (e.g. `dati_tract-proprete-2026_2db342b1`) |
| `candidate` | string | Candidate surname |
| `title` | string | Document title in French |
| `url` | string | Original download URL |
| `type` | `pdf` \| `html` | Document format |
| `publisher` | string | `campaign` or `other` |
| `date_published` | string | ISO date (YYYY-MM-DD) |
| `date_retrieved` | string | ISO date |
| `raw_path` | string | Path to original file (not included in export) |
| `text_path` | string | Path to extracted text JSON |
| `page_count` | int | Number of pages |
| `status` | string | `extracted` = successfully processed |

### `text_clean/*.json` — Extracted & cleaned text

**This is the primary RAG source. Use these files for chunking and embedding.**

Two formats depending on source type:

#### PDF documents
```json
{
  "source_id": "dati_tract-proprete-2026_2db342b1",
  "source_type": "pdf",
  "extractor": "pdfplumber",
  "page_count": 2,
  "pages": [
    {
      "page_num": 1,
      "text": "Full extracted text of page 1...",
      "char_count": 1200
    }
  ],
  "full_text": "All pages concatenated with double newlines"
}
```

#### HTML documents (Bournazel)
```json
{
  "source_id": "bournazel_apaiser-paris-cadre-de-vie_1d82ae5c",
  "source_type": "html",
  "extractor": "beautifulsoup",
  "paragraph_count": 66,
  "paragraphs": [
    {
      "para_id": "p1",
      "tag": "h1",
      "text": "Apaiser Paris",
      "char_count": 13
    }
  ],
  "full_text": "All paragraphs joined with newlines"
}
```

**Cleaning applied:** Page headers (`parisengrand.fr XX/96`), copyright lines, press contact blocks, garbled OCR pages (stylized Dati PDFs), and micro-fragments have been stripped. Original text preserved 98% of content.

### `canonical_cards.jsonl` — Canonical proposal cards

203 cards representing unique policy topics. Each card groups similar proposals across candidates.

| Field | Type | Description |
|-------|------|-------------|
| `card_id` | string | E.g. `CARD_0001` |
| `titre_canonique` | string | Canonical title in French |
| `description_canonique` | string | Neutral description of the policy topic |
| `topic_signature` | string | Policy domain |
| `cluster_members` | array | Proposal IDs belonging to this card |

### `review_master_filtered.csv` — Curated proposals (TSV)

280 rows, human-reviewed and filtered. **Tab-separated.**

| Column | Description |
|--------|-------------|
| `card_id` | Links to canonical_cards |
| `A_GARDER` | `TRUE` = human-validated as a real proposal |
| `secteur` | Policy sector in French |
| `titre_canonique` | Canonical title |
| `description_canonique` | Neutral description |
| `candidat` | Candidate name |
| `stance` | `support`, `oppose`, `modify`, `unclear` |
| `confidence` | Extraction confidence |
| `titre_original` | Original title from source |
| `explication_originale` | Original explanation/evidence |
| `proposal_id` | Unique proposal ID |

### `verified_explanations.csv` — Human-validated explanations

Complements the review master with validated, web-grounded explanations per canonical card. Written in accessible, neutral French (80-120 words each).

---

## RAG implementation guidance

### Recommended chunking strategy

1. **Primary chunks:** Use the `full_text` field from each `text_clean/*.json` file, split into ~500-800 token chunks with overlap
2. **Metadata per chunk:** Attach `source_id`, `candidate`, `source_type`, and page/paragraph number for attribution
3. **Structured layer (optional):** Also index `review_master_filtered.csv` rows as standalone chunks — these are pre-structured and high-signal

### Embedding model

The original pipeline used **Gemini `gemini-embedding-001`** (768 dimensions). No pre-computed embeddings are included — the target repo should generate its own embeddings using whichever model suits the RAG stack.

### For the chat feature

When a user asks a question like *"Que proposent les candidats pour le logement ?"*:

1. **Retrieve** relevant chunks from `text_clean/` via embedding similarity
2. **Enrich** with structured data from `review_master_filtered.csv` to get candidate name, stance, and canonical card context
3. **Attribute** answers using `sources.jsonl` metadata (document title, URL, date)

### Candidate name normalization

Note: "Gregoire" and "Grégoire" appear as variants in some files — normalize to "Grégoire" (Emmanuel Grégoire).

---

## Data quality notes

- Text is **98% clean** after noise stripping (846k of 863k chars preserved)
- All Bournazel content comes from structured HTML — very high quality
- Dati PDFs had some stylized layouts causing garbled OCR on cover pages — these have been stripped
- Gregoire's 96-page book is the richest single document (160k chars)
- Chikirou's 204-page PDF is the longest (249k chars)
- All proposals have been manually reviewed and filtered by a human curator
