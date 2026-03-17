import { Book } from "@/lib/types/Book";
import Image from "next/image";
import Searchbar from "../bookinfo/searchbar";

export default function ChangeCustodyForm({ book, onClose }: { book: Book; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {book.Title}
                        </h1>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            className="text-black hover:text-red-800 "
                            aria-label="Stäng"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="flex items-start gap-6">
                            {book.ImageURL && (
                                <div className="h-72 w-48 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-gray-200">
                                        <Image
                                            className="h-full w-full object-cover"
                                            src={book.ImageURL}
                                            alt={book.Title}
                                            width={192}
                                            height={288}
                                            unoptimized
                                        />
                                </div>
                            )}
                        <div>
                            <form className="space-y-4">
                                <div>
                                    <h2 className="text-xl font-bold mb-4">Till vem vill du låna ut boken?</h2>

                                    {/* TODO: via controller: söka på användare, scrolla bland användare, välja en */}
                                    <Searchbar onSearch={(query) => console.log("searching for user with query:", query)} placeholder="Sök användare..." />
                                </div>
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 cursor-pointer"
                                >
                                    Spara
                                    {/* TODO uppdatera current_custody och borrowed via controller */}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}