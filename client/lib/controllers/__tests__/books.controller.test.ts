/**
 * @jest-environment jsdom
 */

import {
  addBook,
  deleteBook,
  getAllBooks,
  subscribeBooks,
  getInformationFromISBN,
  manageBookLoan,
  updateBookImage,
  updateBookBackCoverImage,
  updateBookReadStatus,
} from "../books.controller"; 
import { db } from "@/lib/firebase/firebase";
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { User } from "firebase/auth";

jest.mock("@/lib/firebase/firebase", () => ({
  db: {},
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  doc: jest.fn(),
  deleteDoc: jest.fn(),
  getDocs: jest.fn(),
  onSnapshot: jest.fn(),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn((val) => ({ type: "arrayUnion", value: val })),
  arrayRemove: jest.fn((val) => ({ type: "arrayRemove", value: val })),
}));

describe("Books Controller", () => {
  const originalAlert = window.alert;
  const originalConfirm = window.confirm;

  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
    window.confirm = jest.fn();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    window.alert = originalAlert;
    window.confirm = originalConfirm;
    jest.restoreAllMocks();
  });

  const createMockFormEvent = (formDataMap: Record<string, string>) => {
    const map = new Map(Object.entries(formDataMap));
    global.FormData = jest.fn().mockImplementation(() => ({
      get: (key: string) => map.get(key) ?? null,
    })) as unknown as typeof FormData;

    return {
      currentTarget: {} as HTMLFormElement,
    } as React.FormEvent<HTMLFormElement>;
  };

  const setupFileReaderMock = (resultUrl: string = "data:image/png;base64,mocked", fail: boolean = false) => {
    class MockFileReader {
      result: string = "";
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      readAsDataURL() {
        setTimeout(() => {
          if (fail) {
            this.onerror?.();
          } else {
            this.result = resultUrl;
            this.onload?.();
          }
        }, 0);
      }
    }
    global.FileReader = MockFileReader as unknown as typeof FileReader;
  };

  // ==========================================
  // addBook()
  // ==========================================
  describe("addBook", () => {
    const mockUser = { uid: "user-123" } as User;

    it("validates required fields (title, author, isbn) and warns if they are missing", async () => {
      const event = createMockFormEvent({
        title: "",
        author: "Karin Boye",
        isbn: "9789100000000",
      });

      const result = await addBook(event, mockUser);

      expect(window.alert).toHaveBeenCalledWith(
        "Please fill in all required fields (title, author, isbn)."
      );
      expect(result).toBeNull();
      expect(addDoc).not.toHaveBeenCalled();
    });

    it("returns null and logs an error if the user is null (not logged in)", async () => {
      const event = createMockFormEvent({
        title: "Kallocain",
        author: "Karin Boye",
        isbn: "9789100000000",
      });

      const result = await addBook(event, null);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith("User is not authenticated. Cannot add book.");
      expect(addDoc).not.toHaveBeenCalled();
    });

    it("returns null and shows an alert if the book cover image exceeds 262,500 bytes", async () => {
      const event = createMockFormEvent({
        title: "Kallocain",
        author: "Karin Boye",
        isbn: "9789100000000",
      });
      const oversizedBlob = new Blob(["x".repeat(262501)], { type: "image/jpeg" });

      const result = await addBook(event, mockUser, oversizedBlob);

      expect(window.alert).toHaveBeenCalledWith("Bokomslaget är för stort. Välj en mindre bild.");
      expect(result).toBeNull();
      expect(addDoc).not.toHaveBeenCalled();
    });

    it("adds a book to the database with front and back cover images and returns the book", async () => {
      setupFileReaderMock("data:image/jpeg;base64,validimage");

      const event = createMockFormEvent({
        title: "Aniara",
        author: "Harry Martinson",
        publisher: "Bonniers",
        isbn: "9789100123456",
        language: "sv",
        publicationYear: "1956",
      });

      (collection as jest.Mock).mockReturnValue("BooksColRef");
      (addDoc as jest.Mock).mockResolvedValueOnce({ id: "book-doc-789" });

      const frontBlob = new Blob(["front"], { type: "image/jpeg" });
      const backBlob = new Blob(["back"], { type: "image/jpeg" });

      const result = await addBook(event, mockUser, frontBlob, backBlob);

      expect(addDoc).toHaveBeenCalledWith("BooksColRef", {
        Title: "Aniara",
        Author: "Harry Martinson",
        Publisher: "Bonniers",
        ISBN: "9789100123456",
        Language: "sv",
        Year_of_publication: 1956,
        ImageURL: "data:image/jpeg;base64,validimage",
        BackCoverImageURL: "data:image/jpeg;base64,validimage",
        Owner: "user-123",
        Borrowed: false,
        Current_custody: "user-123",
        Readers: [],
      });

      expect(window.alert).toHaveBeenCalledWith("Boken har lagts till i biblioteket!");
      expect(result).toEqual({
        id: "book-doc-789",
        Title: "Aniara",
        Author: "Harry Martinson",
        Publisher: "Bonniers",
        ISBN: "9789100123456",
        Language: "sv",
        Year_of_publication: 1956,
        ImageURL: "data:image/jpeg;base64,validimage",
        BackCoverImageURL: "data:image/jpeg;base64,validimage",
        Owner: "user-123",
        Borrowed: false,
        Current_custody: "user-123",
        Readers: [],
      });
    });

    it("handles and shows an error message if FileReader or Firestore throws an error", async () => {
      const event = createMockFormEvent({
        title: "Aniara",
        author: "Harry Martinson",
        isbn: "9789100123456",
      });

      (addDoc as jest.Mock).mockRejectedValueOnce(new Error("Network timeout"));

      const result = await addBook(event, mockUser);

      expect(window.alert).toHaveBeenCalledWith("Error adding book: Network timeout");
      expect(result).toBeNull();
    });
  });

  // ==========================================
  // deleteBook()
  // ==========================================
  describe("deleteBook", () => {
    it("deletes the book when the user clicks OK in the confirm dialog", async () => {
      (window.confirm as jest.Mock).mockReturnValue(true);
      (doc as jest.Mock).mockReturnValue("BookDocRef");
      (deleteDoc as jest.Mock).mockResolvedValueOnce(undefined);

      const success = await deleteBook("book-123");

      expect(window.confirm).toHaveBeenCalledWith(
        "Är du säker på att du vill ta bort denna bok? Du kan inte ångra dig."
      );
      expect(doc).toHaveBeenCalledWith(db, "Books", "book-123");
      expect(deleteDoc).toHaveBeenCalledWith("BookDocRef");
      expect(success).toBe(true);
    });

    it("does not delete the book when the user clicks Cancel in the confirm dialog", async () => {
      (window.confirm as jest.Mock).mockReturnValue(false);

      const success = await deleteBook("book-123");

      expect(deleteDoc).not.toHaveBeenCalled();
      expect(success).toBe(false);
    });

    it("logs and returns false if deleteDoc throws an error", async () => {
      (window.confirm as jest.Mock).mockReturnValue(true);
      (deleteDoc as jest.Mock).mockRejectedValueOnce(new Error("Permission denied"));

      const success = await deleteBook("book-123");

      expect(console.error).toHaveBeenCalled();
      expect(success).toBe(false);
    });
  });

  // ==========================================
  // getAllBooks() & subscribeBooks()
  // ==========================================
  describe("getAllBooks & subscribeBooks", () => {
    it("getAllBooks returns all books mapped with their ID", async () => {
      (getDocs as jest.Mock).mockResolvedValueOnce({
        docs: [
          { id: "b1", data: () => ({ Title: "Bok Ett", Author: "Författare A" }) },
          { id: "b2", data: () => ({ Title: "Bok Två", Author: "Författare B" }) },
        ],
      });

      const books = await getAllBooks();

      expect(books).toEqual([
        { id: "b1", Title: "Bok Ett", Author: "Författare A" },
        { id: "b2", Title: "Bok Två", Author: "Författare B" },
      ]);
    });

    it("subscribeBooks subscribes to book updates and triggers the callback on change", () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      (onSnapshot as jest.Mock).mockImplementation((_query, cb) => {
        cb({
          docs: [{ id: "b1", data: () => ({ Title: "Bok I Realtid" }) }],
        });
        return mockUnsubscribe;
      });

      const unsubscribe = subscribeBooks(mockCallback);

      expect(mockCallback).toHaveBeenCalledWith([{ id: "b1", Title: "Bok I Realtid" }]);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  // ==========================================
  // manageBookLoan()
  // ==========================================
  describe("manageBookLoan", () => {
    it("updates the loan status and borrower of the book", async () => {
      (doc as jest.Mock).mockReturnValue("BookDocRef");
      (updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

      const success = await manageBookLoan("book-100", "borrower-200", true);

      expect(doc).toHaveBeenCalledWith(db, "Books", "book-100");
      expect(updateDoc).toHaveBeenCalledWith("BookDocRef", {
        Borrowed: true,
        Current_custody: "borrower-200",
      });
      expect(success).toBe(true);
    });

    it("returns false and logs an error if updateDoc fails", async () => {
      (updateDoc as jest.Mock).mockRejectedValueOnce(new Error("Firestore write error"));

      const success = await manageBookLoan("book-100", null, false);

      expect(console.error).toHaveBeenCalled();
      expect(success).toBe(false);
    });
  });

  // ==========================================
  // updateBookImage & updateBookBackCoverImage
  // ==========================================
  describe("updateBookImage & updateBookBackCoverImage", () => {
    it("updates the book's front cover image and returns the data URL", async () => {
      setupFileReaderMock("data:image/jpeg;base64,front-cover-data");
      (doc as jest.Mock).mockReturnValue("BookDocRef");
      (updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

      const blob = new Blob(["img"], { type: "image/jpeg" });
      const url = await updateBookImage("book-1", blob);

      expect(updateDoc).toHaveBeenCalledWith("BookDocRef", {
        ImageURL: "data:image/jpeg;base64,front-cover-data",
      });
      expect(url).toBe("data:image/jpeg;base64,front-cover-data");
    });

    it("sets an empty string if no blob is passed to updateBookImage", async () => {
      (doc as jest.Mock).mockReturnValue("BookDocRef");
      (updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

      const url = await updateBookImage("book-1", undefined);

      expect(updateDoc).toHaveBeenCalledWith("BookDocRef", { ImageURL: "" });
      expect(url).toBe("");
    });

    it("updates the book's back cover image and returns the data URL", async () => {
      setupFileReaderMock("data:image/jpeg;base64,back-cover-data");
      (doc as jest.Mock).mockReturnValue("BookDocRef");
      (updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

      const blob = new Blob(["img"], { type: "image/jpeg" });
      const url = await updateBookBackCoverImage("book-1", blob);

      expect(updateDoc).toHaveBeenCalledWith("BookDocRef", {
        BackCoverImageURL: "data:image/jpeg;base64,back-cover-data",
      });
      expect(url).toBe("data:image/jpeg;base64,back-cover-data");
    });

    it("throws an error if the blob exceeds MAX_COVER_IMAGE_BYTES (262 500 bytes)", async () => {
      const hugeBlob = new Blob(["x".repeat(262501)], { type: "image/jpeg" });

      await expect(updateBookImage("book-1", hugeBlob)).rejects.toThrow(
        "Bokomslaget är för stort. Välj en mindre bild."
      );
      expect(updateDoc).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // updateBookReadStatus()
  // ==========================================
  describe("updateBookReadStatus", () => {
    it("adds the user to the Readers array with arrayUnion when hasRead is true", async () => {
      (doc as jest.Mock).mockReturnValue("BookDocRef");
      (updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

      const success = await updateBookReadStatus("book-1", "user-42", true);

      expect(arrayUnion).toHaveBeenCalledWith("user-42");
      expect(updateDoc).toHaveBeenCalledWith("BookDocRef", {
        Readers: expect.objectContaining({ type: "arrayUnion", value: "user-42" }),
      });
      expect(success).toBe(true);
    });

    it("removes the user from the Readers array with arrayRemove when hasRead is false", async () => {
      (doc as jest.Mock).mockReturnValue("BookDocRef");
      (updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

      const success = await updateBookReadStatus("book-1", "user-42", false);

      expect(arrayRemove).toHaveBeenCalledWith("user-42");
      expect(updateDoc).toHaveBeenCalledWith("BookDocRef", {
        Readers: expect.objectContaining({ type: "arrayRemove", value: "user-42" }),
      });
      expect(success).toBe(true);
    });

    it("returns false and logs an error if updateDoc fails", async () => {
      (updateDoc as jest.Mock).mockRejectedValueOnce(new Error("Update failed"));

      const success = await updateBookReadStatus("book-1", "user-42", true);

      expect(console.error).toHaveBeenCalled();
      expect(success).toBe(false);
    });
  });
  
  // ==========================================
  // getInformationFromISBN()
  // ==========================================
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
            list: [{ title: "Test Book", creator: "Test Author", publisher: "Test Publisher", language: "swe", date: "2020" }],
          },
        }),
      }) as jest.Mock;
  
      const result = await getInformationFromISBN("978-91-000000-0-0");
  
      expect(result).toEqual({
        title: "Test Book",
        author: "Test Author",
        publisher: "Test Publisher",
        language: "swe",
        publishedYear: "2020",
      });
    });
  
    it("returns null when the API call fails", async () => {
      jest.spyOn(console, "error").mockImplementation(() => {});
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 }) as jest.Mock;
      const result = await getInformationFromISBN("9789100000000");
      expect(result).toBeNull();
    });
  });
});

