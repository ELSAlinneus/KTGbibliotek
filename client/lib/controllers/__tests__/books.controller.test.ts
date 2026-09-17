import { getInformationFromISBN } from "../books.controller";

jest.mock("@/lib/firebase/firebase", () => ({ db: {} }));

describe("getInformationFromISBN", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns null for an empty ISBN", async () => {
    const result = await getInformationFromISBN("");
    expect(result).toBeNull();
  });

  it("parses a successful Libris API response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        xsearch: {
          list: [{ title: "Test Book", creator: "Test Author", language: "swe", date: "2020" }],
        },
      }),
    }) as jest.Mock;

    const result = await getInformationFromISBN("978-91-000000-0-0");

    expect(result).toEqual({
      title: "Test Book",
      author: "Test Author",
      language: "swe",
      publishedYear: "2020",
    });
  });

  it("returns null when the API call fails", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 }) as jest.Mock;
    const result = await getInformationFromISBN("9789100000000");
    expect(result).toBeNull();
  });
});