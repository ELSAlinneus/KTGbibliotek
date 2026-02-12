'use client'
import { login } from "../../lib/controllers/login.controller";

export default function LoginPage() {
 
    return (
        <div>
            login page
            <form onSubmit={login}>
                <input type="email" name="email" placeholder="Email" required />
                <input type="password" name="password" placeholder="Password" required />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}