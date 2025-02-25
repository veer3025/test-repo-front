import NewUserLayout from "@/layout/NewUserLayout";
import { FC, useState } from "react";
import { Container, Col, Row } from "reactstrap";
import { SvgPath } from "@/utils/constant";

import Link from "next/link";

import JoinYearBookModal from "./JoinYearBookModal";
import CreateYearBookModal from "./CreateYearBookModal";

const NewUserDashboard: FC<any> = ({userDetails, reloadDashboard}) => {
  
  const [showModal, setShowModal] = useState(false);
  const [showCybModal, setShowCybModal] = useState(false);

  const toggleModal = () => setShowModal(!showModal);
  const toggleCybModal = () => setShowCybModal(!showCybModal);

  return (
    <>
      <NewUserLayout mainClass="custom-padding" loaderName="defaultLoader"> 
        <div className="page-center">
          <Container fluid className="setting-section section-pb-space page-center">
            <div className="container">
              <div className="row">
                <div className="col-lg-3 col-xl-3"></div>
                <div className="col-lg-9 col-xl-9">
                  <div className="tab-content">
                    <div className="tab-pane active">
                      <div className="setting-home">
                        <div className="top-content">
                          <h2>Welcome, {userDetails.u_name}</h2>
                          <p>Kindly select an option from options mentioned below.</p>
                        </div>
                        <Row>
                          <Col xl="6" sm="6">
                            <a className="detail-box" onClick={toggleCybModal}>
                              <img
                                src={`${SvgPath}/setting/account.svg`}
                                className="img-fluid blur-up lazyloaded"
                                alt="Create Year Book"
                              />
                              <h3>Create Year Book</h3>
                              <p>You can create your own year book and invite your friends.</p>
                            </a>
                          </Col>
                          <Col xl="6" sm="6" style={{borderRight:'none'}}>
                            <a className="detail-box" onClick={toggleModal}>
                              <img
                                src={`${SvgPath}/setting/privacy.svg`}
                                className="img-fluid blur-up lazyloaded"
                                alt="Join Year Book"
                              />
                              <h3>Join Year Book</h3>
                              <p>You can join a year book by providing a Year Book Code.</p>
                            </a>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </div>  
                </div>
              </div>
            </div>
          </Container>
        </div>
      </NewUserLayout>
      <JoinYearBookModal showModal={showModal} toggleModal={toggleModal} userDetails={userDetails} />
      <CreateYearBookModal showModal={showCybModal} toggleModal={toggleCybModal} userDetails={userDetails} 
        reloadDashboard={reloadDashboard} />  
    </>
  )
};

export default NewUserDashboard;