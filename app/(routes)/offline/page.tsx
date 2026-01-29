"use client";

import { WifiOff, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">You&apos;re Offline</CardTitle>
          <CardDescription>
            It looks like you&apos;ve lost your internet connection. 
            Some features may be limited until you&apos;re back online.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">While offline, you can:</p>
            <ul className="text-left space-y-1">
              <li>• View previously cached pages</li>
              <li>• Access saved workflows</li>
              <li>• Read downloaded content</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              className="flex-1"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
