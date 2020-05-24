import { parseDbDate } from "@/api/collection-storage/backends/directus-utils";
import { reuploadUrlToS3 } from "@/api/rpc/commands/room.import";

describe("📦 Directus tests", () => {
  it("😊 can parse dates", async () => {
    expect(parseDbDate("2020-05-08T11:10:06+00:00").toJSON()).toBeTruthy();
  });
  it("😊 can reupload images", async () => {
    const reUpload = await reuploadUrlToS3(
      "https://directus.media/dcMJTq1b80lIY4CT/1c14505d-bd26-47fb-805d-6384a4a4fe9c.png"
    );
    expect(reUpload.ok).toBe(true);
    if (reUpload.ok) {
      expect(reUpload.data.includes("https://tapesme.s3.amazonaws.com")).toBe(
        true
      );
    }
  });
});
