"use client";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { FC , useState, useEffect} from "react";
import { Col, Row , Media , Input } from "reactstrap";
import CustomImage from "../../../../Common/CustomImage";
import { ImagePath, Href,Share } from "../../../../utils/constant";
import {isYearbookExpired } from '../../../../utils/common';
import TestimonialDropdown from "../Common/TestimonialDropdown";

interface SenderListInterface {
  SenderList?: any[];
  setData?: React.Dispatch<React.SetStateAction<any[]>>;  
  activeTab:number;
  LoginUserId:any;
  LoginUserData:any;
}

const SenderList: FC<SenderListInterface> = ({SenderList = [],setData,activeTab,LoginUserId,LoginUserData}) => {
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal(!showModal);
  const [searchQuery, setSearchQuery] = useState(""); // State for search input

  
  const filteredTestimonials = SenderList.filter((testimonial) =>  
    (testimonial.first_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Row>     
      <Col  className="content-center bg-transparent">        
        <div className="right-setting mt-3 d-flex justify-content-end">        
            <div className="search-bar input-style icon-left search-inmenu p-">
              <DynamicFeatherIcon iconName="Search" className="iw-16 ih-16 icon icon-theme"/>
              <Input type="text" placeholder="search member..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}/>
            </div>               
          </div>                      
          <div className="post-panel infinite-loader-sec">   
            {filteredTestimonials.length > 0 ? (
                filteredTestimonials.map((res_testimonial, index) => (
                  <div key={index}>            
                    <div className="post-wrapper col-grid-box section-t-space d-block bg-none shadow-none">
                      <div className="post-title">
                        <div className="profile">
                          <Media>
                            <div className="user-img bg-size blur-up lazyloaded">
                              <CustomImage
                                src={`${ImagePath}/user-sm/12.jpg`}
                                className="img-fluid blur-up lazyload bg-img"
                                alt="user"
                              />
                            </div>
                            <Media body>             
                              <h5 style={{ display: "inline-flex", alignItems: "center", gap: "11px" }}>       
                                <a href="#">{res_testimonial.first_name} </a>
                                { res_testimonial.req_sent > 0 && (
                                  <span className="text-success"><b>[Request Sent]</b></span>
                                )}
                              </h5>            
                              <br />
                              <h6  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}> <DynamicFeatherIcon iconName="Mail" className="iw-16 ih-14" /> {res_testimonial.email} </h6>
                            </Media>
                          </Media>
                        </div>     
                        {!isYearbookExpired(LoginUserData?.yearbook_last_edit_date) &&   
                          ((res_testimonial.can_receive_testimonials && LoginUserData.show_write_link_in_write_request_tab === "Y") || 
                            (LoginUserData.can_receive_testimonials && !res_testimonial.req_sent)) ? (         
                              <TestimonialDropdown  setData={setData} LoginUserId={LoginUserId} activeTab={activeTab} {...res_testimonial} LoginUserData={LoginUserData} />                          
                        ):null}
                      </div>                     
                    </div>                               
                    {index !== filteredTestimonials.length - 1 && <hr />}
                  </div>
             ))
            ) : (
              <div className="post-wrapper col-grid-box section-t-space d-block bg-none">
                <div className="post-title">               
                  No Record Found 
                </div>
            </div> 
          )}
          </div>
      </Col>
    </Row>
  );
};

export default SenderList;
