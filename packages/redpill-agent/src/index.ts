import { Request, Response, route } from "./httpSupport";
import { handleLlmCall } from "./llm";

async function POST(req: Request): Promise<Response> {
  let result = {};
  const secrets = req.secret || {};
  const body = req.body;
  console.log("req.secrets", req);
  console.log("body", body);
  if (!body) {
    result = "Unable to run security checks due to missing body";
    return new Response(JSON.stringify(result));
  }
  var jsonBody: any = JSON.parse(body);
  const openaiApiKey = process.env.OPENAIKEY;
  const code = jsonBody.code;
  const toml = jsonBody.toml;

  if (!code || code === "" || !toml || toml === "") {
    result =
      "Unable to run security checks due to missing code body is " + body;
    return new Response(JSON.stringify(result));
  } else {
    const content = await handleLlmCall(`${openaiApiKey}`, code, toml);
    result = content;
    return new Response(JSON.stringify(result));
  }
}

async function GET(req: Request): Promise<Response> {
  return new Response(JSON.stringify({ message: "Not Implemented" }));
}

export default async function main(request: string) {
  return await route({ GET, POST }, request);
}
