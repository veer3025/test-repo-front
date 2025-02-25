import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import { EmailAddress, ForgetPassword, Login, Password, RememberMe, SignUp } from "../../../utils/constant";
import { BiLogoFacebook, BiLogoGooglePlus, BiLogoTwitter } from "react-icons/bi";

const AuthenticationForm: React.FC = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitInProcess, setIsSubmitInProcess] = useState(false); 
  
  const session = useSession();
  const router  = useRouter();

  useEffect(() => {
    
    if(session?.data?.user) {

      if(session?.data?.user?.email) {

        router.push("/dashboard");
      }
      else {
        toast.error("Server error. Please log in after some time...!!");
      }
    }
  }, [session]);

  const validateForm = () => {
    
    document?.getElementById('btnSubmitLogin')?.focus();

    let errors : any = {};
    
    if (!email) {

      errors.email = 'Email Address is required.';
      setErrors(errors);
      document?.getElementById('email')?.focus();
      return false;
    } 
    else if (!/\S+@\S+\.\S+/.test(email)) {

      errors.email = 'Invalid Email Address.';
      setErrors(errors);
      document?.getElementById('email')?.focus();
      return false;
    }
    
    if (!password) {

      errors.password = 'Password is required.';
      setErrors(errors);
      document?.getElementById('password')?.focus();
      return false;
    } 
    
    setErrors(errors);
    
    return (Object.keys(errors).length === 0);
  };

  const formSubmitHandle = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if(validateForm()) {

      setIsSubmitInProcess(true);

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.ok) {

        //toast.success("successfully Logged in Rediract......");
        router.push("/dashboard");
      } 
      else {
        setIsSubmitInProcess(false);
        toast.error("Invalid Email Address Or Password...!!");
      }
    }
  };
  
  const handleGoogleLogin = async () => {
    
    await signIn("google");
  };

  return (
    <>
    <Form className='theme-form' onSubmit={(event) => formSubmitHandle(event)}>
      <FormGroup>
        <Label>{EmailAddress}</Label>
        <Input type='email' id='email' placeholder='Enter Email Id' defaultValue={email} 
          onChange={(event) => {setErrors({}); setEmail(event.target.value);}} autoComplete="off" autoFocus />
        <DynamicFeatherIcon iconName='User' className='input-icon iw-20 ih-20' />
        {((errors as any)?.email) && <p className="text-danger pt-1">{(errors as any)?.email??''}</p>}
      </FormGroup>
      <FormGroup>
        <Label>{Password}</Label>
        <Input type={show ? "text" : "password"} id='password' placeholder='*********' defaultValue={password} 
          onChange={(event) => {setErrors({}); setPassword(event.target.value);}} />
        <DynamicFeatherIcon iconName='Eye' className='input-icon iw-20 ih-20' onClick={() => setShow(!show)} />
        {((errors as any)?.password) && <p className="text-danger pt-1">{(errors as any)?.password??''}</p>}
      </FormGroup>
      <div className='bottom-sec'>
        {
          /*
          <div className='form-check checkbox_animated'>
            <Input type='checkbox' className='form-check-input' id='exampleCheck1' />
            <label className='form-check-label' htmlFor='exampleCheck1'>
              {RememberMe}
            </label>
          </div>
          <a href='#' className='forget-password'>
            {ForgetPassword}
          </a>
          */
        }
      </div>
      <div className='btn-section'>
        {
          isSubmitInProcess ? 
          <>
            <Button type='button' className='btn btn-solid btn-lg' disabled>
              <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
              <span role="status"> Processing...</span>
            </Button>
            <Button type='button' className='btn btn-solid btn-lg ms-auto' disabled>
              {SignUp}
            </Button>
          </> 
          :
          <>
          <Button type='submit' id='btnSubmitLogin' className='btn btn-solid btn-lg'>
            {Login}
          </Button>
          <Link href='/register' className='btn btn-solid btn-lg ms-auto'>
            {SignUp}
          </Link>
          </>
        }
      </div>
    </Form>
    <div className='connect-with'>
      <h6>
        <span>OR Connect With</span>
      </h6>
      <ul className='social-links'>
        <li className={"google"}>
          <Button color='' onClick={handleGoogleLogin}>
            <BiLogoGooglePlus />
          </Button>
        </li>
        {
          /*
          <li className={"facebook"} onClick={handlesubmit}>
            <Button color=''><BiLogoFacebook /></Button>
          </li>
          <li className={"twitter"} onClick={handlesubmit}>
            <Button color=''><BiLogoTwitter /></Button>
          </li>
          */
        }
      </ul>
    </div>
    </>
  );
};

export default AuthenticationForm;
