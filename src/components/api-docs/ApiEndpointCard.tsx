"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CodeBlock from "./CodeBlock";

interface ApiEndpoint {
  id: string;
  method: string;
  path: string;
  title: string;
  description: string;
  requiresAuth: boolean;
  authType?: string;
  requestBody?: any;
  responseExample?: any;
  pathParams?: any;
  queryParams?: any;
  codeExamples?: {
    curl?: string;
    javascript?: string;
    python?: string;
  };
}

interface ApiEndpointCardProps {
  endpoint: ApiEndpoint;
  onSelect: () => void;
  isSelected: boolean;
  onTryIt?: () => void;
}

export default function ApiEndpointCard({ endpoint, onSelect, isSelected, onTryIt }: ApiEndpointCardProps) {
  const [activeLanguage, setActiveLanguage] = useState<"curl" | "javascript" | "python">("curl");

  const methodColors: Record<string, { bg: string; text: string }> = {
    GET: { bg: "bg-emerald-50", text: "text-emerald-700" },
    POST: { bg: "bg-blue-50", text: "text-blue-700" },
    PUT: { bg: "bg-amber-50", text: "text-amber-700" },
    DELETE: { bg: "bg-red-50", text: "text-red-700" },
  };

  const colors = methodColors[endpoint.method] || methodColors.GET;

  return (
    <div
      className={`bg-white border rounded-lg transition-all ${
        isSelected
          ? "border-blue-500 shadow-sm"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Header */}
      <button
        onClick={onSelect}
        className="w-full p-5 text-left hover:bg-gray-50 rounded-t-lg transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className={`${colors.bg} ${colors.text} px-2.5 py-1 rounded text-xs font-semibold uppercase`}>
                {endpoint.method}
              </span>
              <code className="text-sm font-mono bg-gray-100 px-3 py-1 rounded text-gray-700">
                {endpoint.path}
              </code>
              {endpoint.requiresAuth && (
                <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {endpoint.authType}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{endpoint.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{endpoint.description}</p>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
              isSelected ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-200"
          >
            <div className="p-5 space-y-6 bg-gray-50">
              {onTryIt && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onTryIt}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    Test this endpoint
                  </button>
                </div>
              )}

              {/* Path Parameters */}
              {endpoint.pathParams && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Path Parameters</h4>
                  <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
                    {Object.entries(endpoint.pathParams).map(([key, value]) => (
                      <div key={key} className="p-3">
                        <code className="text-sm font-mono text-blue-600 font-medium">{key}</code>
                        <p className="text-sm text-gray-600 mt-1">{value as string}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Query Parameters */}
              {endpoint.queryParams && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Query Parameters</h4>
                  <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
                    {Object.entries(endpoint.queryParams).map(([key, value]) => (
                      <div key={key} className="p-3">
                        <code className="text-sm font-mono text-purple-600 font-medium">{key}</code>
                        <p className="text-sm text-gray-600 mt-1">{value as string}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Request Body */}
              {endpoint.requestBody && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Request Body</h4>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <pre className="text-xs text-gray-700 font-mono overflow-x-auto">
                      {JSON.stringify(endpoint.requestBody, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Response Example */}
              {endpoint.responseExample && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Response Example</h4>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <pre className="text-xs text-gray-700 font-mono overflow-x-auto">
                      {JSON.stringify(endpoint.responseExample, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Code Examples */}
              {endpoint.codeExamples && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Code Examples</h4>

                  {/* Language Tabs */}
                  <div className="flex gap-1 mb-3 bg-gray-200 p-1 rounded-lg w-fit">
                    {endpoint.codeExamples.curl && (
                      <button
                        onClick={() => setActiveLanguage("curl")}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          activeLanguage === "curl"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        cURL
                      </button>
                    )}
                    {endpoint.codeExamples.javascript && (
                      <button
                        onClick={() => setActiveLanguage("javascript")}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          activeLanguage === "javascript"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        JavaScript
                      </button>
                    )}
                    {endpoint.codeExamples.python && (
                      <button
                        onClick={() => setActiveLanguage("python")}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          activeLanguage === "python"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Python
                      </button>
                    )}
                  </div>

                  {/* Code Display */}
                  <CodeBlock
                    code={endpoint.codeExamples[activeLanguage] || ""}
                    language={activeLanguage}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
