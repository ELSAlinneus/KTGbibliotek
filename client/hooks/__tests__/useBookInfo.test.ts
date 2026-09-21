/**
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import type { User, NextOrObserver } from "firebase/auth";
import { useBookInfo } from "@/hooks/useBookInfo";
import { auth } from "@/lib/firebase/firebase";
import { getUserByUid } from "@/lib/controllers/user.controller";
import {
    updateBookReadStatus,
    updateBookImage,
} from "@/lib/controllers/books.controller";
import type { Book } from "@/lib/types/Book";
import type { PublicUserProfile } from "@/lib/types/Profile";

jest.mock("@/lib/firebase/firebase", () => ({
    auth: {
        onAuthStateChanged: jest.fn(),
    },
}));

jest.mock("@/lib/controllers/user.controller", () => ({
    getUserByUid: jest.fn(),
}));

jest.mock("@/lib/controllers/books.controller", () => ({
    updateBookReadStatus: jest.fn(),
    updateBookImage: jest.fn(),
    updateBookBackCoverImage: jest.fn(),
}));

const mockedOnAuthStateChanged = auth.onAuthStateChanged as jest.MockedFunction<
    typeof auth.onAuthStateChanged
>;
const mockedGetUserByUid = getUserByUid as jest.MockedFunction<
      typeof getUserByUid
>;
const mockedUpdateBookReadStatus = updateBookReadStatus as jest.MockedFunction<
      typeof updateBookReadStatus
>;
const mockedUpdateBookImage = updateBookImage as jest.MockedFunction<
      typeof updateBookImage
>;

const mockBook: Book = {
    id: "book-123",
    Title: "Test Book",
    Author: "Test Author",
    Publisher: "Test Publisher",
    Language: "swe",
    Year_of_publication: 2020,
    ISBN: "978-91-000000-0-0",
    Borrowed: false,
    Owner: "owner-1",
    Current_custody: "custody-1",
    ImageURL: "https://example.com/cover.jpg",
    BackCoverImageURL: "https://example.com/back.jpg",
    Readers: ["user-2"],
};

describe("useBookInfo", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockedOnAuthStateChanged.mockImplementation(
            (observerOrNext: NextOrObserver<User>) => {
                if (typeof observerOrNext === "function") {
                    observerOrNext(null);
                }
                return jest.fn();
            }
        );
    });

    it("sets userId and computes hasRead when user is authenticated", () => {
        const fakeFirebaseUser = { uid: "user-2" } as User;

        mockedOnAuthStateChanged.mockImplementation(
            (observerOrNext: NextOrObserver<User>) => {
                if (typeof observerOrNext === "function") {
                    observerOrNext(fakeFirebaseUser);
                }
                return jest.fn();
            }
        );

        const { result } = renderHook(() => useBookInfo(mockBook));

        expect(result.current.userId).toBe("user-2");
        expect(result.current.hasRead).toBe(true);
    });

    it("fetches the owner profile on mount", async () => {
        const mockProfile: PublicUserProfile = {
            userId: "owner-1",
            displayName: "Name",
        };

        mockedGetUserByUid.mockResolvedValue(mockProfile);

        const { result } = renderHook(() => useBookInfo(mockBook));

        await waitFor(() => {
            expect(result.current.ownerProfile).toEqual(mockProfile);
            expect(result.current.isOwnerProfileLoading).toBe(false);
        });

        expect(mockedGetUserByUid).toHaveBeenCalledWith("owner-1");
    });

    it("updates read status and calls onBookUpdated when toggleReadStatus is invoked", async () => {
        const fakeFirebaseUser = { uid: "user-99" } as User;

        mockedOnAuthStateChanged.mockImplementation(
            (observerOrNext: NextOrObserver<User>) => {
                if (typeof observerOrNext === "function") {
                    observerOrNext(fakeFirebaseUser);
                }
                return jest.fn();
            }
        );

        mockedUpdateBookReadStatus.mockResolvedValue(true);

        const onBookUpdatedMock = jest.fn();
        const { result } = renderHook(() =>
            useBookInfo(mockBook, onBookUpdatedMock)
        );

        await act(async () => {
            await result.current.toggleReadStatus();
        });

        expect(mockedUpdateBookReadStatus).toHaveBeenCalledWith(
            "book-123",
            "user-99",
            true
        );
        expect(onBookUpdatedMock).toHaveBeenCalledWith(
            expect.objectContaining({
                Readers: ["user-2", "user-99"],
            })
        );
    });

    it("reverts image URL and shows alert if image update fails", async () => {
        const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
        mockedUpdateBookImage.mockRejectedValue(new Error("Upload failed"));

        const { result } = renderHook(() => useBookInfo(mockBook));

        await act(async () => {
            await result.current.handleImageChange({
                blob: new Blob(),
                previewUrl: "https://blob-preview.url",
            });
        });

        expect(result.current.imageUrl).toBe(mockBook.ImageURL);
        expect(alertMock).toHaveBeenCalledWith("Upload failed");

        alertMock.mockRestore();
    });
});