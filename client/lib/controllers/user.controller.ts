import { db, auth } from "@/lib/firebase/firebase";
import { updateProfile } from "firebase/auth"; 

export interface Profile {
    username: string;
    email: string;
}

function handleUsernameChange(newUsername: string) {
    const user = auth.currentUser;
    if (user) {
        updateProfile(user, { displayName: newUsername })
            .then(() => {
                console.log("Username updated successfully");
            })
            .catch((error) => {
                console.error("Error updating username:", error);
            });
    } else {
        console.error("No user is currently signed in.");
    }
    console.log("displayname ", user?.displayName);
}

function handleUserProfileChange(profile: Profile) {
    console.log("handle profile change", profile);

    handleUsernameChange(profile.username);
    
    const user = auth.currentUser;
    if (user) {
        console.log("Email change functionality not implemented yet.");
    }
}


export { handleUsernameChange, handleUserProfileChange };