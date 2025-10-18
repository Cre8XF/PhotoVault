import React, { useState, useEffect } from "react";
import { Trash2, Upload, Download, Database } from "lucide-react";
import {
  getAll,
  bulkPut,
  clear,
  resetDB,
  logStore,
  ensureAdminExists,
} from "../db";

const DatabaseTools = ({ colors, setNotification }) => {
  const [users, setUsers] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [importedData, setImportedData] = useState(null);

  // 🔄 Last data ved åpning
  useEffect(() => {
    refreshData();
  }, []);

  async function refreshData() {
    const u = await getAll("users");
    const a = await getAll("albums");
    const p = await getAll("photos");
    setUsers(u);
    setAlbums(a);
    setPhotos(p);
  }

  // 💾 Eksporter database som JSON
  const handleExport = () => {
    const blob = new Blob(
      [JSON.stringify({ users, albums, photos }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `photovault_backup_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}.json`;
    a.click();
    setNotification({ message: "Backup eksportert", type: "success" });
  };

  // 📂 Importer JSON-fil
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.users || !data.albums || !data.photos)
          throw new Error("Ugyldig JSON-format");
        setImportedData(data);
        setNotification({
          message: "JSON-fil lastet inn – klar for import",
          type: "info",
        });
      } catch {
        setNotification({ message: "Feil ved lesing av JSON", type: "error" });
      }
    };
    reader.readAsText(file);
  };

// 🧩 Utfør import
const confirmImport = async () => {
  if (!importedData) return;
  await resetDB();

  // Importer bare relevante data
  if (importedData.albums) await bulkPut("albums", importedData.albums);
  if (importedData.photos) await bulkPut("photos", importedData.photos);

  refreshData();
  setImportedData(null);
  setNotification({ message: "Data importert", type: "success" });
};

// 🗑️ Tøm database
const handleReset = async () => {
  if (window.confirm("Er du sikker på at du vil slette all lokal data?")) {
    await resetDB();
    refreshData();
    setNotification({ message: "Lokal database tilbakestilt", type: "warning" });
  }
};


  // 📊 Tabellvisning
  const renderTable = (data, columns) => {
    if (!data?.length) return <p className={colors.textSecondary}>Ingen data</p>;
    return (
      <div className="overflow-x-auto border border-gray-700 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/40 text-gray-300 uppercase text-xs">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 text-left">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                className="odd:bg-gray-900/20 even:bg-gray-800/10 hover:bg-gray-800/40"
              >
                {columns.map((col) => (
                  <td key={col} className="px-3 py-2 truncate max-w-[200px]">
                    {String(row[col] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // 🔁 Tabnavn
  const tabs = [
    { id: "users", label: "Brukere", icon: <UserIcon /> },
    { id: "albums", label: "Album", icon: <FolderIcon /> },
    { id: "photos", label: "Bilder", icon: <ImageIcon /> },
  ];

  return (
    <div className={`p-6 md:p-10 space-y-6 ${colors.text}`}>
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Database className="w-8 h-8 text-purple-500" />
        Database-verktøy
      </h1>
      <p className={colors.textSecondary}>
        Administrer PhotoVault-data direkte i nettleseren.
      </p>

      {/* Import / eksport / slett */}
      <div className="flex flex-wrap gap-3 mt-4">
        <button
          onClick={handleExport}
          className={`px-4 py-2 rounded-xl ${colors.buttonPrimary} flex items-center gap-2`}
        >
          <Download className="w-4 h-4" /> Eksporter JSON
        </button>

        <label
          className={`px-4 py-2 rounded-xl ${colors.buttonSecondary} flex items-center gap-2 cursor-pointer`}
        >
          <Upload className="w-4 h-4" /> Importer JSON
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>

        {importedData && (
          <button
            onClick={confirmImport}
            className={`px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white`}
          >
            Bekreft import
          </button>
        )}

        <button
          onClick={handleReset}
          className={`px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 ml-auto`}
        >
          <Trash2 className="w-4 h-4" /> Tøm database
        </button>
      </div>

      {/* Tabnavigasjon */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-xl ${
            activeTab === "users" ? "bg-purple-600 text-white" : colors.buttonSecondary
          }`}
        >
          Brukere ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("albums")}
          className={`px-4 py-2 rounded-xl ${
            activeTab === "albums" ? "bg-purple-600 text-white" : colors.buttonSecondary
          }`}
        >
          Album ({albums.length})
        </button>
        <button
          onClick={() => setActiveTab("photos")}
          className={`px-4 py-2 rounded-xl ${
            activeTab === "photos" ? "bg-purple-600 text-white" : colors.buttonSecondary
          }`}
        >
          Bilder ({photos.length})
        </button>
      </div>

      {/* Datavisning */}
      <div className="mt-4">
        {activeTab === "users" && renderTable(users, ["email", "name", "role", "createdAt"])}
        {activeTab === "albums" &&
          renderTable(albums, ["id", "name", "userId", "createdAt"])}
        {activeTab === "photos" &&
          renderTable(photos, ["id", "albumId", "userId", "name", "uploadedAt"])}
      </div>
    </div>
  );
};

// Enkle ikonkomponenter for tab-oversikt
const UserIcon = () => <svg className="w-4 h-4"><circle cx="12" cy="8" r="4" fill="currentColor" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="none" stroke="currentColor" strokeWidth="2" /></svg>;
const FolderIcon = () => <svg className="w-4 h-4"><path d="M3 7h6l2 2h10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" strokeWidth="2" /></svg>;
const ImageIcon = () => <svg className="w-4 h-4"><rect x="3" y="3" width="18" height="14" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2"/></svg>;

export default DatabaseTools;
