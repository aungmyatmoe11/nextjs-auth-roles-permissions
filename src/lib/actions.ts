"use server"

import User from "@/models/user"
import { RegisterSchema } from "@/schema/auth/registerSchema"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { dbConnect } from "./mongodb"
import { LoginSchema } from "@/schema/auth/loginSchema"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export const signUpCredentials = async (
  prevState: unknown,
  formData: FormData
) => {
  const validatedFields = RegisterSchema.safeParse(
    Object.fromEntries(formData.entries())
  )

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }
  console.log("validation pass")

  const { username, email, password } = validatedFields.data
  const hashedPassword = bcrypt.hashSync(password, 10)

  console.log("hash pass " + hashedPassword)
  await dbConnect()
  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return {
        message: "Email already exists!!!",
      }
    }

    console.log("email pass")

    // Create the new user
    const user = new User({ username, email, password: hashedPassword })
    await user.save()

    console.log("user save pass")

    // Convert the Mongoose document to a plain object

    // const plainUser = {
    //   ...user.toObject(),
    //   _id: user._id.toString(),
    // };

    // return plainUser;
  } catch (error) {
    console.log("failed")
    if (error instanceof Error) {
      console.log("error" + error.message)
      return {
        message: error.message,
      }
    } else {
      console.log("some error")
      return {
        message: "Failed to register user",
      }
    }
  }

  redirect("/login")
}

export const LoginCredentials = async (
  prevState: unknown,
  formData: FormData
) => {
  const validatedFields = LoginSchema.safeParse(
    Object.fromEntries(formData.entries())
  )

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }

  console.log("validate pass")

  const { email, password } = validatedFields.data

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { message: "Invalid Credentials!!!" }
        default:
          return { message: "Something went wrong" }
      }
    }

    throw error
  }
}
