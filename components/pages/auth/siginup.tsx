import { useState } from "react";
import {
  Button,
  Label,
  Input,
  TextField,
  InputGroup,
  Form,
  FieldError,
  Alert,
  Description,
} from "@heroui/react";
import { EyeClosedIcon, EyeIcon } from "@phosphor-icons/react";
import { SocialAccounts } from "./socials.minor";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirm(value);
    if (value && value !== password) {
      setConfirmError("Passwords do not match");
    } else {
      setConfirmError("");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (confirm && confirm !== value) {
      setConfirmError("Passwords do not match");
    } else {
      setConfirmError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Redirect to onboarding with user data
    const params = new URLSearchParams({
      email: email,
      first_name: firstName,
      last_name: lastName,
      id: data.user?.id || "",
    });
    router.push(`/onboarding?${params.toString()}`);
    setLoading(false);
  };

  return (
    <Form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <Alert status="warning" aria-label="login alert">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Something went wrong</Alert.Title>
            <Alert.Description>
              {error}. You may write invalid information
            </Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-2">
        <TextField isRequired name="firstName">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Jane"
            variant="secondary"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </TextField>
        <TextField name="lastName">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Doe"
            variant="secondary"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </TextField>
      </div>

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
        <TextField
          isRequired
          className="w-full"
          name="password"
          isInvalid={!!confirmError}
        >
          <Label className="text-sm font-medium" htmlFor="password">
            Password
          </Label>
          <InputGroup variant="secondary">
            <InputGroup.Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 characters"
              value={password}
              onChange={handlePasswordChange}
              required
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
        <div className="flex gap-1 mt-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                password.length >= i * 3
                  ? password.length >= 12
                    ? "bg-success"
                    : password.length >= 8
                      ? "bg-warning"
                      : "bg-danger"
                  : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <TextField
          isRequired
          className="w-full"
          name="confirm-password"
          isInvalid={!!confirmError}
        >
          <Label className="text-sm font-medium" htmlFor="confirm-password">
            Confirm password
          </Label>
          <InputGroup variant="secondary">
            <InputGroup.Input
              id="confirm-password"
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat your password"
              value={confirm}
              onChange={handleConfirmChange}
              required
            />
            <InputGroup.Suffix className="pr-0">
              <Button
                isIconOnly
                aria-label={showConfirm ? "Hide password" : "Show password"}
                size="sm"
                variant="ghost"
                onPress={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? (
                  <EyeIcon className="size-4" />
                ) : (
                  <EyeClosedIcon className="size-4" />
                )}
              </Button>
            </InputGroup.Suffix>
          </InputGroup>
          <FieldError>Passwords do not match</FieldError>
        </TextField>
      </div>

      <SocialAccounts
        type="signup"
        checked={acceptedTerms}
        onCheckedChange={(val) => {
          console.log("Checkbox changed:", val);
          setAcceptedTerms(val);
        }}
      />

      <Button
        type="submit"
        className="w-full"
        variant="primary"
        isPending={loading}
        isDisabled={
          !firstName || !email || !password || !confirm || !acceptedTerms
        }
      >
        Create Account
      </Button>
    </Form>
  );
}
