import "dotenv/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { glob } from "glob";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, relative } from "node:path";

// ---------------------------------------------------------------------------
// Database types (minimal, no codegen required)
// ---------------------------------------------------------------------------

interface EmbeddingInsert {
  source_type: "note";
  source_id: null;
  certification_slug: string | null;
  content: string;
  metadata: EmbeddingMetadata;
  embedding: number[];
}

interface EmbeddingRow {
  id: string;
  metadata: unknown;
}

interface Db {
  public: {
    Tables: {
      embeddings: {
        Row: EmbeddingRow;
        Insert: EmbeddingInsert;
        Update: Partial<EmbeddingInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

type DbClient = SupabaseClient<Db>;

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

type CertificationSlug = "ip" | "fe" | "genai" | "gken" | "spi" | "boki";

interface EmbeddingMetadata {
  filePath: string;
  fileHash: string;
  certificationSlug: CertificationSlug | null;
  paragraphId: number;
}

interface ParsedArgs {
  dryRun: boolean;
  contentDir: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CERTIFICATION_FROM_PATH: Record<string, CertificationSlug> = {
  "it-passport": "ip",
  "basic-information-engineer": "fe",
  "generative-ai-passport": "genai",
  "g-test": "gken",
  ip: "ip",
  fe: "fe",
  genai: "genai",
  gken: "gken",
  spi: "spi",
  boki: "boki",
};

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBED_BATCH_SIZE = 100;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const contentDirIndex = args.indexOf("--content-dir");
  const contentDir =
    contentDirIndex !== -1 && args[contentDirIndex + 1]
      ? resolve(args[contentDirIndex + 1])
      : resolve(new URL(".", import.meta.url).pathname, "../content");
  return { dryRun, contentDir };
}

function sha1(text: string): string {
  return createHash("sha1").update(text, "utf8").digest("hex");
}

function certificationSlugFromPath(
  filePath: string,
  contentDir: string
): CertificationSlug | null {
  const rel = relative(contentDir, filePath);
  const topDir = rel.split("/")[0];
  return CERTIFICATION_FROM_PATH[topDir] ?? null;
}

function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function isEmbeddingMetadata(value: unknown): value is EmbeddingMetadata {
  return (
    typeof value === "object" &&
    value !== null &&
    "fileHash" in value &&
    typeof (value as Record<string, unknown>).fileHash === "string"
  );
}

// ---------------------------------------------------------------------------
// Supabase helpers
// ---------------------------------------------------------------------------

async function fetchExistingHashes(
  supabase: DbClient,
  filePath: string
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("embeddings")
    .select("metadata")
    .eq("source_type", "note")
    .filter("metadata->>filePath", "eq", filePath);

  if (error) {
    throw new Error(`Failed to fetch existing hashes: ${error.message}`);
  }

  const hashes = new Set<string>();
  for (const row of data ?? []) {
    if (isEmbeddingMetadata(row.metadata)) {
      hashes.add(row.metadata.fileHash);
    }
  }
  return hashes;
}

async function deleteByFilePath(
  supabase: DbClient,
  filePath: string
): Promise<void> {
  const { error } = await supabase
    .from("embeddings")
    .delete()
    .eq("source_type", "note")
    .filter("metadata->>filePath", "eq", filePath);

  if (error) {
    throw new Error(`Failed to delete rows for ${filePath}: ${error.message}`);
  }
}

async function insertRows(
  supabase: DbClient,
  rows: EmbeddingInsert[]
): Promise<void> {
  const { error } = await supabase.from("embeddings").insert(rows);
  if (error) {
    throw new Error(`Failed to insert embeddings: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// OpenAI embedding
// ---------------------------------------------------------------------------

async function embedBatch(
  openai: OpenAI,
  texts: string[]
): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return response.data.map((d) => d.embedding);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const { dryRun, contentDir } = parseArgs();

  const supabaseUrl = requireEnv("SUPABASE_URL");
  const supabaseKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const openaiKey = requireEnv("OPENAI_API_KEY");

  const supabase: DbClient = createClient<Db>(supabaseUrl, supabaseKey);
  const openai = new OpenAI({ apiKey: openaiKey });

  const pattern = `${contentDir}/**/*.md`;
  const files = await glob(pattern, { absolute: true });

  if (files.length === 0) {
    console.log("No markdown files found.");
    process.exit(0);
  }

  console.log(`Found ${files.length} markdown file(s).`);
  if (dryRun) {
    console.log("[dry-run] No changes will be written to the database.");
  }

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const filePath of files) {
    const content = readFileSync(filePath, "utf8");
    const fileHash = sha1(content);
    const certificationSlug = certificationSlugFromPath(filePath, contentDir);
    const paragraphs = splitIntoParagraphs(content);

    if (paragraphs.length === 0) {
      console.log(`  skip (empty after parsing): ${filePath}`);
      continue;
    }

    if (dryRun) {
      console.log(
        `  [dry-run] would process: ${filePath} (${paragraphs.length} paragraph(s), hash: ${fileHash})`
      );
      continue;
    }

    const existingHashes = await fetchExistingHashes(supabase, filePath);

    if (existingHashes.has(fileHash)) {
      console.log(`  skip (unchanged): ${filePath}`);
      totalSkipped++;
      continue;
    }

    if (existingHashes.size > 0) {
      console.log(`  update (hash changed): ${filePath}`);
      await deleteByFilePath(supabase, filePath);
    } else {
      console.log(`  insert (new file): ${filePath}`);
    }

    const embeddings: number[][] = [];
    for (let i = 0; i < paragraphs.length; i += EMBED_BATCH_SIZE) {
      const batch = paragraphs.slice(i, i + EMBED_BATCH_SIZE);
      const vectors = await embedBatch(openai, batch);
      embeddings.push(...vectors);
    }

    const rows: EmbeddingInsert[] = paragraphs.map((paragraph, idx) => ({
      source_type: "note",
      source_id: null,
      certification_slug: certificationSlug,
      content: paragraph,
      metadata: {
        filePath,
        fileHash,
        certificationSlug,
        paragraphId: idx,
      },
      embedding: embeddings[idx] ?? [],
    }));

    await insertRows(supabase, rows);
    totalInserted += rows.length;
  }

  if (!dryRun) {
    console.log(
      `\nDone. Inserted: ${totalInserted} paragraph(s), Skipped: ${totalSkipped} file(s).`
    );
  }
}

main().catch((e: unknown) => {
  if (e instanceof Error) {
    console.error("Error:", e.message);
  } else {
    console.error("Unknown error:", e);
  }
  process.exit(1);
});
