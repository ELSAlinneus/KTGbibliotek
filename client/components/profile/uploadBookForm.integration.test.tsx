/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UploadBookForm from "./uploadBookForm"; 
import { addDoc, collection } from "firebase/firestore";
import { User } from "firebase/auth";

// Mock Firestore database boundaries
jest.mock("@/lib/firebase/firebase", () => ({
  db: {},
}));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
}));

// Mock ImgUploader to avoid canvas/file input manipulation in form integration tests
jest.mock("@/components/imgUploader/imgUploader", () => {
  return function MockImgUploader() {
    return <div data-testid="mock-img-uploader" />;
  };
});

describe("Integration: UploadBookForm", () => {
  const mockUser = { uid: "user-123" } as User;
  const mockOnClose = jest.fn();
  const mockOnBookAdded = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("displays an error message and forbids manual entry when book info cannot be found in Libris", async () => {
    const user = userEvent.setup();

    // Mock Libris returning an empty list
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        xsearch: {
          list: [],
        },
      }),
    }) as jest.Mock;

    render(
      <UploadBookForm
        user={mockUser}
        onClose={mockOnClose}
        onBookAdded={mockOnBookAdded}
      />
    );

    // 1. Enter non-existent ISBN
    const isbnInput = screen.getByLabelText(/isbn:/i);
    await user.type(isbnInput, "9999999999");

    // 2. Click "Hämta bokinformation"
    const fetchBtn = screen.getByRole("button", { name: /hämta bokinformation/i });
    await user.click(fetchBtn);

    // 3. Verify error messages appear
    await waitFor(() => {
      expect(
        screen.getByText(/ingen bokinformation kunde hämtas för det angivna isbn-numret/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/dubbelkolla att du skrivit in rätt siffror/i)
      ).toBeInTheDocument();
    });

    // 4. Verify manual input fields and submission button are not rendered
    expect(screen.queryByLabelText(/titel:/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/författare:/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /lägg till bok/i })).not.toBeInTheDocument();

    // 5. Ensure Firestore was never called
    expect(addDoc).not.toHaveBeenCalled();
    expect(mockOnBookAdded).not.toHaveBeenCalled();
  });

  it("fetches book data from Libris, locks fields as readOnly, and persists book to Firestore on submit", async () => {
    const user = userEvent.setup();

    // Mock successful Libris response
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        xsearch: {
          list: [
            {
              title: "Pippi Långstrump",
              creator: "Astrid Lindgren",
              publisher: "Rabén & Sjögren",
              language: "swe",
              date: "1945",
            },
          ],
        },
      }),
    }) as jest.Mock;

    (collection as jest.Mock).mockReturnValue("BooksColRef");
    (addDoc as jest.Mock).mockResolvedValueOnce({ id: "book-doc-456" });

    render(
      <UploadBookForm
        user={mockUser}
        onClose={mockOnClose}
        onBookAdded={mockOnBookAdded}
      />
    );

    // 1. Enter ISBN and fetch metadata
    const isbnInput = screen.getByLabelText(/isbn:/i);
    await user.type(isbnInput, "9789129688313");
    await user.click(screen.getByRole("button", { name: /hämta bokinformation/i }));

    // 2. Validate fields render with populated Libris values and are readOnly
    await waitFor(() => {
      const titleInput = screen.getByLabelText(/titel:/i);
      expect(titleInput).toBeInTheDocument();
      expect(titleInput).toHaveValue("Pippi Långstrump");
      expect(titleInput).toHaveAttribute("readonly");
    });

    expect(screen.getByLabelText(/författare:/i)).toHaveValue("Astrid Lindgren");
    expect(screen.getByLabelText(/författare:/i)).toHaveAttribute("readonly");
    expect(screen.getByLabelText(/utgivare:/i)).toHaveValue("Rabén & Sjögren");
    expect(screen.getByLabelText(/utgivare:/i)).toHaveAttribute("readonly");

    // 3. Submit form
    const submitBtn = screen.getByRole("button", { name: /lägg till bok/i });
    await user.click(submitBtn);

    // 4. Verify Firestore call and payload
    expect(addDoc).toHaveBeenCalledTimes(1);
    expect(addDoc).toHaveBeenCalledWith(
      "BooksColRef",
      expect.objectContaining({
        Title: "Pippi Långstrump",
        Author: "Astrid Lindgren",
        Publisher: "Rabén & Sjögren",
        ISBN: "9789129688313",
        Language: "swe",
        Year_of_publication: 1945,
        Owner: "user-123",
        Current_custody: "user-123",
        Borrowed: false,
        Readers: [],
      })
    );

    // 5. Verify UI alerts and callback triggers
    expect(window.alert).toHaveBeenCalledWith("Boken har lagts till i biblioteket!");
    expect(mockOnBookAdded).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "book-doc-456",
        Title: "Pippi Långstrump",
        Author: "Astrid Lindgren",
        ISBN: "9789129688313",
      })
    );
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("resets form view when 'Rensa ISBN' is clicked", async () => {
    const user = userEvent.setup();

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        xsearch: {
          list: [
            {
              title: "Mio, min Mio",
              creator: "Astrid Lindgren",
              publisher: "Rabén & Sjögren",
              language: "swe",
              date: "1954",
            },
          ],
        },
      }),
    }) as jest.Mock;

    render(
      <UploadBookForm
        user={mockUser}
        onClose={mockOnClose}
        onBookAdded={mockOnBookAdded}
      />
    );

    // Fetch information
    await user.type(screen.getByLabelText(/isbn:/i), "9789129688313");
    await user.click(screen.getByRole("button", { name: /hämta bokinformation/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /rensa isbn/i })).toBeInTheDocument();
    });

    // Click reset button
    await user.click(screen.getByRole("button", { name: /rensa isbn/i }));

    // Verify metadata fields disappear and the search button returns
    expect(screen.queryByLabelText(/titel:/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /hämta bokinformation/i })).toBeInTheDocument();
  });

  it("does not close the form or trigger onBookAdded if Firestore write fails", async () => {
    const user = userEvent.setup();

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        xsearch: {
          list: [
            {
              title: "Bröderna Lejonhjärta",
              creator: "Astrid Lindgren",
              publisher: "Rabén & Sjögren",
              language: "swe",
              date: "1973",
            },
          ],
        },
      }),
    }) as jest.Mock;

    (collection as jest.Mock).mockReturnValue("BooksColRef");
    (addDoc as jest.Mock).mockRejectedValueOnce(new Error("Database connection lost"));

    render(
      <UploadBookForm
        user={mockUser}
        onClose={mockOnClose}
        onBookAdded={mockOnBookAdded}
      />
    );

    // Fetch metadata
    await user.type(screen.getByLabelText(/isbn:/i), "9789129688313");
    await user.click(screen.getByRole("button", { name: /hämta bokinformation/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /lägg till bok/i })).toBeInTheDocument();
    });

    // Attempt submission
    await user.click(screen.getByRole("button", { name: /lägg till bok/i }));

    // Verify error notification
    expect(window.alert).toHaveBeenCalledWith("Error adding book: Database connection lost");
    expect(mockOnBookAdded).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});