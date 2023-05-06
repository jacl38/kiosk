import { TestEnvironment } from "jest-environment-jsdom"
import { TextEncoder, TextDecoder } from "util";

export default class CustomTestEnvironment extends TestEnvironment {
	async setup() {
		await super.setup();
		if(typeof this.global.TextEncoder === "undefined") {
			this.global.TextEncoder = TextEncoder;
		}
		if(typeof this.global.TextDecoder === "undefined") {
			this.global.TextDecoder = TextDecoder;
		}
	}
}