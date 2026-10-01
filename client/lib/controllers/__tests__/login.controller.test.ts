/**
 * @jest-environment jsdom
 */

import { login, logout, createAccount } from "../login.controller";
import { auth, db } from "@/lib/firebase/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

jest.mock("@/lib/firebase/firebase", () => ({
  auth: {
    signOut: jest.fn(),
  },
  db: {},
}));

jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
}));

describe("Auth Controller", () => {
  const originalAlert = window.alert;

  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    window.alert = originalAlert;
    jest.restoreAllMocks();
  });

  // ==========================================
  // login()
  // ==========================================
  describe("login", () => {
    it("calls signInWithEmailAndPassword with correct credentials when login is successful", async () => {
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
        user: { uid: "123", email: "test@example.com" },
      });

      await expect(login("test@example.com", "password123")).resolves.toBeUndefined();
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, "test@example.com", "password123");
    });

    it.each([
      "auth/invalid-credential",
      "auth/invalid-email",
      "auth/user-not-found",
      "auth/wrong-password",
    ])("throws a user-friendly error message for error code %s", async (code) => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({ code });

      await expect(login("test@example.com", "wrong")).rejects.toThrow(
        "Fel mejladress eller lösenord. Försök igen."
      );
    });

    it("throws a general error message for unexpected auth errors or network errors", async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
        code: "auth/network-request-failed",
      });

      await expect(login("test@example.com", "pass")).rejects.toThrow(
        "Det gick inte att logga in just nu. Försök igen senare."
      );
    });
  });

  // ==========================================
  // logout()
  // ==========================================
  describe("logout", () => {
    it("calls auth.signOut and logs out", async () => {
      (auth.signOut as jest.Mock).mockResolvedValueOnce(undefined);

      await logout();

      expect(auth.signOut).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================
  // createAccount()
  // ==========================================
  describe("createAccount", () => {
    const createMockFormEvent = (formDataMap: Record<string, string>) => {
      const formData = new Map(Object.entries(formDataMap));

      global.FormData = jest.fn().mockImplementation(() => ({
        get: (key: string) => formData.get(key) ?? null,
      })) as unknown as typeof FormData;

      return {
        preventDefault: jest.fn(),
        currentTarget: {} as HTMLFormElement,
      } as unknown as React.FormEvent<HTMLFormElement>;
    };

    it("alerts the user and cancels the form submission if passwords do not match", async () => {
      const event = createMockFormEvent({
        email: "test@example.com",
        password: "password123",
        confirmPassword: "passwordMismatch",
      });

      await createAccount(event);

      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(window.alert).toHaveBeenCalledWith("Lösenorden matchar inte!");
      expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
      expect(setDoc).not.toHaveBeenCalled();
    });

    it("creates a new user and saves their profile document in Firestore", async () => {
      const fakeUser = { uid: "user-123", email: "test@example.com" };
      const fakeDocRef = { id: "user-123" };

      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
        user: fakeUser,
      });
      (doc as jest.Mock).mockReturnValueOnce(fakeDocRef);
      (setDoc as jest.Mock).mockResolvedValueOnce(undefined);

      const event = createMockFormEvent({
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      });

      const result = await createAccount(event);

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        "test@example.com",
        "Password123!"
      );
      expect(doc).toHaveBeenCalledWith(db, "users", "user-123");
      expect(setDoc).toHaveBeenCalledWith(
        fakeDocRef,
        expect.objectContaining({
          email: "test@example.com",
          uid: "user-123",
          createdAt: expect.any(Date),
        })
      );
      expect(result).toEqual(fakeUser);
    });

    it("alerts the user when the error code is 'auth/weak-password'", async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
        code: "auth/weak-password",
        message: "Password is too weak",
      });

      const event = createMockFormEvent({
        email: "test@example.com",
        password: "123",
        confirmPassword: "123",
      });

      await createAccount(event);

      expect(window.alert).toHaveBeenCalledWith("Lösenordet är för svagt.");
      expect(setDoc).not.toHaveBeenCalled();
    });

    it("alerts the user when the error code is 'auth/email-already-in-use'", async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
        code: "auth/email-already-in-use",
        message: "Email already in use",
      });

      const event = createMockFormEvent({
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      });

      await createAccount(event);

      expect(window.alert).toHaveBeenCalledWith(
        "E-postadressen används redan av ett annat konto."
      );
      expect(setDoc).not.toHaveBeenCalled();
    });

    it("alerts the user with a general message for other unknown errors", async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
        code: "auth/internal-error",
        message: "Internal error",
      });

      const event = createMockFormEvent({
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      });

      await createAccount(event);

      expect(window.alert).toHaveBeenCalledWith(
        "Något gick fel när kontot skulle skapas. Försök igen."
      );
    });
  });
});