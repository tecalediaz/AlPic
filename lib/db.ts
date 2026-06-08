import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | null = null;

function getClient(): NeonQueryFunction<false, false> {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL no está configurada");
    }
    client = neon(url);
  }
  return client;
}

/** Cliente SQL lazy: solo conecta en runtime, no durante el build. */
export const sql: NeonQueryFunction<false, false> = ((
  strings: TemplateStringsArray,
  ...params: unknown[]
) => getClient()(strings, ...params)) as NeonQueryFunction<false, false>;
