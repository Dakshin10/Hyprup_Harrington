"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function CTA() {
  const router = useRouter();

  const handleRoleSelect = (selectedRole: "student" | "business") => {
    const demoUser = {
      uid: `demo-${selectedRole}`,
      email: `${selectedRole}@demo.com`,
      role: selectedRole
    };
    localStorage.setItem("workhop_user_role", selectedRole);
    localStorage.setItem("workhop_user", JSON.stringify(demoUser));
    router.push(`/${selectedRole}/dashboard`);
  };

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 blur-[120px] rounded-full -z-10" />

      <div className="max-w-4xl mx-auto bg-gradient-to-br from-bg-card to-bg-main border border-white/10 rounded-[3rem] p-12 md:p-20 text-center relative shadow-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Start Hiring or <br />
            <span className="text-primary-500">Start Earning</span> Today
          </h2>
          <p className="text-text-secondary text-lg mb-12 max-w-xl mx-auto">
            Join thousands of students and businesses building a faster, more reliable local workforce.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect("business")}
              className="w-full sm:w-auto px-10 py-5 bg-white text-black font-black rounded-2xl shadow-xl shadow-white/5 hover:bg-slate-100 transition-all text-xl"
            >
              Post a Job
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect("student")}
              className="w-full sm:w-auto px-10 py-5 bg-primary-500 text-white font-black rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all text-xl"
            >
              Find Work
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
