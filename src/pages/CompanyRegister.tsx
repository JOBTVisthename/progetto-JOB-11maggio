import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CompanyRegisterForm from "@/components/auth/CompanyRegisterForm";

export default function CompanyRegister() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-jobtv-blue/5 via-white to-jobtv-teal/5">
      <Header />

      <main className="section-padding">
        <div className="container container-padding">
          <div className="flex justify-center">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
              <CompanyRegisterForm />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
