import uuid from "react-native-uuid";

/**
 * partysocket reads a bare `crypto.randomUUID` which throws a ReferenceError on
 * Hermes (no global `crypto`). Provide the one function it needs.
 */
const g = globalThis as any;
if (typeof g.crypto === "undefined") {
  g.crypto = { randomUUID: () => uuid.v4() as string };
} else if (typeof g.crypto.randomUUID !== "function") {
  g.crypto.randomUUID = () => uuid.v4() as string;
}
