import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4 p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-3">
          404 - Page Not Found
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Oops! This page doesn't exist. Let's get you back to your exercises!
        </p>
        <Button asChild size="lg" className="gap-2">
          <Link href="/">
            <Home className="h-5 w-5" />
            Back to Home
          </Link>
        </Button>
      </Card>
    </div>
  );
}
