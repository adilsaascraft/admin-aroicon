'use client';
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {useState } from 'react'
import { loginSchema, LoginFormData } from '@/validations/loginSchema'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff , CheckCircle} from 'lucide-react'

export function LoginForm() {
  const router = useRouter();
  const [validated, setValidated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isLoading },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", robot: false }
  })

// ===========================================================
  // 🎯 LOGIN HANDLER — save accessToken to localStorage
  // ===========================================================
  const onSubmit = async (data: any) => {
    try {
      setValidated(false);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // refreshToken cookie stored automatically
          body: JSON.stringify({
            email: data.email,
            password: data.password
          })
        }
      );

      const result = await res.json();

      if (!res.ok) {
        setError("password", { message: result?.message || "Invalid credentials" });
        return;
      }

      // ================================
      // ⭐ SAVE ACCESS TOKEN (VERY IMPORTANT)
      // ================================
      if (result.accessToken) {
        localStorage.setItem("accessToken", result.accessToken);
      }

      // success animation
      setValidated(true);

      // redirect after validation animation
      setTimeout(() => router.push("/faculty"), 900);

    } catch (error) {
      setError("password", { message: "Something went wrong. Try again." });
    }
  };


  return (
    <div className={cn('flex flex-col gap-6')}>
      <Card className="overflow-hidden p-0 shadow-lg bg-gradient-to-r from-[#FFDCC0] to-white">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold text-black">Admin Login</h1>
                <p className="text-muted-foreground text-balance">
                  Welcome back! Login to continue.
                </p>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email" className='text-black'>Email</Label>
                <Input
                  type="email"
                  className="w-full text-black !bg-gray-100"
                  placeholder="Enter your email"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="grid gap-3 relative">
                <div className="flex items-center">
                  <Label htmlFor="password" className='text-black'>Password</Label>
                  <a
                    href="/forgot-password"
                    className="ml-auto text-sm underline-offset-2 hover:underline text-black"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pr-10 text-black !bg-gray-100"
                  placeholder="Enter your password"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Checkbox */}
            <div className="flex items-center gap-2">
              <Input type="checkbox" className="w-4 h-4 accent-orange-600" {...register("robot")} />
              <Label className="text-sm text-gray-600">I am not a robot</Label>
            </div>
            {errors.robot && <p className="text-red-600 text-sm">{errors.robot.message}</p>}
            {/* Submit Button */}
              <Button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white flex items-center justify-center gap-2 ${
                validated ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {validated ? (
                <>
                  <CheckCircle className="w-5 h-5 text-white" /> Validated
                </>
              ) : isLoading ? (
                "Validating....."
              ) : (
                "Login"
              )}
            </Button>
            </div>
          </form>

          <div className="bg-muted relative hidden md:block">
            <Image
              src="https://res.cloudinary.com/dymanaa1j/image/upload/v1763972311/ChatGPT_Image_Nov_24_2025_01_45_49_PM_1_rkdmrn.png"
              alt="Image"
              className="object-cover h-full w-full"
              width={500}
              height={500}
              priority
              loading="eager"
              unoptimized
              quality={100}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
