import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div 
      className="h-screen flex relative z-50"
      style={{
        backgroundImage: "url('/dashboard bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* LEFT */}
      <div className="w-[15%] sm:w-[12%] md:w-[10%] lg:w-[16%] xl:w-[14%] p-2 md:p-4 bg-white/10 backdrop-blur-lg border-r border-white/20 shadow-2xl overflow-y-auto relative z-50">
        <Link
          href="/"
          className="flex items-center justify-center lg:justify-start gap-2 mb-6 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/20"
        >
          <Image src="/logo.png" alt="logo" width={32} height={32} className="rounded-lg" />
          <span className="hidden lg:block font-bold text-white text-lg">FutureScholars</span>
        </Link>
        <Menu />
      </div>
      {/* RIGHT */}
      <div className="w-[85%] sm:w-[88%] md:w-[90%] lg:w-[84%] xl:w-[86%] bg-transparent overflow-scroll flex flex-col relative z-40">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
