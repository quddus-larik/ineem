import { useState } from "react";
import {
  Button,
  Label,
  Input,
  TextField,
  InputGroup,
  FieldError,
  Alert,
} from "@heroui/react";
import { EyeClosedIcon, EyeIcon } from "@phosphor-icons/react";
import { SocialAccounts } from "./socials.minor";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value) validateEmail(value);
    else setEmailError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Check if user exists in users table
    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (!userData) {
      // New user - redirect to onboarding with user data
      const meta = data.user.user_metadata || {};
      const params = new URLSearchParams({
        email: data.user.email || "",
        id: data.user.id,
        first_name: meta.first_name || "",
        last_name: meta.last_name || "",
      });
      router.push(`/onboarding?${params.toString()}`);
    } else {
      // Existing user - redirect to dashboard
      router.push("/dashboard");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <Alert status="warning" aria-label="login alert">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Something went wrong</Alert.Title>
            <Alert.Description>{error}. You may write invalid email or password</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      <TextField
        isRequired
        className="w-full"
        name="email"
        isInvalid={!!emailError}
      >
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          variant="secondary"
          value={email}
          onChange={handleEmailChange}
        />
        <FieldError>Provide a valid email</FieldError>
      </TextField>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <button
            type="button"
            className="text-xs text-primary hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <TextField isRequired className="w-full" name="password">
          <InputGroup variant="secondary">
            <InputGroup.Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputGroup.Suffix className="pr-0">
              <Button
                isIconOnly
                aria-label={showPassword ? "Hide password" : "Show password"}
                size="sm"
                variant="ghost"
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeIcon className="size-4" />
                ) : (
                  <EyeClosedIcon className="size-4" />
                )}
              </Button>
            </InputGroup.Suffix>
          </InputGroup>
        </TextField>
      </div>
      <SocialAccounts />

      <Button
        type="submit"
        className="w-full"
        variant="primary"
        isPending={loading}
        isDisabled={!email || !password}
      >
        Sign In
      </Button>
    </form>
  );
}
