import { classifyExplorerQuery } from "./explorerQuery";

describe("explorerQuery/classifyExplorerQuery", () => {
  test("unknown for empty", () => {
    expect(classifyExplorerQuery(" ")).toBe("unknown");
  });

  test("address for System Program pubkey", () => {
    expect(classifyExplorerQuery("11111111111111111111111111111111")).toBe(
      "address"
    );
  });
});
