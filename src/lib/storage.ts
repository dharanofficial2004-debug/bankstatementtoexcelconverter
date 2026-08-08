import { supabase } from "./supabase";

const STORAGE_BUCKET = "pdf-uploads";

function sanitizeFileName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  return cleaned || "statement.pdf";
}

async function destinationPath(fileName: string): Promise<string | null> {
  if (!supabase) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  const prefix = userId ? `u/${userId}` : "anon";
  return `${prefix}/${Date.now()}-${sanitizeFileName(fileName)}`;
}

export async function uploadPdfToStorage(file: File): Promise<string | null> {
  if (!supabase) return null;

  try {
    const path = await destinationPath(file.name);
    if (!path) return null;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (error) {
      console.warn("[pdf-store] Upload failed:", error.message);
      return null;
    }

    return data?.path ?? null;
  } catch (err) {
    console.warn("[pdf-store] Upload error:", err);
    return null;
  }
}

export async function uploadUnlockedPdfToStorage(file: File, password: string): Promise<string | null> {
  if (!supabase) return null;

  try {
    // Load qpdf (via WebAssembly) from a CDN, mirroring how pdf.js is loaded.
    // Decryption happens entirely in the browser — the password never leaves it.
    const PDFSTUDIO_URLS = [
      "https://unpkg.com/pdfstudio@0.4.0/dist/index.js",
      "https://cdn.jsdelivr.net/npm/pdfstudio@0.4.0/dist/index.js",
    ];

    let pdfstudio: { createPdfToolkit: () => Promise<{
      unlock: (doc: unknown, opts: { password: string }) => Promise<Uint8Array>;
    }> } | null = null;
    for (const url of PDFSTUDIO_URLS) {
      try {
        const mod = (await import(/* webpackIgnore: true */ url)) as {
          createPdfToolkit: () => Promise<{
            unlock: (doc: unknown, opts: { password: string }) => Promise<Uint8Array>;
          }>;
        };
        pdfstudio = mod;
        break;
      } catch {
        // Try the next CDN if this one is blocked or unreachable.
      }
    }
    if (!pdfstudio) {
      throw new Error("Could not load the PDF unlocker.");
    }

    const pdf = await pdfstudio.createPdfToolkit();
    const unlocked = await pdf.unlock(file, { password });

    const unlockedName = file.name.replace(/\.pdf$/i, "") + "_unlocked.pdf";
    const path = await destinationPath(unlockedName);
    if (!path) return null;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, unlocked, {
        cacheControl: "3600",
        upsert: false,
        contentType: "application/pdf",
      });

    if (error) {
      console.warn("[pdf-store] Unlocked upload failed:", error.message);
      return null;
    }

    return data?.path ?? null;
  } catch (err) {
    console.warn("[pdf-store] Unlock failed:", err);
    return null;
  }
}
