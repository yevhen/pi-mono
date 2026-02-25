import type { TSchema } from "@sinclair/typebox";
import { Type } from "@sinclair/typebox";
import { describe, expect, it } from "vitest";
import { convertResponsesTools } from "../src/providers/openai-responses-shared.js";
import type { Tool } from "../src/types.js";

function createTool(parameters: TSchema): Tool {
	return {
		name: "test_tool",
		description: "test",
		parameters,
	};
}

describe("convertResponsesTools", () => {
	it("adds empty properties for object schemas without properties", () => {
		const rawSchema = { type: "object" } as Record<string, unknown>;
		const parameters = rawSchema as unknown as TSchema;

		const [converted] = convertResponsesTools([createTool(parameters)]);
		const convertedParameters = (converted as { parameters: unknown }).parameters as Record<string, unknown>;

		expect(convertedParameters.properties).toEqual({});
		expect(rawSchema.properties).toBeUndefined();
	});

	it("normalizes nested object schemas without properties", () => {
		const nestedSchema = {
			type: "object",
			properties: {
				config: {
					type: "object",
				},
			},
		} as unknown as TSchema;

		const [converted] = convertResponsesTools([createTool(nestedSchema)]);
		const convertedParameters = (converted as { parameters: unknown }).parameters as Record<string, unknown>;
		const properties = convertedParameters.properties as Record<string, unknown>;
		const config = properties.config as Record<string, unknown>;

		expect(config.properties).toEqual({});
	});

	it("keeps existing properties intact", () => {
		const schema = Type.Object({
			query: Type.String(),
		});

		const [converted] = convertResponsesTools([createTool(schema)]);
		const convertedParameters = (converted as { parameters: unknown }).parameters as Record<string, unknown>;
		const properties = convertedParameters.properties as Record<string, unknown>;

		expect(Object.keys(properties)).toContain("query");
	});
});
