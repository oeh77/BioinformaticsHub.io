import Link from "next/link";
import { Code, Key, Webhook, Book, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-24 px-4 text-center glass-effect">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-purple-400 bg-clip-text text-transparent">
            BioinformaticsHub.io API
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Build powerful integrations with our RESTful API. Access tools, courses, and more
            programmatically.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/admin/api-keys">
              <Button size="lg" className="gap-2">
                <Key className="w-5 h-5" />
                Get API Key
              </Button>
            </Link>
            <Link href="#quickstart">
              <Button size="lg" variant="outline" className="gap-2">
                <Book className="w-5 h-5" />
                Quickstart Guide
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-effect p-6 rounded-lg">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Key className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Authentication</h3>
              <p className="text-muted-foreground">
                API key and secret-based authentication with scope-based permissions and rate limiting
              </p>
            </div>

            <div className="glass-effect p-6 rounded-lg">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                <Webhook className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Real-time Webhooks</h3>
              <p className="text-muted-foreground">
                Subscribe to events and receive instant notifications when data changes
              </p>
            </div>

            <div className="glass-effect p-6 rounded-lg">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">RESTful Design</h3>
              <p className="text-muted-foreground">
                Clean, predictable endpoints following REST best practices with JSON responses
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quickstart */}
      <section id="quickstart" className="py-16 px-4 bg-secondary/20">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">Quick Start</h2>

          <div className="space-y-8">
            <div className="glass-effect p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm">
                  1
                </span>
                Get Your API Key
              </h3>
              <p className="text-muted-foreground mb-4">
                Navigate to the{" "}
                <Link href="/admin/api-keys" className="text-primary hover:underline">
                  API Keys page
                </Link>{" "}
                in your admin dashboard and create a new API key with the required scopes.
              </p>
              <div className="bg-black/40 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <div className="text-muted-foreground">{/* Your API credentials */}</div>
                <div>
                  API Key: <span className="text-green-400">bhio_live_abc123...</span>
                </div>
                <div>
                  Secret: <span className="text-yellow-400">***SECRET_KEY***</span> <span className="text-red-400">(save this!)</span>
                </div>
              </div>
            </div>

            <div className="glass-effect p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm">
                  2
                </span>
                Make Your First Request
              </h3>
              <p className="text-muted-foreground mb-4">
                Use your API key and secret in the Authorization header as a Bearer token:
              </p>
              <div className="bg-black/40 p-4 rounded-lg font-mono text-sm overflow-x-auto space-y-3">
                <div>
                  <div className="text-muted-foreground">{/* cURL */}</div>
                  <pre className="text-green-400">
{`curl -X GET https://biohub.io/api/v1/tools \\
  -H "Authorization: Bearer YOUR_API_KEY:YOUR_SECRET_KEY"`}
                  </pre>
                </div>
                
                <div className="border-t border-white/10 pt-3">
                  <div className="text-muted-foreground">{/* JavaScript (fetch) */}</div>
                  <pre className="text-blue-400">
{`const response = await fetch('https://biohub.io/api/v1/tools', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY:YOUR_SECRET_KEY'
  }
});
const data = await response.json();`}
                  </pre>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <div className="text-muted-foreground">{/* Python (requests) */}</div>
                  <pre className="text-yellow-400">
{`import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY:YOUR_SECRET_KEY'
}
response = requests.get('https://biohub.io/api/v1/tools', headers=headers)
data = response.json()`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">API Endpoints</h2>

          <div className="space-y-4">
            <EndpointCard
              method="GET"
              path="/api/v1/tools"
              description="List all bioinformatics tools with pagination and filtering"
              params={["page", "limit", "category", "featured", "search"]}
              scope="tools:read"
            />

            <EndpointCard
              method="GET"
              path="/api/v1/tools/:id"
              description="Get detailed information about a specific tool"
              scope="tools:read"
            />

            <EndpointCard
              method="POST"
              path="/api/v1/tools"
              description="Create a new tool entry"
              scope="tools:write"
            />

            <EndpointCard
              method="PUT"
              path="/api/v1/tools/:id"
              description="Update an existing tool"
              scope="tools:write"
            />

            <EndpointCard
              method="DELETE"
              path="/api/v1/tools/:id"
              description="Delete a tool"
              scope="tools:write"
            />

            <EndpointCard
              method="GET"
              path="/api/v1/courses"
              description="List all courses with filtering by level and provider"
              params={["page", "limit", "level", "provider", "search"]}
              scope="courses:read"
            />

            <EndpointCard
              method="GET"
              path="/api/v1/search"
              description="Search across tools, courses, resources, and blog posts"
              params={["q", "limit"]}
              scope="search:read"
            />
          </div>
        </div>
      </section>

      {/* Webhooks */}
      <section className="py-16 px-4 bg-secondary/20">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">Webhooks</h2>

          <div className="glass-effect p-6 rounded-lg mb-6">
            <p className="text-muted-foreground mb-4">
              Subscribe to real-time events and receive HTTP POST requests to your endpoint whenever
              actions occur in the system.
            </p>
            <Link href="/admin/webhooks">
              <Button className="gap-2">
                <Webhook className="w-4 h-4" />
                Manage Webhooks
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Available Events</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "tool.created",
                "tool.updated",
                "tool.deleted",
                "course.created",
                "course.updated",
                "post.published",
                "subscriber.new",
                "subscriber.unsubscribed",
              ].map((event) => (
                <div key={event} className="glass-effect p-4 rounded">
                  <code className="text-primary">{event}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Rate Limits */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">Rate Limits</h2>

          <div className="glass-effect p-6 rounded-lg">
            <p className="text-muted-foreground mb-4">
              API keys have configurable rate limits to prevent abuse:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Default: 1,000 requests per hour, 10,000 requests per day</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Rate limits are enforced per API key</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>HTTP 429 (Too Many Requests) returned when limit exceeded</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Contact admin to increase limits for your use case</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function EndpointCard({
  method,
  path,
  description,
  params,
  scope,
}: {
  method: string;
  path: string;
  description: string;
  params?: string[];
  scope: string;
}) {
  const methodColors: Record<string, string> = {
    GET: "bg-blue-500/20 text-blue-400",
    POST: "bg-green-500/20 text-green-400",
    PUT: "bg-yellow-500/20 text-yellow-400",
    DELETE: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="glass-effect p-6 rounded-lg">
      <div className="flex items-start gap-3 mb-3">
        <span
          className={`px-3 py-1 rounded text-sm font-mono font-semibold ${
            methodColors[method] || "bg-gray-500/20 text-gray-400"
          }`}
        >
          {method}
        </span>
        <code className="text-lg font-mono flex-1 break-all">{path}</code>
      </div>
      <p className="text-muted-foreground mb-3">{description}</p>
      <div className="flex gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Scope:</span>{" "}
          <code className="text-primary">{scope}</code>
        </div>
        {params && params.length > 0 && (
          <div>
            <span className="text-muted-foreground">Params:</span>{" "}
            {params.map((param, i) => (
              <span key={param}>
                <code className="text-accent">{param}</code>
                {i < params.length - 1 && ", "}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
