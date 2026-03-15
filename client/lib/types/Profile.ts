export interface Profile {
    username: string;
    email: string;
    picture?: string; 
}

export type PublicUserProfile = {
    displayName: string;
    email?: string;
    photoURL?: string;
};