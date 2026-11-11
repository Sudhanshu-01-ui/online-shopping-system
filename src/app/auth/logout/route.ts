import { logout } from "@/lib/actions/auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await logout();
  return Response.redirect(new URL("/", request.url));
}

