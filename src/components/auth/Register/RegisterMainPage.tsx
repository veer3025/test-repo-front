import { BiLogoGooglePlus } from "react-icons/bi";
import { Button, Col, Container, Row } from "reactstrap";
import { ImagePath, Register, WelcomeFriend } from "../../../utils/constant";
import RegisterForm from "./RegisterForm";
import CustomImage from "@/Common/CustomImage";
import { toast } from "react-toastify";

const RegisterMainPage: React.FC = () => {

  const handlesubmit = () => {
      toast.error("This is only demo purpose, click on the Sign In button to login.");
  };

  return (
    <Container>
      <Row>
        <Col xl="6" lg="5" className=" d-none d-lg-block">
          <div className="login-welcome">
            <div>
              <CustomImage src={`${ImagePath}/login/charcter.png`} className="img-fluid blur-up lazyloaded" alt="charcter" />
              <h1>{WelcomeFriend}</h1>
            </div>
          </div>
        </Col>
        <Col xl="6" lg="7" md="10" xs="12" className="m-auto">
          <div className="login-form">
            <div>
              <div className="login-title">
                <h2>{Register}</h2>
              </div>
              <div className="login-discription">
                <h3>Hello Everyone</h3>
                <h4>
                  Welcome to Nostalgia Pages, create your account below to start using it.
                </h4>
              </div>
              <div className="form-sec">
                <div>
                  <RegisterForm />
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterMainPage;
