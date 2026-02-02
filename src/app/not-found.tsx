import { redirect } from "next/navigation";

export default function NotFound() {
  // Redirect ไปหน้าแรกเมื่อพิมพ์ URL ผิด
  redirect("/");
}
