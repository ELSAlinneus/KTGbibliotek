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
            <div className="w-96 bg-white shadow-xl rounded-2xl p-8 border border-slate-200">
                <h1 className="text-2xl font-semibold text-slate-900 mb-2">
                    {formType === 'signin' ? 'Logga in' : 'Skapa konto'}
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            required
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Lösenord</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Lösenord"
                            required
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900"
                        />
                    </div>
                    {formType === 'signup' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Upprepa lösenord</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Upprepa lösenord"
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900"
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
                    <p className="text-slate-600">{formType === 'signin' ? 'Har du inget konto?' : 'Har du redan ett konto?'}</p>
                    <button
                        className="mt-2 inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={onToggleForms}
                    >
                        {formType === 'signin' ? 'Skapa ett konto' : 'Logga in'}
                    </button>
                </div>
            </div>
        </div>
    );
};