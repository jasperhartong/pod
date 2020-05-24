import { parseDbDate } from "../api/collection-storage/backends/directus-utils";

describe("📦 Directus tests", () => {
  it("😊 can parse dates", async () => {
    expect(parseDbDate("2020-05-08T11:10:06+00:00").toJSON()).toBeTruthy();
  });
});
