"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AlertCircle, ArrowRight, Lock, Mail } from "lucide-react";

import useAuthStore from "@/store/authStore";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export function LoginForm() {
  const router = useRouter();

  const {
    login,
    isLoading,
    error,
    clearError,
    isAuthenticated,
  } = useAuthStore();

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      const result = await login(values);

      if (result.success) {
        router.push("/dashboard");
      }
    },
  });

  if (isAuthenticated) return null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">Welcome to EDMS</CardTitle>
          <CardDescription>
            Sign in to manage departments, folders and documents.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  className="pl-9"
                  {...formik.getFieldProps("email")}
                />
              </div>

              {formik.touched.email && formik.errors.email && (
                <p className="text-sm text-red-600">{formik.errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  className="pl-9"
                  {...formik.getFieldProps("password")}
                />
              </div>

              {formik.touched.password && formik.errors.password && (
                <p className="text-sm text-red-600">
                  {formik.errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !formik.isValid}
            >
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}