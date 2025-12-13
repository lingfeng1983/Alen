import React, { useState, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";
import { parse } from "marked";

const styles = `
:root {
  --bg-dark: #020617;
  --bg-card: #1e293b;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --accent-gradient: linear-gradient(-45deg, #0f172a, #312e81, #4c1d95, #0f172a);
  --glass-border: 1px solid rgba(255, 255, 255, 0.1);
  --glass-bg: rgba(30, 41, 59, 0.5);
}

body {
  margin: 0;
  font-family: "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--bg-dark);
  color: var(--text-primary);
  min-height: 100vh;
  overflow-x: hidden;
}

/* Layout */
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

header {
  text-align: center;
  animation: fadeDown 0.8s ease-out;
}

header h1 {
  font-size: 3rem;
  font-weight: 800;
  margin: 0 0 16px 0;
  background: linear-gradient(to right, #fff, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
}

header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Navigation Tabs */
.nav-tabs {
  display: flex;
  justify-content: center;
  gap: 8px;
  background: var(--glass-bg);
  padding: 6px;
  border-radius: 99px;
  width: fit-content;
  margin: 0 auto;
  border: var(--glass-border);
  backdrop-filter: blur(8px);
}

.nav-tab {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 10px 32px;
  border-radius: 99px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.nav-tab.active {
  background: #4f46e5;
  color: white;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.nav-tab:hover:not(.active) {
  color: white;
  background: rgba(255,255,255,0.05);
}

/* Search & Filter Bar */
.library-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  animation: fadeUp 0.5s ease-out;
}

.search-bar {
  display: flex;
  align-items: center;
  background: var(--glass-bg);
  border: var(--glass-border);
  border-radius: 16px;
  padding: 12px 20px;
  gap: 12px;
  transition: all 0.3s ease;
}

.search-bar:focus-within {
  border-color: #6366f1;
  background: rgba(30, 41, 59, 0.8);
}

.search-bar input {
  background: transparent;
  border: none;
  color: white;
  font-size: 1rem;
  width: 100%;
  outline: none;
}

.filter-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.chip {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255,255,255,0.05);
  color: var(--text-secondary);
  padding: 6px 16px;
  border-radius: 99px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.chip:hover, .chip.active {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.5);
  color: #a5b4fc;
}

.sort-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 4px;
  gap: 16px;
}

.sort-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;
}

.sort-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.sort-icon {
  display: inline-block;
  transition: transform 0.3s ease;
}

.sort-icon.asc {
  transform: rotate(180deg);
}

.btn-clear {
  color: #ef4444;
  font-size: 0.85rem;
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 6px 16px;
  border-radius: 99px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.5);
}

/* Input Section */
.input-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 700px;
  width: 100%;
  margin: 0 auto;
  animation: fadeUp 0.6s ease-out;
}

.input-wrapper {
  position: relative;
  border-radius: 24px;
  padding: 4px;
  background: var(--glass-bg);
  border: var(--glass-border);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
}

.preview-toggle {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.preview-toggle:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border-color: rgba(255, 255, 255, 0.2);
}

textarea {
  width: 100%;
  background: transparent;
  border: none;
  color: white;
  padding: 20px;
  padding-right: 80px; /* Prevent text going under button */
  font-size: 1.1rem;
  font-family: inherit;
  resize: none;
  min-height: 120px;
  outline: none;
  box-sizing: border-box;
}

textarea::placeholder {
  color: rgba(148, 163, 184, 0.5);
}

.markdown-preview {
  width: 100%;
  min-height: 120px;
  padding: 20px;
  color: white;
  font-size: 1.1rem;
  line-height: 1.6;
  overflow-y: auto;
  box-sizing: border-box;
  text-align: left;
}

.markdown-preview h1, .markdown-preview h2, .markdown-preview h3, .markdown-preview h4 {
  margin-top: 1em;
  margin-bottom: 0.5em;
  color: #a5b4fc;
  font-weight: 700;
  line-height: 1.3;
}
.markdown-preview h1 { font-size: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.3em; }
.markdown-preview h2 { font-size: 1.3rem; }
.markdown-preview h3 { font-size: 1.15rem; }

.markdown-preview p { margin: 0.8em 0; }
.markdown-preview ul, .markdown-preview ol { padding-left: 1.5em; margin: 0.8em 0; }
.markdown-preview li { margin-bottom: 0.4em; }

.markdown-preview code {
  background: rgba(0,0,0,0.3);
  padding: 2px 5px;
  border-radius: 4px;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  color: #e2e8f0;
}

.markdown-preview pre {
  background: rgba(0,0,0,0.3);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
}
.markdown-preview pre code {
  background: transparent;
  padding: 0;
  color: #f1f5f9;
}

.markdown-preview blockquote {
  border-left: 3px solid #6366f1;
  margin: 1em 0;
  padding-left: 1em;
  color: #94a3b8;
}

.text-input {
  width: 100%;
  background: transparent;
  border: none;
  color: white;
  padding: 16px 20px;
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
}

.text-input::placeholder {
  color: rgba(148, 163, 184, 0.5);
}

.generate-btn {
  align-self: flex-end;
  background: white;
  color: #0f172a;
  border: none;
  padding: 12px 32px;
  border-radius: 99px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(255, 255, 255, 0.2);
}

.generate-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

/* Grid */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 32px;
  width: 100%;
  animation: fadeUp 0.8s ease-out 0.2s both;
  align-items: start;
}

.empty-state {
  text-align: center;
  color: var(--text-secondary);
  grid-column: 1 / -1;
  padding: 60px 0;
  background: rgba(255,255,255,0.02);
  border-radius: 24px;
  border: 1px dashed rgba(255,255,255,0.1);
}

/* Dopa Card Component */
.dopa-card {
  background: var(--accent-gradient);
  background-size: 400% 400%;
  border-radius: 24px;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: gradientBG 15s ease infinite;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  min-height: 280px;
}

/* Skeleton Loading */
.skeleton-card {
  background: rgba(30, 41, 59, 0.4) !important;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: none;
  animation: none !important; /* Disable the breathing gradient */
}

.skeleton-pulse {
  background: #1e293b;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.03) 0%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.03) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Edit Mode Overrides */
.dopa-card.editing {
  height: auto !important; /* Force auto height to expand */
  min-height: 100%;
  overflow: visible;
  z-index: 50; /* Ensure high stacking context */
  transform: none !important; /* Disable hover movement */
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.8);
}

.dopa-card:hover:not(.editing) {
  transform: translateY(-8px) scale(1.01);
  z-index: 10;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.card-tag {
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #c7d2fe;
  backdrop-filter: blur(4px);
}

.card-actions {
  display: flex;
  gap: 8px;
}

.dopa-card h3 {
  margin: 0;
  font-weight: 700;
  font-size: 1.25rem;
  color: white;
  line-height: 1.3;
}

.dopa-card p {
  margin: 0;
  line-height: 1.6;
  color: #e2e8f0;
  font-size: 0.95rem;
  white-space: pre-wrap;
  flex-grow: 1;
}

.icon-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  backdrop-filter: blur(4px);
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.icon-btn.optimize {
  color: #fcd34d;
}
.icon-btn.optimize:hover {
  background: rgba(252, 211, 77, 0.2);
}
.icon-btn.optimizing {
  animation: pulse 1.5s infinite;
  cursor: wait;
}

.icon-btn.delete:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.icon-btn.saved {
  background: #4f46e5;
  color: white;
}

/* Edit Styles */
.edit-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.edit-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: -6px;
  font-weight: 600;
}

.edit-input {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  padding: 10px 14px;
  font-size: 0.95rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s, background 0.2s;
}

.edit-input:focus {
  border-color: #818cf8;
  background: rgba(0, 0, 0, 0.5);
}

.edit-input.title-input {
  font-size: 1.2rem;
  font-weight: 700;
}

.edit-input.tag-input {
  font-size: 0.85rem;
  padding: 8px 12px;
  width: 100%; 
}

/* On larger screens, make tag input auto width */
@media (min-width: 480px) {
  .edit-input.tag-input {
    width: auto;
    align-self: flex-start;
    min-width: 120px;
  }
}

.edit-textarea {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  padding: 14px;
  font-size: 1rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  outline: none;
  font-family: inherit;
  resize: vertical;
  min-height: 200px;
  line-height: 1.6;
  flex-grow: 1;
  transition: border-color 0.2s, background 0.2s;
}

.edit-textarea:focus {
  border-color: #818cf8;
  background: rgba(0, 0, 0, 0.5);
}

/* AI Refine Bar */
.ai-refine-bar {
  display: flex;
  gap: 8px;
  margin-top: 4px;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.ai-refine-input {
  flex-grow: 1;
  background: transparent;
  border: none;
  color: white;
  padding: 8px 12px;
  font-size: 0.9rem;
  outline: none;
}

.ai-refine-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.85rem;
}

.ai-refine-btn {
  background: var(--glass-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #c7d2fe;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.ai-refine-btn:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.2);
  color: white;
}

.ai-refine-btn:disabled {
  opacity: 0.5;
  cursor: wait;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.btn-small {
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.btn-save {
  background: #4f46e5;
  color: white;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}
.btn-save:hover { background: #4338ca; transform: translateY(-1px); }

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255,255,255,0.05);
}
.btn-cancel:hover { background: rgba(255, 255, 255, 0.2); }

/* Suggestion Dropdown */
.autocomplete-wrapper {
  position: relative;
  width: 100%;
}
.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
}
.suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.85rem;
  color: #cbd5e1;
  transition: background 0.2s;
}
.suggestion-item:hover {
  background: rgba(99, 102, 241, 0.2);
  color: white;
}

/* Animations */
@keyframes gradientBG {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(0,0,0,0.1);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
`;

interface PromptData {
  id: string;
  title: string;
  content: string;
  type: string;
  date: number;
}

interface DopaCardProps {
  data: PromptData;
  onSave?: (data: PromptData) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (data: PromptData) => void;
  onOptimize?: (data: PromptData) => void;
  onAiRefine?: (data: PromptData, instruction: string) => Promise<PromptData>;
  existingTypes?: string[];
  isSaved?: boolean;
  isOptimizing?: boolean;
}

// Utility for safe ID generation
const generateId = () => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch (e) {
    // Fallback
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Robust JSON parsing to handle potential Markdown wrapping or bad chars
const safeJsonParse = (text: string | undefined, fallback: any) => {
  if (!text) return fallback;
  
  // 1. Remove Markdown code blocks (```json ... ```) and generic ```
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '');
  
  // 2. Trim whitespace
  cleaned = cleaned.trim();
  
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn("JSON Parse Failed, attempting fallback.", e);
    // In strict mode we could try to escape newlines in values, but for now fallback is safer
    return fallback;
  }
};

const SkeletonCard = () => (
  <div className="dopa-card skeleton-card">
    <div className="card-header">
       <div className="skeleton-pulse" style={{width: '60px', height: '24px', borderRadius: '99px'}}></div>
       <div style={{display: 'flex', gap: '8px'}}>
          <div className="skeleton-pulse" style={{width: '32px', height: '32px', borderRadius: '50%'}}></div>
          <div className="skeleton-pulse" style={{width: '32px', height: '32px', borderRadius: '50%'}}></div>
       </div>
    </div>
    <div className="skeleton-pulse" style={{width: '70%', height: '24px', margin: '8px 0', borderRadius: '4px'}}></div>
    <div style={{display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1, marginTop: '8px'}}>
       <div className="skeleton-pulse" style={{width: '100%', height: '14px'}}></div>
       <div className="skeleton-pulse" style={{width: '92%', height: '14px'}}></div>
       <div className="skeleton-pulse" style={{width: '96%', height: '14px'}}></div>
       <div className="skeleton-pulse" style={{width: '85%', height: '14px'}}></div>
       <div className="skeleton-pulse" style={{width: '90%', height: '14px'}}></div>
    </div>
    <div className="skeleton-pulse" style={{width: '50px', height: '12px', marginTop: '16px'}}></div>
  </div>
);

const DopaCard = ({ data, onSave, onDelete, onUpdate, onOptimize, onAiRefine, existingTypes = [], isSaved, isOptimizing }: DopaCardProps) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(data);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // AI Refine State
  const [aiInstruction, setAiInstruction] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  useEffect(() => {
    setEditData(data);
  }, [data]);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  };

  const saveEdit = () => {
    if (onUpdate) {
      onUpdate(editData);
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditData(data);
    setIsEditing(false);
  };

  const filteredTypes = existingTypes.filter(t => 
    t.toLowerCase().includes(editData.type.toLowerCase()) && t !== editData.type
  );

  const handleAiRefineSubmit = async () => {
    if (!aiInstruction.trim() || !onAiRefine) return;
    setIsRefining(true);
    try {
      const refinedData = await onAiRefine(editData, aiInstruction);
      setEditData(refinedData); // Update the edit view with new data
      setAiInstruction(""); // Clear instruction
    } catch (e) {
      console.error(e);
      alert("AI 优化失败，请重试");
    } finally {
      setIsRefining(false);
    }
  };

  if (isEditing) {
    return (
      <div className="dopa-card editing">
        <div className="edit-container">
          <label className="edit-label">分类</label>
          <div className="autocomplete-wrapper">
             <input 
              className="edit-input tag-input"
              value={editData.type}
              onChange={(e) => setEditData({...editData, type: e.target.value})}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="类别"
            />
            {showSuggestions && filteredTypes.length > 0 && (
              <div className="suggestions-list">
                {filteredTypes.map(type => (
                  <div 
                    key={type} 
                    className="suggestion-item"
                    onClick={() => setEditData({...editData, type: type})}
                  >
                    {type}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <label className="edit-label">标题</label>
          <input 
            className="edit-input title-input"
            value={editData.title}
            onChange={(e) => setEditData({...editData, title: e.target.value})}
            placeholder="标题"
          />
          
          <label className="edit-label">内容</label>
          <textarea 
            className="edit-textarea"
            value={editData.content}
            onChange={(e) => setEditData({...editData, content: e.target.value})}
            placeholder="提示词内容..."
          />

          {onAiRefine && (
            <>
              <label className="edit-label" style={{marginTop: '4px'}}>AI 助手</label>
              <div className="ai-refine-bar">
                <input 
                  className="ai-refine-input"
                  placeholder="输入指令（例如：翻译成英文、更专业一点、精简内容）..."
                  value={aiInstruction}
                  onChange={(e) => setAiInstruction(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiRefineSubmit()}
                  disabled={isRefining}
                />
                <button 
                  className="ai-refine-btn" 
                  onClick={handleAiRefineSubmit}
                  disabled={isRefining || !aiInstruction.trim()}
                  title="发送指令"
                >
                  {isRefining ? (
                    <div className="loading-spinner" style={{width: '14px', height: '14px', borderWidth: '2px'}}></div>
                  ) : (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </>
          )}
          
          <div className="edit-actions">
            <button className="btn-small btn-cancel" onClick={cancelEdit}>取消</button>
            <button className="btn-small btn-save" onClick={saveEdit}>保存修改</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dopa-card">
      <div className="card-header">
        <span className="card-tag">{data.type}</span>
        <div className="card-actions">
           {onOptimize && (
            <button
              className={`icon-btn optimize ${isOptimizing ? 'optimizing' : ''}`}
              onClick={() => onOptimize(data)}
              disabled={isOptimizing}
              title={isOptimizing ? "正在优化..." : "智能优化"}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          )}
          {onUpdate && (
             <button 
              className="icon-btn" 
              onClick={() => setIsEditing(true)} 
              title="编辑提示词"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
          {onSave && (
            <button 
              className={`icon-btn ${isSaved ? 'saved' : ''}`} 
              onClick={() => onSave(data)} 
              title={isSaved ? "已保存" : "保存到资料库"}
            >
              <svg width="16" height="16" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button 
              className="icon-btn delete" 
              onClick={() => onDelete(data.id)} 
              title="从资料库删除"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          <button className="icon-btn" onClick={handleCopy} title="复制内容">
            {copied ? (
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <h3>{data.title}</h3>
      <p>{data.content}</p>
      <div style={{ marginTop: 'auto', paddingTop: '16px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
        {formatDate(data.date)}
      </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState<'studio' | 'library'>('studio');
  const [inputText, setInputText] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [promptTopic, setPromptTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [optimizingId, setOptimizingId] = useState<string | null>(null);
  const [generatedPrompts, setGeneratedPrompts] = useState<PromptData[]>([]);
  
  // Library State
  const [savedPrompts, setSavedPrompts] = useState<PromptData[]>(() => {
    try {
      const saved = localStorage.getItem('dopa-saved-prompts');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse local storage:", error);
      return [];
    }
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("全部");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('dopa-saved-prompts', JSON.stringify(savedPrompts));
  }, [savedPrompts]);

  const savePrompt = (prompt: PromptData) => {
    if (savedPrompts.some(p => p.id === prompt.id)) {
      setSavedPrompts(prev => prev.filter(p => p.id !== prompt.id)); // Toggle off if exists
    } else {
      setSavedPrompts(prev => [prompt, ...prev]);
    }
  };

  const deletePrompt = (id: string) => {
    setSavedPrompts(prev => prev.filter(p => p.id !== id));
  };

  const clearLibrary = () => {
    if (window.confirm("确定要清空所有已保存的提示词吗？此操作不可撤销。")) {
      setSavedPrompts([]);
    }
  };

  const updateGeneratedPrompt = (updatedPrompt: PromptData) => {
    setGeneratedPrompts(prev => prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p));
  };

  // AI Refine Function
  const refinePromptWithAi = async (data: PromptData, instruction: string): Promise<PromptData> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `你是一个智能编辑器。
      
      当前数据：
      标题：${data.title}
      分类：${data.type}
      内容：${data.content}

      用户指令：${instruction}

      请根据用户指令修改上述数据（包括标题、分类或内容）。
      请只修改有必要的部分，保持其他部分不变。
      以 JSON 格式返回修改后的完整对象（id 和 date 除外）。
      返回格式示例：{ "title": "...", "type": "...", "content": "..." }`,
      config: {
        responseMimeType: "application/json"
      }
    });

    // Use safeJsonParse instead of JSON.parse
    const refined = safeJsonParse(response.text, {});
    return { ...data, ...refined };
  };

  const optimizePrompt = async (data: PromptData) => {
    setOptimizingId(data.id);
    try {
       const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
       const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `你是一位提示词工程专家。请优化以下提示词，使其更加结构化、清晰，并能引导大语言模型生成更好的结果。
        
        原标题：${data.title}
        原类别：${data.type}
        原内容：${data.content}

        要求：
        1. 保持原意，但增加细节和上下文。
        2. 使用专业的提示词技巧（如角色设定、任务分解）。
        3. 以 JSON 格式返回，包含优化后的 title, type, content。
        `,
        config: {
          responseMimeType: "application/json"
        }
      });

      // Use safeJsonParse instead of JSON.parse
      const optimized = safeJsonParse(response.text, {});
      
      if (optimized.content) {
        const newData = { ...data, ...optimized };
        
        // Update wherever the prompt exists
        setGeneratedPrompts(prev => prev.map(p => p.id === data.id ? newData : p));
        setSavedPrompts(prev => prev.map(p => p.id === data.id ? newData : p));
      }
    } catch (e) {
      console.error("Optimization failed", e);
      alert("优化失败，请稍后重试");
    } finally {
      setOptimizingId(null);
    }
  };

  const generatePrompts = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setGeneratedPrompts([]); // Clear current prompts to show skeletons

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const fullPrompt = promptTopic 
        ? `主题：${promptTopic}\n详细描述：${inputText}`
        : inputText;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `针对以下用户请求生成 3 个独特、高质量的中文提示词变体：
        
        ${fullPrompt}
        
        请以 JSON 数组格式返回，每个对象包含：
        - title: 一个简短、吸引人的标题（最多 10 个字）
        - type: 通用类别，例如“创意写作”、“代码开发”、“商业应用”、“学术研究”、“生活方式”。
        - content: 实际的提示词内容（建议 100 字以内，使用中文）。
        
        示例格式：
        [
          {"title": "科幻小说构思", "type": "创意写作", "content": "写一个关于..."}
        ]`,
        config: {
          responseMimeType: "application/json"
        }
      });

      // Use safeJsonParse instead of JSON.parse
      const rawData = safeJsonParse(response.text, []);
      const formattedData: PromptData[] = Array.isArray(rawData) ? rawData.map(item => ({
        ...item,
        id: generateId(),
        date: Date.now()
      })) : [];
      
      setGeneratedPrompts(formattedData);
    } catch (error) {
      console.error("Error generating prompts:", error);
      setGeneratedPrompts([{
        id: "error",
        title: "连接错误",
        content: "无法生成提示词，请检查网络或重试。",
        type: "系统信息",
        date: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Filter & Sort Logic for Library
  const filteredLibrary = useMemo(() => {
    // 1. Filter
    const filtered = savedPrompts.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedFilter === "全部" || p.type === selectedFilter;
      return matchesSearch && matchesType;
    });

    // 2. Sort
    return filtered.sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.date - a.date; // Newest first
      } else {
        return a.date - b.date; // Oldest first
      }
    });
  }, [savedPrompts, searchQuery, selectedFilter, sortOrder]);

  const uniqueTypes = useMemo(() => {
    const types = new Set(savedPrompts.map(p => p.type));
    return ["全部", ...Array.from(types)];
  }, [savedPrompts]);

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app-container">
        <header>
          <h1>Gemini 提示词工坊</h1>
          <p>设计、生成并高效管理您的 AI 工作流。</p>
        </header>

        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'studio' ? 'active' : ''}`}
            onClick={() => setActiveTab('studio')}
          >
            创作室
          </button>
          <button 
            className={`nav-tab ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => setActiveTab('library')}
          >
            资料库 ({savedPrompts.length})
          </button>
        </div>

        {activeTab === 'studio' ? (
          <>
            <div className="input-section">
              <div className="input-wrapper">
                <button 
                  className="preview-toggle" 
                  onClick={() => setShowPreview(!showPreview)}
                  title={showPreview ? "切换回编辑模式" : "预览 Markdown"}
                >
                   {showPreview ? (
                    <>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      编辑
                    </>
                   ) : (
                    <>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      预览
                    </>
                   )}
                </button>
                
                {showPreview ? (
                  <div 
                    className="markdown-preview"
                    dangerouslySetInnerHTML={{ __html: parse(inputText || "*暂无内容*") }}
                  />
                ) : (
                  <textarea 
                    placeholder="描述您的提示词想法（支持 Markdown 格式）..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        generatePrompts();
                      }
                    }}
                  />
                )}
              </div>

              <div className="input-wrapper">
                <input 
                  type="text" 
                  className="text-input"
                  placeholder="提示词主题/关键词（选填，例如：科幻、周报、教育...）"
                  value={promptTopic}
                  onChange={(e) => setPromptTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      generatePrompts();
                    }
                  }}
                />
              </div>

              <button 
                className="generate-btn" 
                onClick={generatePrompts} 
                disabled={loading || !inputText.trim()}
              >
                {loading && <div className="loading-spinner" />}
                <span>{loading ? "正在生成..." : "生成提示词"}</span>
              </button>
            </div>

            {/* Grid Container */}
            <div className="results-grid">
               {/* Skeleton Loading State */}
               {loading && (
                 <>
                   <SkeletonCard />
                   <SkeletonCard />
                   <SkeletonCard />
                 </>
               )}

               {/* Actual Results */}
               {!loading && generatedPrompts.map((prompt) => (
                  <DopaCard 
                    key={prompt.id}
                    data={prompt}
                    onSave={savePrompt}
                    onUpdate={updateGeneratedPrompt}
                    onOptimize={optimizePrompt}
                    onAiRefine={refinePromptWithAi}
                    existingTypes={uniqueTypes}
                    isSaved={savedPrompts.some(p => p.id === prompt.id)}
                    isOptimizing={optimizingId === prompt.id}
                  />
                ))}

                {/* Empty State */}
                {!loading && generatedPrompts.length === 0 && (
                   <div className="empty-state">
                     <h3>准备好开始创作了吗？</h3>
                     <p>在上方输入主题，AI 将为您生成多种创意方案。</p>
                   </div>
                )}
            </div>
          </>
        ) : (
          <div className="library-section">
            <div className="library-controls">
              <div className="search-bar">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" color="#94a3b8">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="搜索已保存的提示词..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {savedPrompts.length > 0 && (
                <>
                  <div className="filter-chips">
                    {uniqueTypes.map(type => (
                      <button 
                        key={type}
                        className={`chip ${selectedFilter === type ? 'active' : ''}`}
                        onClick={() => setSelectedFilter(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <div className="sort-controls">
                    <button className="sort-btn" onClick={toggleSort}>
                      <span className={`sort-icon ${sortOrder}`}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </span>
                      {sortOrder === 'desc' ? "排序：最新优先" : "排序：最早优先"}
                    </button>
                    <button className="btn-clear" onClick={clearLibrary}>
                      清空资料库
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="results-grid" style={{marginTop: '32px'}}>
              {filteredLibrary.map((prompt) => (
                <DopaCard 
                  key={prompt.id}
                  data={prompt}
                  onDelete={deletePrompt}
                  onOptimize={optimizePrompt}
                  onAiRefine={refinePromptWithAi}
                  existingTypes={uniqueTypes}
                  isOptimizing={optimizingId === prompt.id}
                />
              ))}
              
              {savedPrompts.length === 0 && (
                <div className="empty-state">
                  <h3>资料库为空</h3>
                  <p>前往“创作室”生成并保存您的第一个提示词！</p>
                </div>
              )}

              {savedPrompts.length > 0 && filteredLibrary.length === 0 && (
                <div className="empty-state">
                  <p>没有找到匹配的提示词。</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}