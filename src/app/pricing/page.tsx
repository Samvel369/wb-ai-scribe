"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import PricingCards from "../components/PricingCards";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 font-sans">
            <div className="max-w-[1200px] mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 pt-4 pl-2 gap-6">
                    <div className="flex items-center gap-4 self-start md:self-auto">
                        <Link href="/" className="p-2 rounded-full hover:bg-white/5 transition text-zinc-400 hover:text-white">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                            Тарифы
                        </h1>
                    </div>
                </div>

                <PricingCards />
            </div>
        </div>
    );
}
