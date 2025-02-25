import { FC, useState, useEffect } from "react";
import { Col, Row, Label, Button, Input, Modal, ModalBody, ModalFooter, Media, ModalHeader } from "reactstrap";
import { toast } from "react-toastify";

import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { joinYearBook } from "@/libs/user/joinYearBook";
import { getJoinYearBookReqInfo } from "@/libs/user/getJoinYearBookReqInfo";

const defaultImgStyle = {backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center center', 
  display : 'block', backgroundColor: '#ccc', backgroundImage : ''};

const CoOrdinatorImg = ({src}:any) => {

  const [imgStyle, setImgStyle] = useState(defaultImgStyle);
  const [imgExists, setImgExists] = useState(false);
  
  useEffect(() => {

    const imgFileExists = async ({file_path} : any) => {

      const file_exits =  await fetch(file_path).then((response) => {
        if(response.ok) {

          return true;
        }

        return false;
      });
      
      if(file_exits) {
        window.alert('found');
        setImgStyle({...imgStyle, backgroundImage: file_path})
        setImgExists(true)
      }
    }

    imgFileExists(src);

  }, [imgExists]);

  return (
          !imgExists ? 
          <div className="user-img bg-size blur-up lazyloaded d-flex justify-content-center align-items-center" 
            style={defaultImgStyle}>
            <DynamicFeatherIcon iconName="User" className="icon-theme iw-25 ih-25"/>
          </div>
          :
          <div className="user-img bg-size blur-up lazyloaded" style={imgStyle}></div>
        )
};

const JoinYearBookModal: FC<any> = ({ showModal, toggleModal, userDetails }) => {

  const [yearBookCode, setYearBookCode] = useState('');
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitInProcess, setIsSubmitInProcess] = useState(false);
  const [joinYbReqInfo, setJoinYbReqInfo] = useState([]);
  const [reqStatus, setReqStatus] = useState('');
  const [rejectMsg, setRejectMsg] = useState('');

  useEffect(() => {

    setYearBookCode ('');
    setErrors({});
    setReqStatus('');
    setRejectMsg('');

    const loadUserInfo = async () => {

      const info = await getJoinYearBookReqInfo();
      
      if(info && (info.length??0)) {
        
        setJoinYbReqInfo(info);

        if(info[0]?.request_status) {
          
          var req_status = (info[0]?.request_status??0) ? info[0]?.request_status : '';
          var rej_msg    = (info[0]?.reject_reason??0)  ? info[0]?.reject_reason  : '';
          
          setReqStatus(req_status);
          setRejectMsg(rej_msg);
        }
      }
    };
    
    if(showModal) {
      
      setErrors({});
      loadUserInfo();
    }
    
  },[showModal]);
    
  const validateForm = () => {
      
    let errors : any = {};
    
    if(!userDetails.id) {
      errors.yb_code = 'User Id not found...!!';
      setErrors(errors);
      document?.getElementById('yb_code')?.focus();
      return false;
    }
    
    if (yearBookCode?.trim() == '') {

      errors.yb_code = 'Year Book Code is required...!!';
      setErrors(errors);
      document?.getElementById('yb_code')?.focus();
      return false;
    } 

    setErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  };
  
  const formSubmitHandle = async (event: any) => {
  
    event.preventDefault();
  
    validateForm();
    
    if(isFormValid) {

      setIsSubmitInProcess(true);

      const res_data = await joinYearBook({user_id: userDetails.id, yb_code : yearBookCode});
      
      setIsSubmitInProcess(false);

      if(res_data?.status === 1) {

        toast.success(res_data?.message??'Successful !!');
        toggleModal()
      }
      else {
        
        if(res_data?.message??0) {

          let errors : any = {};
          errors.yb_code = res_data?.message;
          setErrors(errors);
          document?.getElementById('yb_code')?.focus();
        } 
        else {

          toast.error('Something went wrong...!!');
        }
      }
    }
  };
  

  const AcceptedRequest = () => {
    
    return <p className="text-primary pt-2">Your request has been Approved !!</p>
  }
  
  const PendingRequest = () => {

    return <div className="">
      <div className="text-success mb-1">Dear <strong>{userDetails?.u_name??'User'}</strong></div>
      <div className="text-success">
          Your request is Pending for Approval, You will be notified as soon as Co-Ordinator of Year Book responds!!
      </div>
      <div>
        <ul>
          {
            joinYbReqInfo.map((data:any, index) => (
              <li key={index}>
                <div className="post-panel">
                  <div className="post-wrapper">
                    <div className="post-title">
                      <div className="profile">
                        <Media>
                          <CoOrdinatorImg src={data?.coord_profile_img} />
                          <Media body>
                            <h5>{data?.coord_name}</h5>
                            <p className="mb-1 text-muted">{data?.coord_email}</p>
                            <p className="text-muted">{data?.coord_contact_no}</p>
                          </Media>
                        </Media>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))  
          }
        </ul>
      </div>
    </div>
  }
  
  const RejectedRequest = ({reject_reason} : any) => {

    return <div className="text-danger py-1">
      {
        (reject_reason??0) 
        ?
        <>
          <p>Your request has been rejected due to the following reason :</p>
          <p className="pb-1">{reject_reason}</p>
        </>
        :
        <p>Your request has been rejected !!</p> 
      }
      <p>However you can still send join request for another year book !!</p>
    </div>
  }

  return (
    <Modal isOpen={showModal} toggle={toggleModal} centered modalClassName="mobile-full-width" contentClassName="share-modal">
      <ModalHeader toggle={toggleModal}>
        Join Year Book
      </ModalHeader>
      <ModalBody style={{minHeight:'200px'}}>
        <div className="form-sec">
          {
            reqStatus == '' || reqStatus == 'R' 
            ?
            <>
              {
                reqStatus == 'R' ? <RejectedRequest reject_reason={rejectMsg} /> : null
              }
              {
                showModal 
                ? 
                <form className="theme-form form-sm">
                  <Row>
                    <Col md="12" className="form-group" style={{border:'none'}}>
                      <Label>Year Book Code</Label>
                      <Input type='text' id='yb_code' placeholder='Enter Year Book Code' defaultValue={yearBookCode} 
                        onChange={(event) => {setErrors({}); setYearBookCode(event.target.value);}} autoFocus 
                        autoComplete="off" />
                        {((errors as any)?.yb_code) && <p className="text-danger pt-1">{(errors as any)?.yb_code??''}</p>}
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12" className="form-group pt-4" style={{border:'none'}}>
                      
                    </Col>
                  </Row>
                </form>
                :
                null 
              }
            </>
            : 
            <div className="pt-1">
              {
                reqStatus == 'P' ? <PendingRequest /> : (
                  (
                    reqStatus == 'A' ? <AcceptedRequest /> 
                    : 'If you have been provided Year Book Code, Kindly Enter Code in the following box.' 
                ))
              }
            </div>
          }
        </div>
      </ModalBody>
      <ModalFooter>
        {
          isSubmitInProcess ? 
          <>
            <Button className='btn btn-solid' disabled>
              <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
              <span role="status"> Wait...</span>
            </Button>
          </> : 
          <>
            {
              reqStatus == '' || reqStatus == 'R' 
              ?
              <Button className='btn btn-solid' onClick={(event) => formSubmitHandle(event)}>Join</Button>
              :
              <Button className='btn btn-solid' onClick={toggleModal}>Close</Button>
            }
          </>
        }
      </ModalFooter>
    </Modal>
  );
};

export default JoinYearBookModal;
