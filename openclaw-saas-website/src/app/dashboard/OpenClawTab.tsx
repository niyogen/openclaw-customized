'use client';

import React, { useState } from 'react';

interface OpenClawTabProps {
  subdomain: string;
  backendUrl: string;
}

const PRESETS = [
  {
    name: "🍳 Recipe Generator",
    intent_slug: "recipe_generator",
    actions: "Create a recipe based on ingredients provided. Suggest cooking time and level.",
    params: {
      ingredients: ["chicken", "rice", "spinach"],
      cuisine: "asian"
    },
    output_schema: {
      type: "object",
      properties: {
        recipe_name: { type: "string" },
        cooking_time_minutes: { type: "integer" },
        difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
        steps: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["recipe_name", "cooking_time_minutes", "difficulty", "steps"]
    }
  },
  {
    name: "📝 Text Summarizer",
    intent_slug: "summarize_text",
    actions: "Summarize the input text into a brief paragraph and extract 3 key bullet points/tags.",
    params: {
      text: "FastClaw is a next-generation SaaS execution engine designed for speed and security. It offers dedicated PostgreSQL schema isolation for each tenant, ensuring that data is never co-mingled. Through Baileys Engine, it hooks directly into WhatsApp, Telegram, and Discord, avoiding fragile browser extensions."
    },
    output_schema: {
      type: "object",
      properties: {
        summary: { type: "string" },
        tags: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["summary", "tags"]
    }
  }
];

export default function OpenClawTab({ subdomain, backendUrl }: OpenClawTabProps) {
  const [intentSlug, setIntentSlug] = useState("recipe_generator");
  const [actions, setActions] = useState("Create a recipe based on ingredients provided. Suggest cooking time and level.");
  const [paramsStr, setParamsStr] = useState(JSON.stringify(PRESETS[0].params, null, 2));
  const [schemaStr, setSchemaStr] = useState(JSON.stringify(PRESETS[0].output_schema, null, 2));
  const [costCap, setCostCap] = useState("0.05");
  const [timeout, setTimeoutSec] = useState("30");
  const [correctionHint, setCorrectionHint] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const loadPreset = (preset: typeof PRESETS[0]) => {
    setIntentSlug(preset.intent_slug);
    setActions(preset.actions);
    setParamsStr(JSON.stringify(preset.params, null, 2));
    setSchemaStr(JSON.stringify(preset.output_schema, null, 2));
  };

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Validate JSON inputs locally first
      let parsedParams = {};
      try {
        parsedParams = JSON.parse(paramsStr);
      } catch (err: any) {
        throw new Error(`Invalid JSON in Input Params: ${err.message}`);
      }

      let parsedSchema = {};
      try {
        parsedSchema = JSON.parse(schemaStr);
      } catch (err: any) {
        throw new Error(`Invalid JSON in Output Schema: ${err.message}`);
      }

      const payload = {
        intent_slug: intentSlug.trim(),
        actions: actions.trim(),
        params: parsedParams,
        output_schema: parsedSchema,
        cost_cap_usd: parseFloat(costCap) || 0.05,
        timeout_sec: parseInt(timeout) || 30,
        correction_hint: correctionHint.trim()
      };

      const res = await fetch(`${backendUrl}/api/tenant/${subdomain}/openclaw/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': 'dashboard-playground'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.detail?.error?.message || "Execution failed");
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result.output, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-black text-zinc-100 min-h-0 h-full">
      {/* Configuration Panel */}
      <div className="w-full lg:w-1/2 p-6 md:p-8 overflow-y-auto border-r border-zinc-800 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">OpenClaw Playground</h2>
          <p className="text-zinc-400 text-sm">
            Execute plain-English intents and retrieve schema-validated structured outputs.
          </p>
        </div>

        {/* Presets */}
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Load Template Preset
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => loadPreset(p)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleRun} className="flex flex-col gap-5">
          {/* Intent Slug */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Intent Slug
            </label>
            <input
              type="text"
              required
              value={intentSlug}
              onChange={(e) => setIntentSlug(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="e.g. recipe_generator"
            />
          </div>

          {/* Actions */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Actions (Prompt Instructions)
            </label>
            <textarea
              required
              rows={3}
              value={actions}
              onChange={(e) => setActions(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors resize-y font-medium"
              placeholder="Tell the executor what action to perform..."
            />
          </div>

          {/* Params & Schema Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Input Params (JSON)
              </label>
              <textarea
                rows={8}
                required
                value={paramsStr}
                onChange={(e) => setParamsStr(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 transition-colors font-mono resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Output JSON Schema
              </label>
              <textarea
                rows={8}
                required
                value={schemaStr}
                onChange={(e) => setSchemaStr(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 transition-colors font-mono resize-none"
              />
            </div>
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Cost Cap (USD)
              </label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                max="2.0"
                required
                value={costCap}
                onChange={(e) => setCostCap(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Timeout (Seconds)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                required
                value={timeout}
                onChange={(e) => setTimeoutSec(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
          </div>

          {/* Correction Hint */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Correction Hint (Optional retry context)
            </label>
            <input
              type="text"
              value={correctionHint}
              onChange={(e) => setCorrectionHint(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="e.g. step 2 difficulty must be ease instead of easy"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-[0_4px_20px_rgba(255,255,255,0.15)]"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Running Intent Execution...
              </>
            ) : "Run Intent"}
          </button>
        </form>
      </div>

      {/* Results Panel */}
      <div className="w-full lg:w-1/2 p-6 md:p-8 flex flex-col overflow-hidden min-h-0 h-full bg-zinc-950/20">
        <h3 className="text-lg font-bold text-white mb-4">Execution Results</h3>
        
        {/* Loading / Empty State */}
        {!result && !error && !loading && (
          <div className="flex-1 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center p-8">
            <svg className="w-12 h-12 text-zinc-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-zinc-500 text-sm">Configure and click "Run Intent" to start execution.</p>
          </div>
        )}

        {loading && (
          <div className="flex-1 border border-zinc-800 bg-zinc-950/50 rounded-2xl flex flex-col items-center justify-center text-center p-8 animate-pulse">
            <p className="text-zinc-400 text-sm">Awaiting responses from Gemini-2.5-flash...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex-1 border border-red-950/50 bg-red-950/10 rounded-2xl p-6 overflow-y-auto">
            <div className="flex items-center gap-2 text-red-400 mb-3 font-semibold text-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Execution Error
            </div>
            <pre className="text-xs text-red-300 font-mono whitespace-pre-wrap leading-relaxed">
              {error}
            </pre>
          </div>
        )}

        {/* Success Output */}
        {result && (
          <div className="flex-1 flex flex-col min-h-0 gap-6">
            {/* Stats Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl">
                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Model</span>
                <span className="text-sm font-semibold text-white">{result.executor?.model}</span>
              </div>
              <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl">
                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Latency</span>
                <span className="text-sm font-semibold text-white">{result.executor?.latency_ms}ms</span>
              </div>
              <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl">
                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Usage (In/Out)</span>
                <span className="text-sm font-semibold text-white">{result.usage?.input_tokens} / {result.usage?.output_tokens}</span>
              </div>
              <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl">
                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Cost</span>
                <span className="text-sm font-bold text-emerald-400">${result.usage?.cost_usd?.toFixed(6)}</span>
              </div>
            </div>

            {/* Output JSON Panel */}
            <div className="flex-1 flex flex-col min-h-0 bg-zinc-950 border border-zinc-850 rounded-2xl overflow-hidden">
              <div className="bg-zinc-900 px-4 py-2.5 border-b border-zinc-850 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 tracking-wider">Output JSON</span>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="px-2.5 py-1 rounded bg-zinc-800 text-[10px] font-bold hover:bg-zinc-700 hover:text-white text-zinc-300 transition-colors"
                >
                  {copied ? "Copied!" : "Copy JSON"}
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <pre className="text-xs text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap">
                  {JSON.stringify(result.output, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
