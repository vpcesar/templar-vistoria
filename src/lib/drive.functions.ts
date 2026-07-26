import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY = "https://connector-gateway.lovable.dev/google_drive";

function headers() {
  const lovable = process.env.LOVABLE_API_KEY;
  const conn = process.env.GOOGLE_DRIVE_API_KEY;
  if (!lovable || !conn) throw new Error("Conector do Google Drive não configurado.");
  return {
    Authorization: `Bearer ${lovable}`,
    "X-Connection-Api-Key": conn,
  };
}

export const listDriveFolders = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ q: z.string().optional() }).parse(data ?? {}))
  .handler(async ({ data }) => {
    const search = data.q?.trim();
    const q = [
      "mimeType='application/vnd.google-apps.folder'",
      "trashed=false",
      search ? `name contains '${search.replace(/'/g, "\\'")}'` : null,
    ]
      .filter(Boolean)
      .join(" and ");

    const url = new URL(`${GATEWAY}/drive/v3/files`);
    url.searchParams.set("q", q);
    url.searchParams.set("fields", "files(id,name)");
    url.searchParams.set("pageSize", "100");
    url.searchParams.set("orderBy", "name");
    url.searchParams.set("supportsAllDrives", "true");
    url.searchParams.set("includeItemsFromAllDrives", "true");

    const res = await fetch(url.toString(), { headers: headers() });
    if (!res.ok) {
      const body = await res.text();
      console.error(`Drive list failed [${res.status}]: ${body}`);
      throw new Error(`Falha ao listar pastas do Google Drive [${res.status}]`);
    }
    const json = (await res.json()) as { files?: { id: string; name: string }[] };
    return json.files ?? [];
  });

export const uploadDriveFile = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        filename: z.string().min(1),
        mimeType: z.string().min(1),
        folderId: z.string().min(1),
        contentBase64: z.string().min(1),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const boundary = `templar${Math.random().toString(36).slice(2)}`;
    const metadata = JSON.stringify({ name: data.filename, parents: [data.folderId] });
    const head = Buffer.from(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
        `--${boundary}\r\nContent-Type: ${data.mimeType}\r\nContent-Transfer-Encoding: base64\r\n\r\n`,
      "utf8",
    );
    const tail = Buffer.from(`\r\n--${boundary}--\r\n`, "utf8");
    const body = Buffer.concat([head, Buffer.from(data.contentBase64, "utf8"), tail]);


    const res = await fetch(
      `${GATEWAY}/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,webViewLink`,
      {
        method: "POST",
        headers: {
          ...headers(),
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body,
      },
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`Drive upload failed [${res.status}]: ${errBody}`);
      throw new Error(`Falha ao enviar para o Google Drive [${res.status}]`);
    }
    return (await res.json()) as { id: string; name: string; webViewLink?: string };
  });
