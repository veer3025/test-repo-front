import { toast } from "react-toastify";
import { Col, Container, Row } from "reactstrap";
import { HelloEveryoneWelcome, Login, WelcomeFriendBookLoginAccount } from "../../../utils/constant";
import AuthenticationForm from "./AuthenticationForm";
import LoginWelcome from "./LoginWelcome";

const AuthenticationMainSection: React.FC = () => {
  
  return (
    <Container>
      <Row>
        <Col xl='6' lg='5' className='d-none d-lg-block'>
          <LoginWelcome />
        </Col>
        <Col xl='6' lg='7' md='10' xs='12' className='m-auto'>
          <div className='login-form'>
            <div>
              <div className='login-title'>
                <h2>{Login}</h2>
              </div>
              <div className='login-discription'>
                <h3>{HelloEveryoneWelcome}</h3>
                <h4>{WelcomeFriendBookLoginAccount}</h4>
              </div>
              <div className='form-sec'>
                <div>
                  <AuthenticationForm />
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AuthenticationMainSection;
