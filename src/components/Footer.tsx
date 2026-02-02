"use client";

import { Facebook, Instagram, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/Logo.png";

const Footer = () => {
  return (
    <footer className="bg-secondary/50 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <div className="flex items-center gap-3 sm:gap-4 font-bold text-xl sm:text-2xl text-primary mb-4">
              <Image
                src={Logo}
                alt="Petskub โลโก้เว็บไซต์หมาหาบ้านแมวหาบ้าน"
                className="h-12 sm:h-14 lg:h-16 w-auto drop-shadow-[0_8px_20px_rgba(249,115,22,0.4)]"
                loading="lazy"
              />
              <span className="font-prompt bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 text-transparent bg-clip-text">
                Petskub Community
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-prompt">
              <strong>เกี่ยวกับ Petskub:</strong> เว็บไซต์สื่อกลางสำหรับคนรักสัตว์ พื้นที่สำหรับหาบ้านให้หมา หาบ้านให้แมว และสัตว์เลี้ยงอื่นๆ มุ่งมั่นลดปัญหาสัตว์จรจัดในสังคมไทย เชื่อมโยงผู้ให้และผู้รับเลี้ยงเข้าด้วยกัน ครอบคลุมพื้นที่กรุงเทพฯ ปทุมธานี และทั่วประเทศ
            </p>
          </div>

          <div>
            <p className="font-semibold mb-4 font-prompt text-lg">เมนูหลัก</p>
            <ul className="space-y-2 text-sm font-prompt">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  หน้าแรก
                </Link>
              </li>
              <li>
                <Link href="/adopt" className="text-muted-foreground hover:text-primary transition-colors">
                  หาบ้านให้สัตว์เลี้ยง
                </Link>
              </li>
              <li>
                <Link href="/report" className="text-muted-foreground hover:text-primary transition-colors">
                  แจ้งเจอสัตว์จร
                </Link>
              </li>
              <li>
                <Link href="/knowledge" className="text-muted-foreground hover:text-primary transition-colors">
                  ความรู้
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-semibold mb-4 font-prompt text-lg">ติดตามเรา</p>
            <div className="flex gap-4 mb-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="ติดตามเราบน Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="ติดตามเราบน Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="ติดต่อเราทางอีเมล">
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground font-prompt">
              ⚠️ เว็บไซต์นี้ไม่อนุญาตให้มีการซื้อขายสัตว์
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground font-prompt">
          © 2024 Petskub Community. ทำด้วยความรักเพื่อน้องแมวและสุนัขทุกตัว ❤️
        </div>
      </div>
    </footer>
  );
};

export default Footer;
