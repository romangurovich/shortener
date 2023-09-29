function base64ToBytes(base64: string) : Uint8Array {
	const binString : string = atob(base64);
	return Uint8Array.from(binString, (char : string) => char.charCodeAt(0));
}

function bytesToBase64(bytes: Uint8Array) : string {
	const binString = String.fromCodePoint(...bytes);
	return btoa(binString);
}

const seaCreatures : string = "🐳,🐋,🐬,🦭,🐟,🐠,🐡,🦈,🐙,🐚,🪸,🪼";
const gardenCreatures : string = "🐌,🦋,🐛,🐜,🐝,🪲,🐞,🦂,🕷";
const fanFavoriteCreatures : string = "🦥,🦦,🦨,🦘,🦡,🐿,🦔,🦄,🐒,🦍,🦧,🐇,🐘,🦆,🦜";
const KEY_LENGTH : number = 6; // supports 2+ billion unique short urls
const KEYPOINTS : string[] = `${seaCreatures},${gardenCreatures},${fanFavoriteCreatures}`
	.split(',');

function randomKeypoint() : string {
	return KEYPOINTS[Math.floor(Math.random() * KEYPOINTS.length)];
}

export function encode (url: string): string {
	return bytesToBase64(new TextEncoder().encode(url));
}

export function decode (key: string): string {
	return new TextDecoder().decode(base64ToBytes(key));
}

export function generateKey(keyLen : number = KEY_LENGTH) : string {
	let emojis : string = '';

	for (let i : number = 0; i < keyLen; i++) {
		emojis += randomKeypoint()
	}

	return encode(encodeURIComponent(emojis));
}
