import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CandidateRegisterForm from "@/components/auth/CandidateRegisterForm";

export default function CandidateRegister() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-jobtv-teal/5 via-white to-jobtv-blue/5">
      <Header />

      <main className="section-padding">
        <div className="container container-padding">
          <div className="flex justify-center">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
              <CandidateRegisterForm />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
