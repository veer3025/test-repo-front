import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { FullName, Password } from "../../../utils/constant";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Button, FormGroup, Input, Label } from "reactstrap";
import { toast } from "react-toastify";
import { signIn, useSession } from "next-auth/react";
import { BiLogoFacebook, BiLogoGooglePlus, BiLogoTwitter } from "react-icons/bi";

const initialRegData = {
  full_name : '', email_id : '', usr_psw : '' 
}

const RegisterForm = () => {

  const [regData, setRegData] = useState(initialRegData);
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  const router = useRouter();
  const session = useSession();
  
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
    
    let errors : any = {};

    if (regData?.full_name?.trim() === '') {
      
      errors.full_name = 'Full Name is required.';
      setErrors(errors);
      document?.getElementById('user_name')?.focus();
      return false;
    }
    
    if (!regData?.email_id) {

      errors.email_id = 'Email Address is required.';
      setErrors(errors);
      document?.getElementById('email')?.focus();
      return false;
    } 
    else if (!/\S+@\S+\.\S+/.test(regData?.email_id)) {

      errors.email_id = 'Invalid Email Address.';
      setErrors(errors);
      document?.getElementById('email')?.focus();
      return false;
    }
    
    if (!regData?.usr_psw) {

      errors.usr_psw = 'Password is required.';
      setErrors(errors);
      document?.getElementById('password')?.focus();
      return false;

    } 
    else if (regData?.usr_psw?.length < 6) {

      errors.usr_psw = 'Password must be at least 6 characters.';
      setErrors(errors);
      document?.getElementById('password')?.focus();
      return false;
    }
    
    setErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  };

  const handleSignUp = async () => {
    
    validateForm();

    if(isFormValid) {
      
      const cdt = new Date();
      const opt = { method : 'POST', headers : {'Accept': 'application/json', 'Content-Type': 'application/json',},
                  body   : JSON.stringify({data_id : cdt.toISOString(), ...regData})};
      
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, opt)
      .then(response => response.json())
      .then(async res_data => {
        
        if(res_data.status === 1) {

          toast.success(res_data.message);
          router.push("/login");
        }
        else {
          toast.error(res_data.message ?? 'Something went wrong...!!')
        }
      })
      .catch(error => {

        toast.error(error ?? 'Something went wrong...!!')
      })  
    }
  }

  const handleGoogleLogin = async () => {
      
    await signIn("google");
  };

  return (
    <>
    <form className="theme-form">
      <FormGroup>
        <Label>{FullName}</Label>
        <Input type="text" id="user_name" placeholder="Your Name" value={regData.full_name} 
          onChange={(e) => { setErrors({}); setRegData({...regData, full_name:e.target.value}); }}/>
        <DynamicFeatherIcon
          iconName="User"
          className="input-icon iw-20 ih-20"
        />
        {((errors as any)?.full_name) && <p className="text-danger pt-1">{(errors as any)?.full_name??''}</p>}
      </FormGroup>
      <FormGroup>
        <label htmlFor="exampleInputEmail1">Email address</label>
        <Input type="email" id="email" placeholder="Enter email" value={regData.email_id} 
          onChange={(e) => { setErrors({}); setRegData({...regData, email_id:e.target.value}); }}/>
        <DynamicFeatherIcon
          iconName="Mail"
          className="input-icon iw-20 ih-20"
        />
        {((errors as any)?.email_id) && <p className="text-danger pt-1">{(errors as any)?.email_id??''}</p>}
      </FormGroup>
      <FormGroup>
        <Label>{Password}</Label>
        <Input type="password" id="password" autoComplete="" placeholder="Password" value={regData.usr_psw} 
          onChange={(e) => { setErrors({}); setRegData({...regData, usr_psw:e.target.value}); }}/>
        <DynamicFeatherIcon iconName="Eye" className="input-icon iw-20 ih-20" />
        {((errors as any)?.usr_psw) && <p className="text-danger pt-1">{(errors as any)?.usr_psw??''}</p>}
      </FormGroup>
      <div className="bottom-sec"></div>
      <div className="btn-section">
        <a href="javascript:void(0)" onClick={handleSignUp} className="btn btn-solid btn-lg">
          sign up
        </a>
        <Link href="/login" className="btn btn-solid btn-lg ms-auto">
          login
        </Link>
      </div>
    </form>
    <div className="connect-with">
      <h6>
        <span>OR Connect With</span>
      </h6>
      <ul className='social-links'>
        <li className={"google"}>
          <Button color='' onClick={handleGoogleLogin}>
            <BiLogoGooglePlus />
          </Button>
        </li>
      </ul>
    </div>
    </>
  );
};

export default RegisterForm;
