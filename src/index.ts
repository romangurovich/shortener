import { Router, IRequestStrict, RouterType, UniversalRoute } from 'itty-router';
import { decode, encode, generateKey } from './shorteningUtils';

export interface Env {
	SHORTENER_KV: KVNamespace;
	HOST_URL: string;
}

type CF = [env: Env, context: ExecutionContext]
const router : RouterType<UniversalRoute<IRequestStrict>> = Router<IRequestStrict, CF>();

type PostUrlRequestJSON = {
	url: string;
}
router.post('/', async(request: IRequestStrict, env: Env) : Promise<Response> => {
	const json : PostUrlRequestJSON = await request.json();

	if (!json.url) {
		return new Response('POST payload needs to be JSON with `url` property');
	}

	let url : string;

	try {
		url = new URL(json.url).toString();
	} catch {
		return new Response('malformed url');
	}

	let key : string = generateKey();
	let existing : string | null = await env.SHORTENER_KV.get(key);

	while (existing) {
		key = generateKey();
		existing = await env.SHORTENER_KV.get(key);
	}

	await env.SHORTENER_KV.put(key, url);

	const slug : string = decodeURIComponent(decode(key));
	const response : string = JSON.stringify({ url: `${env.HOST_URL}/${slug}` });

	return new Response(response, { headers: { 'content-type': 'application/json' }});
});

router.get('/favicon.ico', async(request: IRequestStrict, env: Env): Promise<any> => {
	return new Response("🐳", { status: 200 });
});

router.get("/:slug", async(request: IRequestStrict, env: Env) : Promise<Response> => {
	const slug : string = request.params.slug;
	const key : string = encode(slug);
	let url : string | null = await env.SHORTENER_KV.get(key);

	if (!url) {
		url = `${env.HOST_URL}/404`
	}

	return Response.redirect(url, 302)
});

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return router.handle(request, env, ctx).then((res: Response) => {
			console.log("HTTP Response", request.url, res.status);
			return res;
		})
	},
};
