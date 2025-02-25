"use client"; 
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { Container ,Spinner,Nav, NavItem, NavLink, TabContent, TabPane,Row,Col,Media } from "reactstrap";
import React,{  useState , useEffect } from "react";
import ReceivedTestimonial from "@/components/Dashboard/Yearbook/ReceivedTestimonial";
import WrittenTestimonial from "@/components/Dashboard/Yearbook/WrittenTestimonial";
import RequestedTestimonial from "@/components/Dashboard/Yearbook/RequestedTestimonial";
import SenderList from "@/components/Dashboard/Yearbook/SenderList";
import Coordinators from "@/components/Dashboard/Yearbook/Common/Coordinators";
import './App.css'; 
import { ImagePath } from "../../../utils/constant";
import { getTestimonialData } from "@/libs/testimonial/getTestimonial";
import { getUserAllDetails } from "@/libs/user/getUserAllDetails";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from 'react-toastify'
import { CircularProgressbar,buildStyles  } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css"; // Import styles

const TestimonialBox: React.FC = () => {
  
  const [activeTab, setActiveTab] = useState(1);     
  const [LoginUserData, setLoginUserData] = useState<any>(null);  
  const [Testimonial, setTestimonial] = useState<any[]>([]); 
  const [receivedTestimonials, setReceivedTestimonials] = useState<any[]>([]);
  const [isLoading,setIsLoading] = useState(true);
  const [SentTestimonialsCount, setSentTestimonialsCount] = useState(0)
  const [ReceivedTestimonialsCount, setReceivedTestimonialsCount] = useState(0)  
  
  const tabData:any = [
    { id: 1, label: "Received" , icon:"Copy"},
    { id: 2, label: "Write/Requests" , icon:"Edit2"},
    { id: 3, label: "Edit" ,icon:"Edit"},
    { id: 4, label: "Request Received",icon:"List"},
  ];  

  
  const fetchData = async () => {   

    let _loggedInUserDetail = await getUserAllDetails();    
    setLoginUserData(_loggedInUserDetail);
    let data = await getTestimonialData(_loggedInUserDetail.user_id, _loggedInUserDetail.yearbook_id ,_loggedInUserDetail.institution_id);  
    
    if (data) {
      let updatedTestimonial = [];
      setSentTestimonialsCount(data.sent_testimonials_count)
      setReceivedTestimonialsCount(data.received_testimonials_count)
      switch (activeTab) {
        case 1:
          updatedTestimonial = data.received_testimonials || [];
          break;
        case 2:
          updatedTestimonial = data.sender_list  || [];
          break;
        case 3:
          updatedTestimonial = data.written_testimonials || [];
          break;
        case 4:
          updatedTestimonial = data.received_testimonial_requests || [];
          break;
        default:
          updatedTestimonial = [];
      }
  
      setTestimonial(updatedTestimonial); 
      setReceivedTestimonials(data.received_testimonials || []); 
    }
  };
  
  useEffect(()=>{
    let isMounted = true;
    
    async function loadData() {

      if (isMounted) setTestimonial([]);
      
      setIsLoading(true);
      try 
      {
        await Promise.all([fetchData()]);          
      } 
      catch (error) {
        console.error("Error fetching data:", error);
        if (isMounted) setTestimonial([]);
      } 
      finally 
      {
        if (isMounted) setIsLoading(false);
      }
    }
    if(isMounted)
    { 
      loadData();
    }
    return ()=>{
      isMounted = false;
    };
  },[activeTab]);

  const onDragEnd = async(testimonial_result:any) => {

    if (!testimonial_result.destination) return;

    const reorderedItems = [...receivedTestimonials];
    const [movedItem] = reorderedItems.splice(testimonial_result.source.index, 1);
    reorderedItems.splice(testimonial_result.destination.index, 0, movedItem);
    
    setReceivedTestimonials(reorderedItems);

    try {
      const sortedTestimonialIds = reorderedItems.map(item => item.testimonial_from);

      const opt = { method : 'POST', headers : {'Accept': 'application/json', 'Content-Type': 'application/json',},  
      body: JSON.stringify({ sortedTestimonials: sortedTestimonialIds , LoginUserId : LoginUserData.user_id })}
    
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/testimonial/sort_order`, opt)
      const result = await response.json(); 
      console.log(result);
      if (result.status) {   
           toast.success(result.message, {
             position: 'top-right',
             style: { padding: '2px' }  
           })   
           setReceivedTestimonials?.(reorderedItems)    
           if(activeTab == 1) setTestimonial?.(reorderedItems)    
           
         } else {          
              console.error(result.message)
              toast.error(result.message, {
               position: 'top-right',
               hideProgressBar: false
             })   
         }
    } catch (error) {
      console.error(error)
           toast.error('Unable to update!', {
             position: 'top-right',
             hideProgressBar: false
           })   
    }
  };


  return (
    <>    
    <Row>
      <Col lg={8}>
        <div className="friend-list-box section-b-space testimonials">
          <div className="card-title p-0">          
             <Nav tabs className="w-100">          
              {tabData.map(({ id, label ,icon}:any) => (
                <NavItem key={id} className="w-25">
                  <NavLink
                    className={activeTab === id ? "active nav-link gap-2 text-dark" : "nav-link gap-2"}
                    onClick={() => setActiveTab(id)}>
                    <DynamicFeatherIcon iconName={icon} className="icon-dark iw-16 ih-16 "/>{label}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>   
          </div>
          <Container fluid>           
            <TabContent activeTab={activeTab}>
              <TabPane tabId={activeTab} className="Choose-photo-modal">                   
              {isLoading ? (                    
                    <div className="text-center my-4 p-5">
                      <Spinner color="info">Loading...</Spinner>
                    </div>
                  ) : (                    
                    <>
                      {activeTab === 1 && <ReceivedTestimonial ReceivedTestimonial={Testimonial} setData={fetchData} activeTab={activeTab} LoginUserData={LoginUserData}/>}
                      {activeTab === 2 && <SenderList SenderList={Testimonial} setData={fetchData} activeTab={activeTab} LoginUserId={LoginUserData.user_id} LoginUserData={LoginUserData}/>}
                      {activeTab === 3 && <WrittenTestimonial WrittenTestimonial={Testimonial} setData={fetchData} activeTab={activeTab} LoginUserId={LoginUserData.user_id} LoginUserData={LoginUserData}/>}
                      {activeTab === 4 && <RequestedTestimonial RequestedTestimonial={Testimonial} setData={fetchData} activeTab={activeTab} LoginUserId={LoginUserData.user_id} LoginUserData={LoginUserData}/>}
                    </>
                )}                
              </TabPane>       
            </TabContent>   
          </Container>
        </div>
      </Col>
      <Col lg={4}  style={{ marginTop: "-18px" }}>     

        <Coordinators />   
         
        <div className="page-list mt-3">
          <div className="card-title p-3">
            <h4>Testimonial Sequencing </h4>      
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="testimonials-list">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="list-content"
                  style={{
                    maxHeight: "500px",
                    overflowY: "auto",
                    overflowX: "hidden",
                    border: "1px solid #ddd",
                    padding: "10px",
                  }}
                >
                  {receivedTestimonials.length === 0 ? (
                    <div className="text-center my-4 p-5">
                      <Spinner color="info">Loading...</Spinner>
                    </div>
                  ) : (
                    <ul>
                      {receivedTestimonials.map((data, index) => (
                        <Draggable key={data.id} draggableId={data.id.toString()} index={index}>
                          {(provided) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                background: "white",
                                padding: "10px",
                                margin: "10px 0",
                                borderRadius: "5px",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                                display: "flex",
                                alignItems: "center",
                                gap: "11px",
                                ...provided.draggableProps.style,
                              }}
                            >
                              <Media>
                                <div
                                  className="img-part bg-size blur-up lazyloaded"
                                  style={{
                                    backgroundImage: `url("${ImagePath}/user.jpg")`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center center",
                                    backgroundRepeat: "no-repeat",
                                    display: "block",
                                    width: "50px",
                                    height: "50px",
                                    borderRadius: "50%",
                                  }}
                                />
                                <Media body>
                                  <h4 style={{ display: "inline-flex", alignItems: "center", gap: "11px" }}>
                                    {data.testimonial_from_name}
                                  </h4>
                                  <h6>{data.testimonial_from_email}</h6>
                                </Media>
                              </Media>
                              <div className='favorite-btn'>
                                <DynamicFeatherIcon iconName="CheckCircle"   className={`iw-16 ih-16 ml-5 stroke-width-3 ${data.is_active === 'Y' ? 'text-info' : 'text-gray'}`}/>
                              </div>
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>   

        <div className="page-list section-t-space mt-3">              
          <div className="card-title p-3">
            <h4>Testimonial Statistics</h4>      
          </div>   
          <div className="list-content">      
            <ul className="list-unstyled text-center"> 
              <li>
              <Row className="justify-content-center">
                <Col lg={6} md={6} sm={6} xs={6} className="d-flex flex-column justify-content-center align-items-center">                
                    <CircularProgressbar 
                    value={ReceivedTestimonialsCount} className="w-50"
                    text={`${ReceivedTestimonialsCount}`}
                    styles={buildStyles({
                      pathTransitionDuration: 0.5, 
                      pathColor: "#4db8ff", 
                      textColor: "#4db8ff", 
                      trailColor: "#d6d6d6",
                    })}
                    />
                    <p className="mt-2 text-center" style={{ color: "#4db8ff", fontWeight: "bold" }}>Received Testimonial</p>
                </Col>
                <Col lg={6} md={6} sm={6} xs={6} className="d-flex flex-column justify-content-center align-items-center">
                    <CircularProgressbar
                      value={SentTestimonialsCount} className="w-50"
                      text={`${SentTestimonialsCount}`}
                      styles={buildStyles({
                        pathTransitionDuration: 0.5, 
                        pathColor: "rgb(212 42 40)", 
                        textColor: "rgb(212 42 40)", 
                        trailColor: "#d6d6d6",
                    })}
                    />
                    <p className="mt-2 text-center" style={{ color: "rgb(212 42 40)", fontWeight: "bold" }}>Sent Testimonial</p>
                </Col>
              </Row>
            </li>
            </ul>
          </div>
        </div>  
      </Col>
      </Row>
    </>
  );
};

export default TestimonialBox;
