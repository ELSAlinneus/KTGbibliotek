export type Book = {
    id: string;
    Title: string;
    Author: string;
    Publisher: string;
    Borrowed: boolean;
    Current_custody: string;
    ImageURL: string;
    Language: string;
    Owner: string;
    Readers?: string[];
    ISBN: string;
    Year_of_publication: number;
}