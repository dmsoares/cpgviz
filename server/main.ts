import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";
import { oakCors } from "jsr:@tajpouria/cors";
import routeStaticFilesFrom from "./util/routeStaticFilesFrom.ts";
import { query } from "./joern-client.ts";
import { nodesToDot } from "./util/to-dot.ts";

export const app = new Application();
const router = new Router();

router.get("/init", async (ctx) => {
  const res = await query('open("X42.c")');

  ctx.response.headers.set("Content-Type", "text/plain");
  ctx.response.body = res;
});

const MODES = ["ast", "ddg", "cfg", "pdg", "cdg", "cpg14"] as const;

type Mode = typeof MODES[number];

const isMode = (mode: unknown): mode is Mode => MODES.includes(mode as Mode);

const getDot = async ({ id, mode }: { id?: string; mode: string | null }) => {
  const serializedModes: Record<Mode, string> = {
    ast: "Ast",
    ddg: "Ddg",
    cfg: "Cfg",
    pdg: "Pdg",
    cdg: "Cdg",
    cpg14: "Cpg14",
  };

  const serializedMode = isMode(mode) ? serializedModes[mode] : "Ast";

  const queryString = id
    ? `cpg.method.id(${id}L).l.dot${serializedMode}.l`
    : `cpg.method.l.dot${serializedMode}.l`;

  const res = await query(queryString);
  return res.split("=").slice(1).join("=").slice(12, -6);
};

router.get("/methods", async (ctx) => {
  const res = await query("cpg.method.l.toJsonPretty");
  const methods = res.split("=").slice(1).join("=").slice(4, -4);

  ctx.response.headers.set("Content-Type", "text/plain");
  ctx.response.body = nodesToDot(JSON.parse(methods));
});

router.get("/methods/:id", async (ctx) => {
  const { id } = ctx.params;
  const mode = ctx.request.url.searchParams.get("mode");

  if (!isMode(mode)) {
    ctx.response.status = 400;
    ctx.response.body = "Invalid mode";
    return;
  }

  const dot = await getDot({ id, mode });

  ctx.response.headers.set("Content-Type", "text/plain");
  ctx.response.body = dot;
});

app.use(oakCors());
app.use(router.routes());
app.use(routeStaticFilesFrom([
  `${Deno.cwd()}/client/dist`,
  `${Deno.cwd()}/client/public`,
]));

if (import.meta.main) {
  console.log("Server listening on port http://localhost:8000");
  await app.listen({ port: 8000 });
}
