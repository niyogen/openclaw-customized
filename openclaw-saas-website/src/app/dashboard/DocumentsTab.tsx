"use client";

import { useState, useEffect, useRef } from "react";

interface DocumentItem {
  id: string;
  filename: string;
  file_size: number;
  created_at: string;
}

const FILE_TYPE_ICONS: Record<string, string> = {
  txt: "📄",
  md: "📝",
  json: "🔧",
  csv: "📊",
  xml: "🏷️",
  doc: "📘",
  docx: "📘",
};

function getFileIcon(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return FILE_TYPE_ICONS[ext] || "📄";
}

export default function DocumentsTab({
  subdomain,
  backendUrl,
}: {
  subdomain: string;
  backendUrl: string;
}) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Manual input state
  const [showManualForm, setShowManualForm] = useState(false);
  const [docName, setDocName] = useState("");
  const [docContent, setDocContent] = useState("");

  // Drag-and-drop state
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/tenant/${subdomain}/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      } else {
        setError("Failed to load documents.");
      }
    } catch (err) {
      console.error(err);
      setError("Error connecting to backend API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subdomain) {
      fetchDocuments();
    }
  }, [subdomain, backendUrl]);

  // Handle file upload — uses multipart FormData for all file types
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFile(files[0]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Core upload function — sends the file as multipart/form-data
  const uploadFile = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const allowed = ["txt", "md", "json", "csv", "xml", "doc", "docx"];
    if (!allowed.includes(ext)) {
      setError(`Unsupported file type ".${ext}". Allowed: ${allowed.join(", ")}`);
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${backendUrl}/api/tenant/${subdomain}/documents/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.ok) {
        setSuccess(`Successfully uploaded "${file.name}"!`);
        fetchDocuments();
      } else {
        const errData = await res.json();
        setError(errData.detail || "Failed to upload document.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error uploading document.");
    } finally {
      setUploading(false);
    }
  };

  // Drag-and-drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  // Handle manual paste/create document
  const handleManualUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !docContent.trim()) {
      setError("Please fill in both fields.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const cleanName = docName.endsWith(".txt") ? docName : `${docName}.txt`;
      const res = await fetch(`${backendUrl}/api/tenant/${subdomain}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: cleanName,
          content: docContent,
          file_size: docContent.length,
        }),
      });

      if (res.ok) {
        setSuccess(`Successfully added "${cleanName}"!`);
        setDocName("");
        setDocContent("");
        setShowManualForm(false);
        fetchDocuments();
      } else {
        const errData = await res.json();
        setError(errData.detail || "Failed to add document.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error adding document.");
    } finally {
      setUploading(false);
    }
  };

  // Delete document
  const handleDelete = async (docId: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(
        `${backendUrl}/api/tenant/${subdomain}/documents/${docId}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        setSuccess(`Deleted "${filename}".`);
        fetchDocuments();
      } else {
        setError("Failed to delete document.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error deleting document.");
    }
  };

  // Format file size helper
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-black"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {dragOver && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3 p-10 border-2 border-dashed border-white/40 rounded-3xl">
            <span className="text-5xl">📥</span>
            <p className="text-white text-lg font-semibold">Drop your file here</p>
            <p className="text-zinc-400 text-sm">.txt, .md, .json, .csv, .xml, .doc, .docx</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>📁</span> Knowledge Base &amp; Documents
          </h1>
          <p className="text-zinc-400 text-sm mt-0.5">
            Upload files (.txt, .md, .json, .csv, .doc, .docx) or paste business data to contextualize your AI agent
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-lg transition-colors"
          >
            ✍️ {showManualForm ? "View Uploads" : "Paste Text"}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold bg-white hover:bg-zinc-200 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              "📤"
            )}
            Upload File
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.md,.json,.csv,.xml,.doc,.docx"
            className="hidden"
          />
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mx-8 mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-2 shrink-0">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="mx-8 mt-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2 shrink-0">
          ✅ {success}
        </div>
      )}

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {showManualForm ? (
          /* Manual Text Form */
          <div className="max-w-2xl bg-zinc-900/50 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-white font-bold text-lg mb-4">Paste Business Context / Q&amp;A</h3>
            <form onSubmit={handleManualUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Document Title / Filename
                </label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. return-policy, pricing-details"
                  className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-all text-sm font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Content / Rules / Data
                </label>
                <textarea
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  rows={10}
                  placeholder="Paste details that your AI agent should know. Examples:
- Customer service hours are 9 AM - 5 PM EST.
- We offer a 30-day money-back guarantee.
- Free shipping applies to orders over $50."
                  className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-all text-sm font-medium resize-y"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 bg-white text-black hover:bg-zinc-200 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  Save Context Document
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="px-5 py-2.5 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 text-sm font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Documents list */
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-10 h-10 border-4 border-zinc-700 border-t-white rounded-full animate-spin mb-4" />
                <p className="text-zinc-500 text-sm">Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-white/10 rounded-2xl">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 text-3xl">
                  📁
                </div>
                <h3 className="text-white font-bold text-lg mb-1">No Documents Uploaded</h3>
                <p className="text-zinc-500 text-sm max-w-sm mb-6">
                  Add custom data so your AI agent can answer questions accurately using your own business context.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {["TXT", "MD", "JSON", "CSV", "DOC", "DOCX"].map((t) => (
                    <span key={t} className="px-2 py-0.5 text-[10px] font-bold bg-zinc-800 text-zinc-400 rounded-md border border-white/5">
                      .{t}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white text-black hover:bg-zinc-200 text-sm font-semibold rounded-xl transition-colors"
                  >
                    Upload File
                  </button>
                  <button
                    onClick={() => setShowManualForm(true)}
                    className="px-4 py-2 bg-zinc-900 border border-white/10 hover:border-white/30 text-zinc-300 hover:text-white text-sm rounded-xl transition-all"
                  >
                    Paste Text
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900/40 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-zinc-950/40 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      <th className="px-6 py-4">Filename</th>
                      <th className="px-6 py-4">File Size</th>
                      <th className="px-6 py-4">Uploaded At</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-zinc-300">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-semibold text-white flex items-center gap-2">
                          <span className="text-lg">{getFileIcon(doc.filename)}</span>
                          {doc.filename}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">{formatSize(doc.file_size)}</td>
                        <td className="px-6 py-4 text-zinc-400">{formatDate(doc.created_at)}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(doc.id, doc.filename)}
                            className="px-2.5 py-1 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
