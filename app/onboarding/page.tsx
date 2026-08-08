"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Input,
  Button,
  Description,
  Label,
  TextArea,
  TextField,
  Typography,
  Surface,
} from "@heroui/react";
import { BuildingOne } from "@mynaui/icons-react";
import { UserIcon } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase/client";

function GeneralForm({ value, update }: { value: number; update: any }) {
  return (
    <div className="space-y-2">
      <div>
        <Typography.Heading level={3}>Register Type</Typography.Heading>
        <Description>
          Select register type based on usage and configurations
        </Description>
      </div>
      <div className="flex w-80 flex-col gap-4 relative *:hover:shadow-sm">
        <Surface
          onClick={() => update(1)}
          className={`flex min-w-[320px] flex-col gap-3 rounded-3xl p-4 ring-accent hover:ring-2 ${value == 1 ? "ring-2" : "ring-0"} transition-all cursor-pointer`}
          variant="default"
        >
          <h3 className="text-base font-semibold text-foreground">
            Institute & Organization
          </h3>
          <p className="text-sm text-muted">
            Create account as a institute and its admin that provide services
            like classes, attendance, students.
          </p>
          <div className={`absolute top-2 right-2 flex items-center justify-center h-10 w-10 rounded-full ${value == 1? "bg-accent-soft" : "bg-background-secondary"} transition-colors`}>
            <BuildingOne size={18} />
          </div>
        </Surface>
        <Surface
          onClick={() => update(2)}
          className={`flex min-w-[320px] flex-col gap-3 rounded-3xl p-4 ring-accent hover:ring-2 ${value == 2 ? "ring-2" : "ring-0"} transition-all cursor-pointer`}
          variant="tertiary"
        >
          <h3 className="text-base font-semibold text-foreground">
            Member & Staff
          </h3>
          <p className="text-sm text-muted">
            Join as  a member or staff would under a institutions and organizations
          </p>
          <div className={`absolute top-2 right-2 flex items-center justify-center h-10 w-10 rounded-full ${value == 2? "bg-accent-soft" : "bg-background"} transition-colors`}>
            <UserIcon size={18} />
          </div>
        </Surface>
      </div>
    </div>
  );
}

function PersonalInfoForm({
  userData,
  formData,
  setFormData,
}: {
  userData: { email: string; firstName: string; lastName: string };
  formData: { firstName: string; lastName: string; phone: string; gender: string };
  setFormData: (data: { firstName: string; lastName: string; phone: string; gender: string }) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <Typography.Heading level={3}>Personal Details</Typography.Heading>
        <Description>Provide your personal contact information</Description>
      </div>
      <div className="flex w-80 flex-col gap-4">
        <TextField isRequired>
          <Label htmlFor="mem-email">Email</Label>
          <Input
            id="mem-email"
            type="email"
            placeholder="alex@example.com"
            fullWidth
            value={userData.email}
            readOnly
          />
        </TextField>
        <TextField isRequired>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+92 301 9000008"
            fullWidth
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </TextField>
        <div className="grid grid-cols-2 gap-2">
          <TextField isRequired>
            <Label htmlFor="mem-fname">First Name</Label>
            <Input
              id="mem-fname"
              placeholder="e.g., Alex, John"
              fullWidth
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </TextField>
          <TextField>
            <Label htmlFor="mem-lname">Last Name</Label>
            <Input
              id="mem-lname"
              placeholder="e.g., Alex, John"
              fullWidth
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </TextField>
        </div>
        <TextField>
          <Label htmlFor="mem-gender">Gender</Label>
          <Input
            id="mem-gender"
            placeholder="e.g., Male, Female"
            fullWidth
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          />
        </TextField>
      </div>
    </div>
  );
}

function InstituteInfoForm({
  instituteData,
  setInstituteData,
}: {
  instituteData: { name: string; description: string };
  setInstituteData: (data: { name: string; description: string }) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <Typography.Heading level={3}>Institute Information</Typography.Heading>
        <Description>
          Share your professional institute infomation with us
        </Description>
      </div>
      <div className="flex w-80 flex-col gap-4">
        <TextField isRequired>
          <Label htmlFor="ins-name">Name</Label>
          <Input
            id="ins-name"
            placeholder="Acme Inc"
            fullWidth
            value={instituteData.name}
            onChange={(e) => setInstituteData({ ...instituteData, name: e.target.value })}
          />
        </TextField>
        <TextField>
          <Label htmlFor="ins-desc">Description</Label>
          <TextArea
            id="ins-desc"
            placeholder="Institutes of primary education"
            fullWidth
            value={instituteData.description}
            onChange={(e) => setInstituteData({ ...instituteData, description: e.target.value })}
          />
          <Description className="text-right">{instituteData.description.length}/85</Description>
        </TextField>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const [activeForm, setActiveForm] = useState(1);
  const [regType, setRegType] = useState(0);
  const [loading, setLoading] = useState(false);
  const isInstitute = regType === 1;
  const totalSteps = isInstitute ? 3 : 2;

  const [userData, setUserData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    userId: "",
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "",
  });

  const [instituteData, setInstituteData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        router.push("/sign-in");
        return;
      }

      // Check if user exists in users table
      const { data: dbUser } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (dbUser) {
        setUserData({
          email: dbUser.email || session.user.email || "",
          firstName: dbUser.first_name || "",
          lastName: dbUser.last_name || "",
          userId: session.user.id,
        });
        setFormData({
          firstName: dbUser.first_name || "",
          lastName: dbUser.last_name || "",
          phone: dbUser.phone || "",
          gender: dbUser.gender || "",
        });
      } else {
        setUserData({
          email: session.user.email || "",
          firstName: session.user.user_metadata?.first_name || "",
          lastName: session.user.user_metadata?.last_name || "",
          userId: session.user.id,
        });
        setFormData({
          firstName: session.user.user_metadata?.first_name || "",
          lastName: session.user.user_metadata?.last_name || "",
          phone: "",
          gender: "",
        });
      }
    };
    fetchUser();
  }, [router]);

  const handleNext = async () => {
    if (activeForm < totalSteps) {
      setActiveForm((prev) => prev + 1);
    } else {
      // Complete onboarding - save to database
      setLoading(true);
      try {
        // Generate username: firstname-lastname-xxx (lowercase)
        const firstName = formData.firstName.toLowerCase().replace(/\s+/g, "");
        const lastName = formData.lastName.toLowerCase().replace(/\s+/g, "");
        const randomNum = Math.floor(100 + Math.random() * 900);
        const username = `${firstName}-${lastName}-${randomNum}`;

        // Save user profile to users table
        const { error: userError } = await supabase
          .from("users")
          .upsert({
            id: userData.userId,
            username,
            email: userData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            gender: formData.gender,
          });

        if (userError) throw userError;

        // If institute, create institute and link
        if (isInstitute && instituteData.name) {
          // Create institute
          const { data: institute, error: instError } = await supabase
            .from("institutes")
            .insert({
              title: instituteData.name,
              description: instituteData.description,
              slug: instituteData.name.toLowerCase().replace(/\s+/g, "-"),
            })
            .select()
            .single();

          if (instError) throw instError;

          // Link user to institute as admin
          if (institute) {
            const { error: linkError } = await supabase
              .from("institute_users")
              .insert({
                institute_id: institute.id,
                user_id: userData.userId,
                role: "admin",
              });

            if (linkError) throw linkError;
          }
        }

        router.push("/dashboard");
      } catch (err) {
        console.error("Onboarding error:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="grid min-h-svh w-full grid-cols-1 lg:grid-cols-2 bg-background">
      <div className="flex flex-col items-center justify-center p-6 my-8">
        <div className="flex w-80 flex-col gap-6">
          {activeForm === 1 && (
            <GeneralForm value={regType} update={setRegType} />
          )}
          {activeForm === 2 && isInstitute && (
            <InstituteInfoForm
              instituteData={instituteData}
              setInstituteData={setInstituteData}
            />
          )}
          {activeForm === 2 && !isInstitute && regType !== 0 && (
            <PersonalInfoForm
              userData={userData}
              formData={formData}
              setFormData={setFormData}
            />
          )}
          {activeForm === 3 && isInstitute && (
            <PersonalInfoForm
              userData={userData}
              formData={formData}
              setFormData={setFormData}
            />
          )}

          <div className="flex gap-2 items-center w-full mt-2">
            {activeForm > 1 && (
              <Button
                size="lg"
                fullWidth
                onClick={() => setActiveForm((prev) => prev - 1)}
                variant="tertiary"
              >
                Back
              </Button>
            )}
            <Button
              size="lg"
              fullWidth
              onClick={handleNext}
              isPending={loading}
              isDisabled={regType === 0}
            >
              {activeForm === totalSteps ? "Complete" : "Next"}
            </Button>
          </div>
        </div>
      </div>

      <div className="relative hidden h-full w-full lg:block bg-background-secondary">
        <img
          src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/neo2.jpeg"
          alt="NEO Home Robot"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-background/10 to-transparent" />
      </div>
    </div>
  );
}
