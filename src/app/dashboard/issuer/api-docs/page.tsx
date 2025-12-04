"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ApiEndpointCard, ApiTester } from "@/components/api-docs";

export default function IssuerApiDocsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"docs" | "test">("docs");
  const [activeSection, setActiveSection] = useState<string>("introduction");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("v1");
  const [apiType, setApiType] = useState<"issuer" | "employer">("issuer");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const endpoints = [
    {
      id: "submit-credential",
      method: "POST",
      path: "/api/v1/issuer/credentials",
      title: "Submit Single Credential",
      description: "Submit a single credential for processing and verification. This API allows you to issue one credential at a time with full control over the credential data.",
      requiresAuth: true,
      authType: "API Key",
      requestBody: {
        learner_id: "string (required) - The unique identifier of the learner",
        credential_type: "string (required) - Type of credential (e.g., 'certificate', 'diploma')",
        credential_data: {
          credential_name: "string - Name of the credential",
          issuer_name: "string - Name of the issuing organization",
          issue_date: "string - Date of issuance (ISO format)",
          expiry_date: "string (optional) - Expiry date if applicable",
          metadata: "object (optional) - Additional metadata"
        },
        idempotency_key: "string (required) - Unique key to prevent duplicate submissions"
      },
      responseExample: {
        credential_id: "507f1f77bcf86cd799439011",
        status: "pending",
        message: "Credential submitted successfully",
        learner_id: "507f191e810c19729de860ea",
        created_at: "2024-01-15T10:30:00Z"
      },
      codeExamples: {
        curl: `curl -X POST https://your-domain.com/api/v1/issuer/credentials \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your-api-key-here" \\
  -d '{
    "learner_id": "507f191e810c19729de860ea",
    "credential_type": "certificate",
    "credential_data": {
      "credential_name": "Python Programming Certificate",
      "issuer_name": "Tech Academy",
      "issue_date": "2024-01-15T00:00:00Z"
    },
    "idempotency_key": "unique-key-12345"
  }'`,
        javascript: `const response = await fetch('https://your-domain.com/api/v1/issuer/credentials', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key-here'
  },
  body: JSON.stringify({
    learner_id: '507f191e810c19729de860ea',
    credential_type: 'certificate',
    credential_data: {
      credential_name: 'Python Programming Certificate',
      issuer_name: 'Tech Academy',
      issue_date: '2024-01-15T00:00:00Z'
    },
    idempotency_key: 'unique-key-12345'
  })
});

const data = await response.json();
console.log(data);`,
        python: `import requests

url = "https://your-domain.com/api/v1/issuer/credentials"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "your-api-key-here"
}
payload = {
    "learner_id": "507f191e810c19729de860ea",
    "credential_type": "certificate",
    "credential_data": {
        "credential_name": "Python Programming Certificate",
        "issuer_name": "Tech Academy",
        "issue_date": "2024-01-15T00:00:00Z"
    },
    "idempotency_key": "unique-key-12345"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`
      }
    },
    {
      id: "bulk-credentials",
      method: "POST",
      path: "/api/v1/issuer/credentials/bulk",
      title: "Submit Bulk Credentials",
      description: "Submit multiple credentials in a single batch for efficient processing. Ideal for issuing credentials to multiple learners simultaneously.",
      requiresAuth: true,
      authType: "API Key",
      requestBody: {
        credentials: "array (required) - Array of credential objects",
        batch_name: "string (optional) - Name for this batch",
        idempotency_key: "string (required) - Unique key for the entire batch"
      },
      responseExample: {
        batch_id: "507f1f77bcf86cd799439011",
        status: "processing",
        total_credentials: 10,
        processed_credentials: 0,
        successful_credentials: 0,
        failed_credentials: 0,
        created_at: "2024-01-15T10:30:00Z"
      },
      codeExamples: {
        curl: `curl -X POST https://your-domain.com/api/v1/issuer/credentials/bulk \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your-api-key-here" \\
  -d '{
    "batch_name": "January 2024 Graduates",
    "idempotency_key": "batch-unique-key-12345",
    "credentials": [
      {
        "learner_id": "507f191e810c19729de860ea",
        "credential_type": "certificate",
        "credential_data": {
          "credential_name": "Python Certificate",
          "issuer_name": "Tech Academy",
          "issue_date": "2024-01-15T00:00:00Z"
        }
      }
    ]
  }'`,
        javascript: `const response = await fetch('https://your-domain.com/api/v1/issuer/credentials/bulk', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key-here'
  },
  body: JSON.stringify({
    batch_name: 'January 2024 Graduates',
    idempotency_key: 'batch-unique-key-12345',
    credentials: [
      {
        learner_id: '507f191e810c19729de860ea',
        credential_type: 'certificate',
        credential_data: {
          credential_name: 'Python Certificate',
          issuer_name: 'Tech Academy',
          issue_date: '2024-01-15T00:00:00Z'
        }
      }
    ]
  })
});

const data = await response.json();
console.log(data);`,
        python: `import requests

url = "https://your-domain.com/api/v1/issuer/credentials/bulk"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "your-api-key-here"
}
payload = {
    "batch_name": "January 2024 Graduates",
    "idempotency_key": "batch-unique-key-12345",
    "credentials": [
        {
            "learner_id": "507f191e810c19729de860ea",
            "credential_type": "certificate",
            "credential_data": {
                "credential_name": "Python Certificate",
                "issuer_name": "Tech Academy",
                "issue_date": "2024-01-15T00:00:00Z"
            }
        }
    ]
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`
      }
    },
    {
      id: "get-credential-status",
      method: "GET",
      path: "/api/v1/issuer/credentials/{credential_id}/status",
      title: "Get Credential Status",
      description: "Check the processing status of a submitted credential. Use this to track the progress of credential issuance.",
      requiresAuth: true,
      authType: "API Key",
      pathParams: {
        credential_id: "string (required) - The unique identifier of the credential"
      },
      responseExample: {
        credential_id: "507f1f77bcf86cd799439011",
        status: "verified",
        learner_id: "507f191e810c19729de860ea",
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:35:00Z",
        verified_at: "2024-01-15T10:35:00Z"
      },
      codeExamples: {
        curl: `curl -X GET https://your-domain.com/api/v1/issuer/credentials/507f1f77bcf86cd799439011/status \\
  -H "X-API-Key: your-api-key-here"`,
        javascript: `const response = await fetch(
  'https://your-domain.com/api/v1/issuer/credentials/507f1f77bcf86cd799439011/status',
  {
    headers: {
      'X-API-Key': 'your-api-key-here'
    }
  }
);

const data = await response.json();
console.log(data);`,
        python: `import requests

credential_id = "507f1f77bcf86cd799439011"
url = f"https://your-domain.com/api/v1/issuer/credentials/{credential_id}/status"
headers = {"X-API-Key": "your-api-key-here"}

response = requests.get(url, headers=headers)
print(response.json())`
      }
    },
    {
      id: "list-credentials",
      method: "GET",
      path: "/api/v1/issuer/credentials",
      title: "List Credentials",
      description: "Get a paginated list of all credentials issued by your organization with optional filtering.",
      requiresAuth: true,
      authType: "API Key",
      queryParams: {
        page: "number (optional, default: 1) - Page number",
        limit: "number (optional, default: 10) - Items per page",
        sort_by: "string (optional, default: 'issued_at') - Field to sort by",
        sort_order: "string (optional, default: 'desc') - Sort order (asc/desc)",
        credential_status: "string (optional) - Filter by status"
      },
      responseExample: {
        credentials: [
          {
            credential_id: "507f1f77bcf86cd799439011",
            status: "verified",
            credential_type: "certificate",
            created_at: "2024-01-15T10:30:00Z",
            learner_id: "507f191e810c19729de860ea"
          }
        ],
        total: 100,
        page: 1,
        limit: 10,
        total_pages: 10
      },
      codeExamples: {
        curl: `curl -X GET "https://your-domain.com/api/v1/issuer/credentials?page=1&limit=10" \\
  -H "X-API-Key: your-api-key-here"`,
        javascript: `const response = await fetch(
  'https://your-domain.com/api/v1/issuer/credentials?page=1&limit=10',
  {
    headers: {
      'X-API-Key': 'your-api-key-here'
    }
  }
);

const data = await response.json();
console.log(data);`,
        python: `import requests

url = "https://your-domain.com/api/v1/issuer/credentials"
headers = {"X-API-Key": "your-api-key-here"}
params = {"page": 1, "limit": 10}

response = requests.get(url, headers=headers, params=params)
print(response.json())`
      }
    }
  ];

  const filteredEndpoints = endpoints.filter(endpoint =>
    endpoint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    endpoint.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navigateToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setActiveTab('docs'); // Switch to docs tab
    setSidebarOpen(false); // Close sidebar on mobile
  };

  // Define section order for navigation
  const sectionOrder = [
    'introduction',
    'getting-started',
    'authentication',
    'infrastructure',
    'test',
    ...endpoints.map(e => e.id)
  ];

  const getCurrentSectionIndex = () => {
    if (activeTab === 'test') return sectionOrder.indexOf('test');
    if (activeSection === 'endpoints' && selectedEndpoint) {
      return sectionOrder.indexOf(selectedEndpoint);
    }
    return sectionOrder.indexOf(activeSection);
  };

  const goToNextSection = () => {
    const currentIndex = getCurrentSectionIndex();
    if (currentIndex < sectionOrder.length - 1) {
      const nextSection = sectionOrder[currentIndex + 1];
      if (nextSection === 'test') {
        setActiveTab('test');
        setActiveSection('test');
      } else if (endpoints.some(e => e.id === nextSection)) {
        setActiveSection('endpoints');
        setSelectedEndpoint(nextSection);
      } else {
        navigateToSection(nextSection);
      }
    }
  };

  const goToPreviousSection = () => {
    const currentIndex = getCurrentSectionIndex();
    if (currentIndex > 0) {
      const prevSection = sectionOrder[currentIndex - 1];
      if (prevSection === 'test') {
        setActiveTab('test');
        setActiveSection('test');
      } else if (endpoints.some(e => e.id === prevSection)) {
        setActiveSection('endpoints');
        setSelectedEndpoint(prevSection);
      } else {
        navigateToSection(prevSection);
      }
    }
  };

  const isFirstSection = getCurrentSectionIndex() === 0;
  const isLastSection = getCurrentSectionIndex() === sectionOrder.length - 1;

  // Navigation Buttons Component
  const NavigationButtons = () => (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
      <button
        onClick={goToPreviousSection}
        disabled={isFirstSection}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
          isFirstSection
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>

      <div className="text-sm text-gray-500">
        {getCurrentSectionIndex() + 1} of {sectionOrder.length}
      </div>

      <button
        onClick={goToNextSection}
        disabled={isLastSection}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
          isLastSection
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        Next
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Header with API Type Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">API Documentation</h1>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* API Type Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setApiType('issuer')}
              className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                apiType === 'issuer'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Issuer API
              {apiType === 'issuer' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>

            <button
              onClick={() => setApiType('employer')}
              className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                apiType === 'employer'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              disabled
            >
              Employer API
              <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Coming Soon</span>
              {apiType === 'employer' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar - Navigation */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white border-r border-gray-200 overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
        <div className="p-4 space-y-4 sticky top-0">
          {/* Version Selector */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              API Version
            </label>
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="v1">v1 (Current)</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search endpoints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Documentation
            </div>
            
            <button
              onClick={() => navigateToSection('introduction')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === 'introduction'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Introduction
            </button>

            <button
              onClick={() => navigateToSection('getting-started')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === 'getting-started'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Getting Started
            </button>

            <button
              onClick={() => navigateToSection('authentication')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === 'authentication'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Authentication
            </button>

            <button
              onClick={() => navigateToSection('infrastructure')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === 'infrastructure'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Infrastructure
            </button>

            <button
              onClick={() => {
                setActiveTab('test');
                setActiveSection('test');
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === 'test'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Try It Out
            </button>

            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-4 mb-2">
              API Endpoints
            </div>

            {filteredEndpoints.map((endpoint) => (
              <button
                key={endpoint.id}
                onClick={() => {
                  setActiveSection('endpoints');
                  setActiveTab('docs');
                  setSelectedEndpoint(endpoint.id);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedEndpoint === endpoint.id && activeSection === 'endpoints'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${
                    endpoint.method === 'GET' ? 'text-emerald-600' :
                    endpoint.method === 'POST' ? 'text-blue-600' :
                    endpoint.method === 'PUT' ? 'text-amber-600' :
                    'text-red-600'
                  }`}>
                    {endpoint.method}
                  </span>
                  <span className="truncate">{endpoint.title}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {activeTab === 'test' ? (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">API Testing</h2>
                <p className="text-base text-gray-600">
                  Test API endpoints directly from your browser
                </p>
              </div>
              <ApiTester
                endpoints={endpoints}
                initialEndpointId={selectedEndpoint || endpoints[0]?.id}
              />
              <NavigationButtons />
            </div>
          ) : (
          <>
            {/* Introduction Section */}
            {activeSection === 'introduction' && (
            <section>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
                <div className="prose prose-sm max-w-none text-gray-600 space-y-4">
                  <p className="text-base leading-relaxed">
                    Welcome to the CredHub Issuer API. Our platform empowers educational institutions, training organizations, 
                    and certification bodies to issue verifiable digital credentials at scale. Whether you're issuing certificates, 
                    diplomas, or skill badges, our APIs provide the tools you need to integrate credential issuance seamlessly into 
                    your existing systems.
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">What You Can Do</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700">
                    <li>Issue single or bulk credentials programmatically</li>
                    <li>Track credential status in real-time</li>
                    <li>Generate blockchain-verified credentials with QR codes</li>
                    <li>Manage learner credentials through our portal or API</li>
                    <li>Revoke or update credentials when needed</li>
                    <li>Access detailed analytics and reporting</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Portal vs API</h3>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Web Portal
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• User-friendly interface</li>
                        <li>• Manual credential issuance</li>
                        <li>• Bulk upload via CSV/Excel</li>
                        <li>• Visual dashboard and analytics</li>
                        <li>• No technical knowledge required</li>
                      </ul>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        REST API
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Programmatic integration</li>
                        <li>• Automated workflows</li>
                        <li>• Real-time processing</li>
                        <li>• Custom business logic</li>
                        <li>• Scalable for high volumes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <NavigationButtons />
            </section>
            )}

            {/* Getting Started Section */}
            {activeSection === 'getting-started' && (
            <section>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Getting Started</h2>
                <div className="prose prose-sm max-w-none text-gray-600 space-y-4">
                  <p className="text-base leading-relaxed">
                    Follow these steps to start issuing credentials through our API:
                  </p>

                  <div className="space-y-4 mt-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Create Issuer Account</h4>
                        <p className="text-sm text-gray-600">
                          Register on our platform and select "Issuer/Institution" as your account type.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Complete GSTIN Verification</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Submit your organization details including GSTIN for verification. This ensures only legitimate 
                          institutions can issue credentials. You'll need to provide:
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                          <li>Organization name and registration number</li>
                          <li>GSTIN (Goods and Services Tax Identification Number)</li>
                          <li>Registration certificate</li>
                          <li>Authorized representative details</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Generate API Key</h4>
                        <p className="text-sm text-gray-600">
                          Once verified, navigate to Settings → API Keys and generate your authentication key. 
                          Keep this secure as it provides access to issue credentials.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold">
                        4
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Start Issuing Credentials</h4>
                        <p className="text-sm text-gray-600">
                          Use your API key to authenticate requests and start issuing credentials through our API endpoints.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <NavigationButtons />
            </section>
            )}

            {/* Authentication Section */}
            {activeSection === 'authentication' && (
            <section>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Authentication</h2>
                <div className="prose prose-sm max-w-none text-gray-600 space-y-4">
                  <p className="text-base leading-relaxed">
                    All API requests must be authenticated using an API key. Include your API key in the request header:
                  </p>

                  <div className="bg-gray-900 rounded-lg p-4 mt-4">
                    <code className="text-sm text-gray-300 font-mono">
                      X-API-Key: your-api-key-here
                    </code>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-amber-900 mb-1">Security Best Practices</p>
                        <ul className="text-sm text-amber-800 space-y-1">
                          <li>• Never expose your API key in client-side code or public repositories</li>
                          <li>• Rotate your API keys regularly</li>
                          <li>• Use environment variables to store API keys</li>
                          <li>• Revoke compromised keys immediately</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <NavigationButtons />
            </section>
            )}

            {/* Infrastructure Section */}
            {activeSection === 'infrastructure' && (
            <section>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Infrastructure & Performance</h2>
                <div className="prose prose-sm max-w-none text-gray-600 space-y-4">
                  <p className="text-base leading-relaxed">
                    Our API infrastructure is built for reliability, security, and scale.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900">AWS Hosting</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Hosted on Amazon Web Services with auto-scaling capabilities, ensuring 99.9% uptime and global availability.
                      </p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900">Rate Limiting</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Smart rate limiting protects against abuse while allowing legitimate high-volume usage. Default: 1000 requests/minute.
                      </p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900">Blockchain Verified</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        All credentials are anchored on blockchain for immutable verification and tamper-proof records.
                      </p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900">Scalable Architecture</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Built to handle millions of credentials. Process thousands of credentials in seconds with our bulk API.
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Performance Metrics</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-700">&lt; 200ms</div>
                        <div className="text-xs text-blue-600 mt-1">Average Response Time</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-700">99.9%</div>
                        <div className="text-xs text-blue-600 mt-1">Uptime SLA</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-700">1000+</div>
                        <div className="text-xs text-blue-600 mt-1">Requests/Minute</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <NavigationButtons />
            </section>
            )}

            {/* Endpoints Section */}
            {activeSection === 'endpoints' && selectedEndpoint && (
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">API Endpoints</h2>
                <p className="text-base text-gray-600">
                  Complete reference for all available API endpoints
                </p>
              </div>

              {(() => {
                const endpoint = endpoints.find(e => e.id === selectedEndpoint);
                return endpoint ? (
                  <ApiEndpointCard
                    endpoint={endpoint}
                    onSelect={() => setSelectedEndpoint(endpoint.id)}
                    isSelected={true}
                    onTryIt={() => {
                      setActiveTab('test');
                      setActiveSection('endpoints');
                      setSelectedEndpoint(endpoint.id);
                    }}
                  />
                ) : null;
              })()}
              <NavigationButtons />
            </section>
            )}
          </>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
