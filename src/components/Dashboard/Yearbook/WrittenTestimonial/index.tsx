"use client";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { FC , useState, useEffect} from "react";
import { Col, Row , Media , Input } from "reactstrap";
import CustomImage from "../../../../Common/CustomImage";
import { ImagePath, Href,Share,Comment } from "../../../../utils/constant";
import ShareModal from "@/Common/CommonPostReact/ShareModal";
import TestimonialDropdown from "../Common/TestimonialDropdown"
import {isYearbookExpired ,timeAgo} from '../../../../utils/common';

interface WrittenTestimonialInterface {
  WrittenTestimonial?: any[];
  setData?: React.Dispatch<React.SetStateAction<any[]>>;  
  activeTab:number;
  LoginUserId:any;
  LoginUserData:any;
}

const WrittenTestimonial: FC<WrittenTestimonialInterface> = ({WrittenTestimonial = [],setData,activeTab,LoginUserId,LoginUserData}) => {
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal(!showModal);
  const [searchQuery, setSearchQuery] = useState(""); // State for search input
  
  const filteredTestimonials = WrittenTestimonial.filter((testimonial) =>  
    (testimonial.testimonial_to_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const ShareAsPost = (id?: string) => {
    alert(`Sharing post with ID: ${id}`);
  };

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
                                {res_testimonial.written_hashtag ? (<p><b>{res_testimonial.written_hashtag}</b></p>) : null}  
                                <a href="#">{res_testimonial.testimonial_to_name}</a>                                                                
                              </h5>            
                              <br />
                              <h6  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}> <DynamicFeatherIcon iconName="Mail" className="iw-16 ih-14" /> {res_testimonial.testimonial_to_email} • {timeAgo(res_testimonial.created)}</h6>
                            </Media>
                          </Media>
                        </div>             
                        {!isYearbookExpired(LoginUserData?.yearbook_last_edit_date) ? (   
                          <TestimonialDropdown  setData={setData} LoginUserId={LoginUserId}  activeTab={activeTab} {...res_testimonial} LoginUserData={LoginUserData}/>                      
                        ):null}
                      </div>
                      <div className="post-details">
                        <div className="detail-box">
                          <h4>{res_testimonial.message}</h4>                    
                        </div>      
                        <div className="detail-box">                            
                            <>
                            <div className="post-react w-25">
                            <ul>       
                              {/* Show comment link if postId exists and showTimeline is "Y" */}
                              {res_testimonial.post_id && LoginUserData.show_timeline === "Y" ? (
                                <li>
                                  <a href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/users/dashboard/${res_testimonial.post_id}/0`}>
                                  <DynamicFeatherIcon iconName="Share2" className="iw-16 ih-16" />{Comment}
                                  </a>
                                </li>
                              ):null} 
                              {/* Show share button if testimonialIdPost is empty and showTimeline is "Y" */}                              
                              {!res_testimonial.testimonial_id_post && LoginUserData.show_timeline === "Y" ? (
                                <li onClick={() => ShareAsPost(res_testimonial.id)}> 
                                  <a href={Href} >
                                    <DynamicFeatherIcon iconName="Share2" className="iw-16 ih-16" />{Share}
                                  </a>
                                </li>
                              ):null}
                            </ul>
                            </div>  
                            <ShareModal showModal={showModal} toggleModal={toggleModal}/>
                            </>
                        </div>        
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

export default WrittenTestimonial;
