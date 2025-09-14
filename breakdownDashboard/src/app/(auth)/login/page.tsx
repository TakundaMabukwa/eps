"use client"

import React, { FormEvent, useState, useTransition } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { login } from "@/lib/action/auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter()
  const [isPending, startTransition] = useTransition();

  // const handleSubmit = (formData: FormData) => {
  //   setError(null);
  //   startTransition(async () => {
  //     try {
  //       await login(formData);
  //     } catch (err: any) {
  //       console.error(err);
  //     }
  //   });
  // };

  const handleSubmit = (formData: FormData) => {
    setError(null);
    setIsLoading(true);

    startTransition(async () => {
      try {
        const result = await login(formData);

        if (!result.success) {
          setError(result.message ?? "An unknown error occurred."); // ✅ Show error in UI
          setIsLoading(false);
          return;
        }

        // ✅ Redirect only on success
        router.push("/");
      } catch (err: any) {
        console.error("Unexpected error:", err);
        setError("Something went wrong. Please try again. " + err);
      } finally {
        setIsLoading(false);
      }
    });
  };


  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <p className="text-gray-600 mt-2">Sign in to your account</p>
      </CardHeader>

      <form action={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              className="w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              className="w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </CardContent>

        <CardFooter className="flex flex-col items-center">
          <Button
            type="submit"
            disabled={isPending}
            className={`w-full bg-blue-600 hover:bg-blue-700 ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
        </CardFooter>
      </form >
    </>
  )
}


