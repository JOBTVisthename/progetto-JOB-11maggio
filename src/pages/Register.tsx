
import PageLayout from "@/components/layout/PageLayout";
import RegisterForm from "@/components/auth/RegisterForm";

const Register = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <RegisterForm />
      </div>
    </PageLayout>
  );
};

export default Register;
