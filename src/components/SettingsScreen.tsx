import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Settings, Key, Eye, EyeOff, Save, Check, AlertCircle, ExternalLink } from "lucide-react";

export function SettingsScreen() {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("openai_api_key");
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSaveApiKey = () => {
    setSaveStatus("saving");
    try {
      if (apiKey.trim()) {
        localStorage.setItem("openai_api_key", apiKey.trim());
      } else {
        localStorage.removeItem("openai_api_key");
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      setTestStatus("error");
      setTimeout(() => setTestStatus("idle"), 2000);
      return;
    }

    setTestStatus("testing");
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: "Say 'test' if you can read this." }],
          max_tokens: 10
        })
      });

      if (response.ok) {
        setTestStatus("success");
        setTimeout(() => setTestStatus("idle"), 3000);
      } else {
        setTestStatus("error");
        setTimeout(() => setTestStatus("idle"), 3000);
      }
    } catch (error) {
      setTestStatus("error");
      setTimeout(() => setTestStatus("idle"), 3000);
    }
  };

  const handleClearApiKey = () => {
    setApiKey("");
    localStorage.removeItem("openai_api_key");
    setSaveStatus("idle");
    setTestStatus("idle");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="flex items-center justify-center gap-2">
          <Settings className="w-8 h-8 text-[#22D3EE]" />
          <h1 className="text-3xl text-[#E6E9EF]">Settings</h1>
        </div>
        <p className="text-[#9AA3B2]">
          Configure your Gemini API key for enhanced menu parsing
        </p>
      </div>

      {/* Info Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#22D3EE]/10 to-[#14B8A6]/10 border border-[#22D3EE]/30 shadow-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#22D3EE] flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="text-[#E6E9EF]">About BYOK (Bring Your Own Key)</h3>
            <p className="text-sm text-[#9AA3B2] leading-relaxed">
              NutriPlan can use OpenAI's API to provide more accurate menu parsing and nutritional analysis.
              Your API key is stored locally in your browser and never sent to our servers.
            </p>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#22D3EE] hover:text-[#14B8A6] transition-colors"
            >
              Get your free OpenAI API key
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* API Key Configuration */}
      <div className="rounded-2xl bg-[#121722]/40 backdrop-blur-xl border border-[#2A3242] shadow-lg p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Key className="w-5 h-5 text-[#14B8A6]" />
          <h3 className="text-lg text-[#E6E9EF]">OpenAI API Key</h3>
        </div>

        {/* API Key Input */}
        <div className="space-y-3">
          <label className="block text-sm text-[#9AA3B2]">
            API Key
          </label>
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIza..."
              className="w-full px-4 py-3 pr-12 rounded-xl bg-[#0B0E14]/50 border border-[#2A3242] text-[#E6E9EF] placeholder-[#9AA3B2]/50 focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/50 focus:border-[#22D3EE] font-mono text-sm"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA3B2] hover:text-[#E6E9EF] transition-colors"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-[#9AA3B2]">
            Your API key is stored securely in your browser's local storage
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSaveApiKey}
            disabled={saveStatus === "saving"}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#14B8A6] text-[#0B0E14] transition-all hover:shadow-lg hover:shadow-[#22D3EE]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saveStatus === "saving" ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0B0E14]/30 border-t-[#0B0E14] rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveStatus === "saved" ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save API Key</span>
              </>
            )}
          </button>

          <button
            onClick={handleTestApiKey}
            disabled={!apiKey.trim() || testStatus === "testing"}
            className="flex-1 px-6 py-3 rounded-xl bg-[#2A3242] text-[#E6E9EF] transition-all hover:bg-[#2A3242]/70 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {testStatus === "testing" ? (
              <>
                <div className="w-4 h-4 border-2 border-[#E6E9EF]/30 border-t-[#E6E9EF] rounded-full animate-spin" />
                <span>Testing...</span>
              </>
            ) : testStatus === "success" ? (
              <>
                <Check className="w-4 h-4 text-[#14B8A6]" />
                <span className="text-[#14B8A6]">Valid!</span>
              </>
            ) : testStatus === "error" ? (
              <>
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-400">Invalid</span>
              </>
            ) : (
              <span>Test Connection</span>
            )}
          </button>

          {apiKey && (
            <button
              onClick={handleClearApiKey}
              className="px-6 py-3 rounded-xl bg-[#2A3242]/50 text-[#9AA3B2] hover:text-[#E6E9EF] hover:bg-[#2A3242] transition-all"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Features Info */}
      <div className="rounded-2xl bg-[#121722]/40 backdrop-blur-xl border border-[#2A3242] shadow-lg p-6">
        <h3 className="text-[#E6E9EF] mb-4">Enhanced Features with Gemini API</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3 text-sm text-[#9AA3B2]">
            <Check className="w-4 h-4 text-[#14B8A6] flex-shrink-0 mt-0.5" />
            <span>More accurate nutritional estimation from menu text</span>
          </li>
          <li className="flex items-start gap-3 text-sm text-[#9AA3B2]">
            <Check className="w-4 h-4 text-[#14B8A6] flex-shrink-0 mt-0.5" />
            <span>Better food item recognition and categorization</span>
          </li>
          <li className="flex items-start gap-3 text-sm text-[#9AA3B2]">
            <Check className="w-4 h-4 text-[#14B8A6] flex-shrink-0 mt-0.5" />
            <span>Understanding of regional and cultural food variations</span>
          </li>
          <li className="flex items-start gap-3 text-sm text-[#9AA3B2]">
            <Check className="w-4 h-4 text-[#14B8A6] flex-shrink-0 mt-0.5" />
            <span>Intelligent portion size estimation</span>
          </li>
        </ul>
      </div>

      {/* Privacy Note */}
      <div className="rounded-xl bg-[#121722]/40 backdrop-blur-xl border border-[#2A3242] p-4">
        <p className="text-xs text-[#9AA3B2] text-center">
          🔒 Your API key is stored locally on your device and is never shared with third parties.
          Menu data is sent directly to Google's Gemini API only when you use the parsing feature.
        </p>
      </div>
    </motion.div>
  );
}
