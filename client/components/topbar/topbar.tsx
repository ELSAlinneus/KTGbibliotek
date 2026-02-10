export default function Topbar(){
    return (
        <div>
            <h1 className="text-white text-5xl font-bold pb-4">KTG Bibliotek</h1>
            <nav className="flex justify-between items-center bg-gray-800 p-4">
                <div className="flex space-x-4">
                    <a href="/" className="text-white">Hem</a>
                    <a href="/allbooks" className="text-white">Alla Böcker</a>
                </div>
                <div className="flex-grow" />
                <div className="flex space-x-4">
                    <a href="/profile" className="text-white">Profil</a>
                    <a href="/settings" className="text-white">Inställningar</a>
                </div>
            </nav>
        </div>
    );
}
