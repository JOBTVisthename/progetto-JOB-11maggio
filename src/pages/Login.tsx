
import PageLayout from "@/components/layout/PageLayout";
import LoginForm from "@/components/auth/LoginForm";

const Login = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <LoginForm />
      </div>
    </PageLayout>
  );
};

export default Login;
