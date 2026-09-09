import React from 'react';
import { login, createAccount } from "../../lib/controllers/login.controller";

interface FormProps {
    onToggleForms: () => void;
    formType: 'signin' | 'signup';
}

export default function AuthForm({ onToggleForms, formType }: FormProps) {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (formType === 'signin') {
            login(event);
        } else {
            createAccount(event);
        }
    };
    return (
        <div className="mt-12 flex items-center justify-center px-4">
            <div className="w-96 rounded-2xl border border-slate-700 bg-slate-800 p-8 text-slate-200 shadow-xl">
                <h1 className="mb-2 text-2xl font-semibold text-slate-100">
                    {formType === 'signin' ? 'Logga in' : 'Skapa konto'}
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                            <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            required
                            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                    <div>
                            <label className="mb-1 block text-sm font-medium text-slate-300">Lösenord</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Lösenord"
                            required
                            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                    {formType === 'signup' && (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-300">Upprepa lösenord</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Upprepa lösenord"
                                required
                                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-slate-900 text-white py-2.5 font-medium hover:bg-slate-800 transition-colors"
                    >
                        {formType === 'signin' ? 'Login' : 'Skapa konto'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-slate-400">{formType === 'signin' ? 'Har du inget konto?' : 'Har du redan ett konto?'}</p>
                    <button
                        className="mt-2 inline-flex items-center justify-center rounded-lg border border-slate-600 px-4 py-2 text-slate-300 transition-colors hover:bg-slate-700"
                        onClick={onToggleForms}
                    >
                        {formType === 'signin' ? 'Skapa ett konto' : 'Logga in'}
                    </button>
                </div>
            </div>
        </div>
    );
};