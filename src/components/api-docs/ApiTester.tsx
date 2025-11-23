"use client";

import { useState } from "react";

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
}

interface ApiTesterProps {
  endpoints: ApiEndpoint[];
}

export default function ApiTester({ endpoints }: ApiTesterProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>(endpoints[0]?.id || "");
  const [apiKey, setApiKey] = useState("");
  const [requestBody, setRequestBody] = useState("");
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentEndpoint = endpoints.find((e) => e.id === selectedEndpoint);

  const handleEndpointChange = (endpointId: string) => {
    setSelectedEndpoint(endpointId);
    const endpoint = endpoints.find((e) => e.id === endpointId);
    if (endpoint?.requestBody) {
      setRequestBody(JSON.stringify(endpoint.requestBody, null, 2));
    } else {
      setRequestBody("");
    }
    setPathParams({});
    setQueryParams({});
    setResponse(null);
    setError(null);
  };

  const handleTest = async () => {
    if (!currentEndpoint) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Build URL with path params
      let url = currentEndpoint.path;
      Object.entries(pathParams).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, value);
      });

      // Add query params
      const queryString = new URLSearchParams(queryParams).toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      // Build request options
      const options: RequestInit = {
        method: currentEndpoint.method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (apiKey) {
        (options.headers as Record<string, string>)["X-API-Key"] = apiKey;
      }

      if (currentEndpoint.method !== "GET" && requestBody) {
        options.body = requestBody;
      }

      // Make request
      const res = await fetch(url, options);
      const data = await res.json();

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: data,
      });
    } catch (err: any) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Request Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Configuration</h2>

          {/* Endpoint Selection */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Endpoint
            </label>
            <select
              value={selectedEndpoint}
              onChange={(e) => handleEndpointChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
            >
              {endpoints.map((endpoint) => (
                <option key={endpoint.id} value={endpoint.id}>
                  {endpoint.method} - {endpoint.title}
                </option>
              ))}
            </select>
          </div>

          {/* API Key */}
          {currentEndpoint?.requiresAuth && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
              />
            </div>
          )}

          {/* Path Parameters */}
          {currentEndpoint?.pathParams && Object.keys(currentEndpoint.pathParams).length > 0 && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Path Parameters
              </label>
              <div className="space-y-3">
                {Object.keys(currentEndpoint.pathParams).map((key) => (
                  <div key={key}>
                    <label className="text-xs text-gray-600 mb-1 block font-medium">{key}</label>
                    <input
                      type="text"
                      value={pathParams[key] || ""}
                      onChange={(e) => setPathParams({ ...pathParams, [key]: e.target.value })}
                      placeholder={`Enter ${key}`}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Query Parameters */}
          {currentEndpoint?.queryParams && Object.keys(currentEndpoint.queryParams).length > 0 && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Query Parameters (Optional)
              </label>
              <div className="space-y-3">
                {Object.keys(currentEndpoint.queryParams).map((key) => (
                  <div key={key}>
                    <label className="text-xs text-gray-600 mb-1 block font-medium">{key}</label>
                    <input
                      type="text"
                      value={queryParams[key] || ""}
                      onChange={(e) => setQueryParams({ ...queryParams, [key]: e.target.value })}
                      placeholder={`Enter ${key}`}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request Body */}
          {currentEndpoint?.method !== "GET" && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Body (JSON)
              </label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-mono text-xs"
                placeholder='{"key": "value"}'
              />
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleTest}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending Request...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                Send Request
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Panel - Response */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Response</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-red-900 text-sm">Error</p>
                <p className="text-red-800 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {response && (
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Status:</span>
              <span
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  response.status >= 200 && response.status < 300
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {response.status} {response.statusText}
              </span>
            </div>

            {/* Response Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Response Body</label>
              <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                <pre className="p-4 overflow-x-auto max-h-96 overflow-y-auto">
                  <code className="text-xs text-gray-300 font-mono leading-relaxed">
                    {JSON.stringify(response.body, null, 2)}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {!response && !error && (
          <div className="flex flex-col items-center justify-center h-80 text-gray-400">
            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-base font-medium text-gray-500">No response yet</p>
            <p className="text-sm text-gray-400 mt-1">Configure and send a request to see the response</p>
          </div>
        )}
      </div>
    </div>
  );
}
