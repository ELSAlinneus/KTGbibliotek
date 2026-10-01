/**
 * @jest-environment jsdom
 */

import {
  handleUsernameChange,
  handleUserProfileChange,
  handleUserProfilePictureChange,
  getUserBooks,
  getUserBorrowedBooks,
  getUserProfilePicture,
  getUserByUid,
  getAllUsers,
} from "../user.controller"; 
import { auth, db } from "@/lib/firebase/firebase";
import { updateProfile, User } from "firebase/auth";
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  QueryDocumentSnapshot,
  setDoc,
} from "@firebase/firestore";

jest.mock("@/lib/firebase/firebase", () => ({
  auth: {
    currentUser: null,
  },
  db: {},
}));

jest.mock("firebase/auth", () => ({
  updateProfile: jest.fn(),
}));

jest.mock("@firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
}));

// Typat alias för den mockade auth-instansen
type MockedAuth = {
  currentUser: Partial<User> | null;
};

describe("User & Profile Controller", () => {
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

  const setupFileReaderMock = (
    resultUrl: string = "data:image/jpeg;base64,abc",
    shouldFail: boolean = false
  ) => {
    class MockFileReader {
      result: string = "";
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      readAsDataURL() {
        setTimeout(() => {
          if (shouldFail) {
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
  // handleUsernameChange
  // ==========================================
  describe("handleUsernameChange", () => {
    const mockUser = { uid: "user-123" } as unknown as User;

    it("updates the user's username in both Firestore and Firebase Auth", async () => {
      (doc as jest.Mock).mockReturnValue("userDocRef");
      (setDoc as jest.Mock).mockResolvedValueOnce(undefined);
      (updateProfile as jest.Mock).mockResolvedValueOnce(undefined);

      await handleUsernameChange(mockUser, "  Kalle Anka  ");

      expect(doc).toHaveBeenCalledWith(db, "users", "user-123");
      expect(setDoc).toHaveBeenCalledWith("userDocRef", { username: "Kalle Anka" }, { merge: true });
      expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: "Kalle Anka" });
    });

    it("throws an error if the username is empty or only whitespace", async () => {
      await expect(handleUsernameChange(mockUser, "   ")).rejects.toThrow(
        "Användarnamn kan inte vara tomt."
      );
      expect(setDoc).not.toHaveBeenCalled();
    });

    it("throws an error if the username is longer than 50 characters", async () => {
      const longUsername = "a".repeat(51);
      await expect(handleUsernameChange(mockUser, longUsername)).rejects.toThrow(
        "Användarnamnet är för långt."
      );
      expect(setDoc).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // handleUserProfileChange
  // ==========================================
  describe("handleUserProfileChange", () => {
    it("throws an error if no user is currently signed in", async () => {
      (auth as unknown as MockedAuth).currentUser = null;

      await expect(
        handleUserProfileChange({
          userId: "1",
          displayName: "Nytt Namn",
          email: "test@test.com",
          photoURL: "",
          bio: "",
          phone: "",
        })
      ).rejects.toThrow("No user is currently signed in.");
    });

    it("cancels the update if the user cancels the confirm dialog", async () => {
      (auth as unknown as MockedAuth).currentUser = { uid: "user-1", displayName: "Gammalt" };
      (window.confirm as jest.Mock).mockReturnValue(false);

      await handleUserProfileChange({
        userId: "user-1",
        displayName: "Nytt Namn",
        email: "test@test.com",
        photoURL: "",
        bio: "",
        phone: "",
      });

      expect(setDoc).not.toHaveBeenCalled();
    });

    it("only updates the fields that have actually changed (username, phone, bio)", async () => {
      (auth as unknown as MockedAuth).currentUser = {
        uid: "user-1",
        displayName: "Samma Namn",
        phoneNumber: "111",
      };
      (window.confirm as jest.Mock).mockReturnValue(true);
      (doc as jest.Mock).mockReturnValue("userDocRef");
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ bio: "Gammal bio" }),
      });

      await handleUserProfileChange({
        userId: "user-1",
        displayName: "Samma Namn", 
        email: "test@test.com",
        photoURL: "",
        phone: "999", 
        bio: "Ny uppdaterad bio", 
      });

      expect(updateProfile).not.toHaveBeenCalled(); 
      expect(setDoc).toHaveBeenCalledWith("userDocRef", { phone: "999" }, { merge: true });
      expect(setDoc).toHaveBeenCalledWith("userDocRef", { bio: "Ny uppdaterad bio" }, { merge: true });
    });
  });

  // ==========================================
  // handleUserProfilePictureChange
  // ==========================================
  describe("handleUserProfilePictureChange", () => {
    it("returns false if no user is currently signed in", async () => {
      (auth as unknown as MockedAuth).currentUser = null;

      const res = await handleUserProfilePictureChange({
        userId: "1",
        displayName: "Test",
        email: "",
        photoURL: "url",
        bio: "",
        phone: "",
      });

      expect(res).toBe(false);
      expect(console.error).toHaveBeenCalledWith("No user is currently signed in.");
    });

    it("returns false if the user cancels the confirm dialog", async () => {
      (auth as unknown as MockedAuth).currentUser = { uid: "user-1" };
      (window.confirm as jest.Mock).mockReturnValue(false);

      const res = await handleUserProfilePictureChange({
        userId: "user-1",
        displayName: "Test",
        email: "",
        photoURL: "url",
        bio: "",
        phone: "",
      });

      expect(res).toBe(false);
      expect(setDoc).not.toHaveBeenCalled();
    });

    it("saves the profile picture in Firestore when the blob is converted correctly", async () => {
      (auth as unknown as MockedAuth).currentUser = { uid: "user-1" };
      (window.confirm as jest.Mock).mockReturnValue(true);
      (doc as jest.Mock).mockReturnValue("userDocRef");
      (setDoc as jest.Mock).mockResolvedValueOnce(undefined);

      setupFileReaderMock("data:image/jpeg;base64,validdata");

      const dummyBlob = new Blob(["pic"], { type: "image/jpeg" });
      const res = await handleUserProfilePictureChange(
        { userId: "user-1", displayName: "Test", email: "", photoURL: "", bio: "", phone: "" },
        dummyBlob
      );

      expect(setDoc).toHaveBeenCalledWith(
        "userDocRef",
        { profilePicture: "data:image/jpeg;base64,validdata" },
        { merge: true }
      );
      expect(res).toBe(true);
    });

    it("shows an alert and cancels the update if the image string exceeds 250 000 characters", async () => {
      (auth as unknown as MockedAuth).currentUser = { uid: "user-1" };
      (window.confirm as jest.Mock).mockReturnValue(true);

      const massiveString = "a".repeat(250001);
      const res = await handleUserProfilePictureChange({
        userId: "user-1",
        displayName: "Test",
        email: "",
        photoURL: massiveString,
        bio: "",
        phone: "",
      });

      expect(window.alert).toHaveBeenCalledWith("Profilbilden är för stor. Välj en mindre bild.");
      expect(res).toBe(false);
      expect(setDoc).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // getUserProfilePicture & getUserByUid
  // ==========================================
  describe("getUserProfilePicture & getUserByUid", () => {
    it("getUserProfilePicture returns image-URL or empty string if document is not found", async () => {
      (doc as jest.Mock).mockReturnValue("userDocRef");
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ profilePicture: "https://example.com/pic.jpg" }),
      });

      const pic = await getUserProfilePicture("user-1");
      expect(pic).toBe("https://example.com/pic.jpg");

      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => false,
      });

      const emptyPic = await getUserProfilePicture("user-not-found");
      expect(emptyPic).toBe("");
    });

    it("getUserByUid returns a PublicUserProfile", async () => {
      (doc as jest.Mock).mockReturnValue("userDocRef");
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          uid: "user-123",
          username: "Anna",
          email: "anna@example.com",
          profilePicture: "pic.png",
          bio: "Hej!",
          phone: "0701234567",
        }),
      });

      const profile = await getUserByUid("user-123");

      expect(profile).toEqual({
        userId: "user-123",
        displayName: "Anna",
        email: "anna@example.com",
        photoURL: "pic.png",
        bio: "Hej!",
        phone: "0701234567",
      });
    });

    it("getUserByUid falls back to email if username is missing", async () => {
      (doc as jest.Mock).mockReturnValue("userDocRef");
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          uid: "user-123",
          email: "fallback@example.com",
        }),
      });

      const profile = await getUserByUid("user-123");
      expect(profile?.displayName).toBe("fallback@example.com");
    });

    it("getUserByUid returns null if the document is not found", async () => {
      (doc as jest.Mock).mockReturnValue("userDocRef");
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => false,
      });

      const profile = await getUserByUid("unknown");
      expect(profile).toBeNull();
    });
  });

  // ==========================================
  // getUserBooks & getUserBorrowedBooks
  // ==========================================
  describe("getUserBooks & getUserBorrowedBooks", () => {
    const mockBookDocs = [
      { id: "b1", data: () => ({ Title: "Min Bok", Owner: "my-uid", Current_custody: "my-uid" }) },
      { id: "b2", data: () => ({ Title: "Annan Bok", Owner: "other-uid", Current_custody: "my-uid" }) },
      { id: "b3", data: () => ({ Title: "Utlånad Bok", Owner: "my-uid", Current_custody: "other-uid" }) },
    ];

    beforeEach(() => {
      (auth as unknown as MockedAuth).currentUser = { uid: "my-uid" };
      (collection as jest.Mock).mockReturnValue("booksRef");
    });

    it("getUserBooks only returns books where Owner matches the current user", async () => {
      (getDocs as jest.Mock).mockResolvedValueOnce({
        forEach: (cb: (docSnapshot: QueryDocumentSnapshot<DocumentData>) => void) =>
          mockBookDocs.forEach((d) => cb(d as unknown as QueryDocumentSnapshot<DocumentData>)),
      });

      const books = await getUserBooks();

      expect(books).toHaveLength(2);
      expect(books.map((b) => b.id)).toEqual(["b1", "b3"]);
    });

    it("getUserBorrowedBooks returns books where Current_custody is the user but Owner is not the user", async () => {
      (getDocs as jest.Mock).mockResolvedValueOnce({
        forEach: (cb: (docSnapshot: QueryDocumentSnapshot<DocumentData>) => void) =>
          mockBookDocs.forEach((d) => cb(d as unknown as QueryDocumentSnapshot<DocumentData>)),
      });

      const borrowed = await getUserBorrowedBooks();

      expect(borrowed).toHaveLength(1);
      expect(borrowed[0].id).toBe("b2");
      expect(borrowed[0].Title).toBe("Annan Bok");
    });
  });

  // ==========================================
  // getAllUsers
  // ==========================================
  describe("getAllUsers", () => {
    it("fetches and transforms all user documents from Firestore", async () => {
      (collection as jest.Mock).mockReturnValue("usersRef");
      (getDocs as jest.Mock).mockResolvedValueOnce({
        forEach: (cb: (docSnapshot: QueryDocumentSnapshot<DocumentData>) => void) => {
          const docs = [
            { data: () => ({ uid: "u1", username: "Stina", email: "stina@test.com" }) },
            { data: () => ({ uid: "u2", email: "utan-namn@test.com" }) },
          ];
          docs.forEach((d) => cb(d as unknown as QueryDocumentSnapshot<DocumentData>));
        },
      });

      const users = await getAllUsers();

      expect(users).toHaveLength(2);
      expect(users[0].displayName).toBe("Stina");
      expect(users[1].displayName).toBe("utan-namn@test.com");
    });
  });
});